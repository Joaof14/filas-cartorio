import { TipoPrioridade } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

interface EmitirSenhaDTO {
  servicoId: string;
  tipoPrioridade: TipoPrioridade;
}

export class SenhaService {
  /**
   * Emite uma nova senha com numeracao sequencial atomica por servico no dia
   */
  async emitirSenha({ servicoId, tipoPrioridade }: EmitirSenhaDTO) {
    // 1. Validar se o servico existe e esta ativo
    const servico = await prisma.servico.findUnique({
      where: { id: servicoId },
    });

    if (!servico || !servico.ativo) {
      throw new Error('Serviço informado não existe ou está inativo no cartório.');
    }

    // 2. Definir o inicio do dia corrente (00:00:00)
    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0);

    // 3. Executar transacao atomica para calcular o proximo sequencial
    const novaSenha = await prisma.$transaction(async (tx) => {
      // Conta quantas senhas deste mesmo servico e prioridade foram emitidas hoje
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
        include: {
          servico: true,
        },
      });
    });

    return novaSenha;
  }

  /**
   * Lista senhas emitidas hoje
   */
  async listarSenhasDoDia() {
    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0);

    return prisma.senha.findMany({
      where: {
        createdAt: { gte: inicioDoDia },
      },
      include: { servico: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
