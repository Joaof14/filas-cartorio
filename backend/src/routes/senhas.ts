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

      try {
        const io = getIO();
        io.emit('senha:emitida', senha);
      } catch (wsError) {
        app.log.warn('Socket.IO nao conectado para emissao.');
      }

      return reply.status(201).send(senha);
    } catch (err: any) {
      return reply.status(404).send({ error: err.message || 'Erro ao emitir senha.' });
    }
  });

  // POST /api/senhas/chamar — Acionamento da chamada pelo guiche
  app.post('/api/senhas/chamar', async (request, reply) => {
    const chamarSchema = z.object({
      guicheId: z.string().uuid(),
      senhaId: z.string().uuid().optional(),
    });

    const parsed = chamarSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Dados inválidos para chamada de senha.',
        details: parsed.error.format(),
      });
    }

    try {
      const chamada = await senhaService.chamarSenha(parsed.data);

      // Dispara o evento de chamada em tempo real na rede local
      try {
        const io = getIO();
        // Emite para a sala de monitores e geral
        io.emit('senha:chamada', chamada);
      } catch (wsError) {
        app.log.warn('Socket.IO nao conectado para broadcast de chamada.');
      }

      return reply.status(200).send(chamada);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message || 'Erro ao chamar senha.' });
    }
  });

  // GET /api/senhas/ultimas-chamadas — Historico para recuperar o monitor
  app.get('/api/senhas/ultimas-chamadas', async (request, reply) => {
    const chamadas = await senhaService.listarUltimasChamadas(5);
    return reply.status(200).send(chamadas);
  });

  // GET /api/senhas/hoje — Listar historico do dia
  app.get('/api/senhas/hoje', async (request, reply) => {
    const senhas = await senhaService.listarSenhasDoDia();
    return reply.status(200).send(senhas);
  });
}
