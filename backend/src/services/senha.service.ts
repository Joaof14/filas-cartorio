import { TipoPrioridade, StatusSenha } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

interface EmitirSenhaDTO {
  servicoId: string;
  tipoPrioridade: TipoPrioridade;
}

interface ChamarSenhaDTO {
  guicheId: string;
  senhaId?: string; // Opcional: se nao informado, pega a proxima da fila
}

export class SenhaService {
  async emitirSenha({ servicoId, tipoPrioridade }: EmitirSenhaDTO) {
    const servico = await prisma.servico.findUnique({
      where: { id: servicoId },
    });

    if (!servico || !servico.ativo) {
      throw new Error('Serviço informado não existe ou está inativo no cartório.');
    }

    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0);

    return prisma.$transaction(async (tx) => {
      const totalHoje = await tx.senha.count({
        where: {
          servicoId,
          tipoPrioridade,
          createdAt: { gte: inicioDoDia },
        },
      });

      const proximoSequencial = totalHoje + 1;
      const letraTipo = tipoPrioridade === 'PRIORITARIA' ? 'P' : 'G';
      const sequencialFormatado = String(proximoSequencial).padStart(3, '0');
      const codigoFormatado = `${servico.sigla}-${letraTipo}${sequencialFormatado}`;

      return tx.senha.create({
        data: {
          codigo: codigoFormatado,
          numeroSequencial: proximoSequencial,
          tipoPrioridade,
          status: 'AGUARDANDO',
          servicoId,
        },
        include: { servico: true },
      });
    });
  }

  /**
   * Realiza a chamada da proxima senha disponivel para um determinado guiche
   */
  async chamarSenha({ guicheId, senhaId }: ChamarSenhaDTO) {
    const guiche = await prisma.guiche.findUnique({
      where: { id: guicheId },
    });

    if (!guiche || !guiche.ativo) {
      throw new Error('Guichê informado não existe ou está desativado.');
    }

    return prisma.$transaction(async (tx) => {
      let senhaAlvo;

      if (senhaId) {
        senhaAlvo = await tx.senha.findUnique({
          where: { id: senhaId },
          include: { servico: true },
        });
      } else {
        // Busca a primeira senha em espera (Prioritaria tem preferencia na ordenacao)
        senhaAlvo = await tx.senha.findFirst({
          where: { status: 'AGUARDANDO' },
          orderBy: [
            { tipoPrioridade: 'desc' }, // PRIORITARIA vem antes de GERAL
            { createdAt: 'asc' },        // Mais antiga primeiro
          ],
          include: { servico: true },
        });
      }

      if (!senhaAlvo) {
        throw new Error('Não há senhas aguardando atendimento na fila do cartório.');
      }

      const agora = new Date();

      // Atualiza o status da senha para CHAMANDO
      const senhaAtualizada = await tx.senha.update({
        where: { id: senhaAlvo.id },
        data: {
          status: 'CHAMANDO',
          chamadaEm: agora,
        },
        include: { servico: true },
      });

      // Cria ou vincula o registro de atendimento ao guiche
      await tx.atendimento.create({
        data: {
          senhaId: senhaAtualizada.id,
          guicheId: guiche.id,
          inicioEm: agora,
        },
      });

      return {
        ...senhaAtualizada,
        guiche: {
          id: guiche.id,
          numero: guiche.numero,
          nome: guiche.nome,
        },
      };
    });
  }

  /**
   * Recupera as ultimas senhas chamadas para exibicao no Monitor TV
   */
  async listarUltimasChamadas(limite: number = 5) {
    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0);

    const senhas = await prisma.senha.findMany({
      where: {
        createdAt: { gte: inicioDoDia },
        status: { in: ['CHAMANDO', 'EM_ATENDIMENTO', 'FINALIZADA'] },
        chamadaEm: { not: null },
      },
      include: {
        servico: true,
        atendimentos: {
          include: { guiche: true },
          orderBy: { inicioEm: 'desc' },
          take: 1,
        },
      },
      orderBy: { chamadaEm: 'desc' },
      take: limite,
    });

    return senhas.map((s) => ({
      id: s.id,
      codigo: s.codigo,
      tipoPrioridade: s.tipoPrioridade,
      status: s.status,
      chamadaEm: s.chamadaEm,
      servico: s.servico,
      guiche: s.atendimentos[0]?.guiche || { numero: 1, nome: 'Guichê Geral' },
    }));
  }

  async listarSenhasDoDia() {
    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0);

    return prisma.senha.findMany({
      where: { createdAt: { gte: inicioDoDia } },
      include: { servico: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
