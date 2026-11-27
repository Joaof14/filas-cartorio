import { prisma } from '../lib/prisma.js';

export class AtendimentoService {
  /**
   * Chama a proxima senha disponivel com protecao atomica contra concorrencia
   */
  async chamarProximo(guicheId: string) {
    const guiche = await prisma.guiche.findUnique({
      where: { id: guicheId },
    });

    if (!guiche || !guiche.ativo) {
      throw new Error('Guichê informado não existe ou está desativado.');
    }

    return prisma.$transaction(async (tx) => {
      // Busca a proxima senha da fila (Prioritaria tem preferencia sobre Geral)
      const proximaSenha = await tx.senha.findFirst({
        where: { status: 'AGUARDANDO' },
        orderBy: [
          { tipoPrioridade: 'desc' }, // PRIORITARIA primeiro
          { createdAt: 'asc' },        // Fila por ordem de chegada
        ],
        include: { servico: true },
      });

      if (!proximaSenha) {
        throw new Error('Não há senhas aguardando atendimento na fila do cartório.');
      }

      const agora = new Date();

      // Transicao atomica para CHAMANDO
      const senhaAtualizada = await tx.senha.update({
        where: { id: proximaSenha.id },
        data: {
          status: 'CHAMANDO',
          chamadaEm: agora,
        },
        include: { servico: true },
      });

      // Cria o registro de atendimento alocado ao guiche
      const atendimento = await tx.atendimento.create({
        data: {
          senhaId: senhaAtualizada.id,
          guicheId: guiche.id,
          inicioEm: agora,
        },
        include: { guiche: true },
      });

      return {
        ...senhaAtualizada,
        atendimentoId: atendimento.id,
        guiche: {
          id: guiche.id,
          numero: guiche.numero,
          nome: guiche.nome,
        },
      };
    });
  }

  /**
   * Inicia o atendimento quando o cidadao se senta ao guiche
   */
  async iniciarAtendimento(senhaId: string) {
    const senha = await prisma.senha.findUnique({
      where: { id: senhaId },
    });

    if (!senha) throw new Error('Senha não encontrada.');
    if (senha.status !== 'CHAMANDO') {
      throw new Error(`A senha deve estar em status CHAMANDO para iniciar atendimento. Status atual: ${senha.status}`);
    }

    return prisma.senha.update({
      where: { id: senhaId },
      data: { status: 'EM_ATENDIMENTO' },
      include: { servico: true },
    });
  }

  /**
   * Finaliza o atendimento no guiche
   */
  async finalizarAtendimento(senhaId: string) {
    const agora = new Date();

    return prisma.$transaction(async (tx) => {
      const senha = await tx.senha.findUnique({ where: { id: senhaId } });
      if (!senha) throw new Error('Senha não encontrada.');

      // Atualiza a data de fim no ultimo atendimento do guiche
      const ultimoAtendimento = await tx.atendimento.findFirst({
        where: { senhaId },
        orderBy: { inicioEm: 'desc' },
      });

      if (ultimoAtendimento) {
        await tx.atendimento.update({
          where: { id: ultimoAtendimento.id },
          data: { fimEm: agora },
        });
      }

      return tx.senha.update({
        where: { id: senhaId },
        data: { status: 'FINALIZADA' },
        include: { servico: true },
      });
    });
  }

  /**
   * Registra a ausencia do cidadao que nao compareceu
   */
  async marcarAusente(senhaId: string) {
    return prisma.$transaction(async (tx) => {
      const senha = await tx.senha.findUnique({ where: { id: senhaId } });
      if (!senha) throw new Error('Senha não encontrada.');

      return tx.senha.update({
        where: { id: senhaId },
        data: { status: 'AUSENTE' },
        include: { servico: true },
      });
    });
  }

  /**
   * Transfere uma senha para outro servico cartorario mantendo seu tipo de prioridade
   */
  async transferirSenha(senhaId: string, novoServicoId: string) {
    const servico = await prisma.servico.findUnique({ where: { id: novoServicoId } });
    if (!servico || !servico.ativo) {
      throw new Error('Serviço de destino inválido ou inativo.');
    }

    return prisma.senha.update({
      where: { id: senhaId },
      data: {
        servicoId: novoServicoId,
        status: 'AGUARDANDO', // Retorna para a fila do novo servico
      },
      include: { servico: true },
    });
  }

  /**
   * Estatisticas da fila em tempo real para os guiches
   */
  async obterEstatisticasFila() {
    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0);

    const [totalAguardando, prioritarias, gerais] = await Promise.all([
      prisma.senha.count({
        where: { status: 'AGUARDANDO', createdAt: { gte: inicioDoDia } },
      }),
      prisma.senha.count({
        where: { status: 'AGUARDANDO', tipoPrioridade: 'PRIORITARIA', createdAt: { gte: inicioDoDia } },
      }),
      prisma.senha.count({
        where: { status: 'AGUARDANDO', tipoPrioridade: 'GERAL', createdAt: { gte: inicioDoDia } },
      }),
    ]);

    return { totalAguardando, prioritarias, gerais };
  }
}
