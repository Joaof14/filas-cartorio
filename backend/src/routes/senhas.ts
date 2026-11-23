import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { SenhaService } from '../services/senha.service.js';
import { getIO } from '../lib/socket.js';

export async function senhasRoutes(app: FastifyInstance) {
  const senhaService = new SenhaService();

  // POST /api/senhas/emitir — Retirada de senha pelo Totem
  app.post('/api/senhas/emitir', async (request, reply) => {
    const emitirSchema = z.object({
      servicoId: z.string().uuid(),
      tipoPrioridade: z.enum(['GERAL', 'PRIORITARIA']),
    });

    const parsed = emitirSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Dados inválidos para emissão de senha.',
        details: parsed.error.format(),
      });
    }

    try {
      const senha = await senhaService.emitirSenha(parsed.data);

      // Dispara notificacao em tempo real via Socket.IO para os monitores e guiches
      try {
        const io = getIO();
        io.emit('senha:emitida', senha);
      } catch (wsError) {
        app.log.warn('Socket.IO nao conectado para emissao do evento, continuando HTTP.');
      }

      return reply.status(201).send(senha);
    } catch (err: any) {
      return reply.status(404).send({ error: err.message || 'Erro ao emitir senha.' });
    }
  });

  // GET /api/senhas/hoje — Listar historico do dia
  app.get('/api/senhas/hoje', async (request, reply) => {
    const senhas = await senhaService.listarSenhasDoDia();
    return reply.status(200).send(senhas);
  });
}
