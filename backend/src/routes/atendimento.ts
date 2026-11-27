import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { AtendimentoService } from '../services/atendimento.service.js';
import { getIO } from '../lib/socket.js';
import { prisma } from '../lib/prisma.js';

export async function atendimentoRoutes(app: FastifyInstance) {
  const atendimentoService = new AtendimentoService();

  // POST /api/atendimento/chamar-proximo
  app.post('/api/atendimento/chamar-proximo', async (request, reply) => {
    const schema = z.object({ guicheId: z.string().uuid() });
    const parsed = schema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({ error: 'guicheId inválido.' });
    }

    try {
      const chamada = await atendimentoService.chamarProximo(parsed.data.guicheId);

      // Dispara broadcast no Socket.IO para o Monitor TV e guiches
      try {
        const io = getIO();
        io.emit('senha:chamada', chamada);
      } catch (wsError) {
        app.log.warn('Socket.IO nao conectado para broadcast de chamada.');
      }

      return reply.status(200).send(chamada);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  // POST /api/atendimento/rechamar
  app.post('/api/atendimento/rechamar', async (request, reply) => {
    const schema = z.object({
      senhaId: z.string().uuid(),
      guicheNumero: z.number().int().positive(),
    });
    const parsed = schema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({ error: 'Dados inválidos para rechamada.' });
    }

    try {
      const senha = await prisma.senha.findUnique({
        where: { id: parsed.data.senhaId },
        include: { servico: true },
      });

      if (!senha) return reply.status(404).send({ error: 'Senha não encontrada.' });

      const chamadaPayload = {
        ...senha,
        guiche: { numero: parsed.data.guicheNumero },
        chamadaEm: new Date(),
      };

      try {
        const io = getIO();
        io.emit('senha:chamada', chamadaPayload);
      } catch (e) {}

      return reply.status(200).send({ message: 'Rechamada disparada com sucesso.' });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  // POST /api/atendimento/iniciar
  app.post('/api/atendimento/iniciar', async (request, reply) => {
    const schema = z.object({ senhaId: z.string().uuid() });
    const parsed = schema.safeParse(request.body);

    if (!parsed.success) return reply.status(400).send({ error: 'senhaId inválido.' });

    try {
      const atualizada = await atendimentoService.iniciarAtendimento(parsed.data.senhaId);
      return reply.status(200).send(atualizada);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  // POST /api/atendimento/finalizar
  app.post('/api/atendimento/finalizar', async (request, reply) => {
    const schema = z.object({ senhaId: z.string().uuid() });
    const parsed = schema.safeParse(request.body);

    if (!parsed.success) return reply.status(400).send({ error: 'senhaId inválido.' });

    try {
      const finalizada = await atendimentoService.finalizarAtendimento(parsed.data.senhaId);
      return reply.status(200).send(finalizada);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  // POST /api/atendimento/ausente
  app.post('/api/atendimento/ausente', async (request, reply) => {
    const schema = z.object({ senhaId: z.string().uuid() });
    const parsed = schema.safeParse(request.body);

    if (!parsed.success) return reply.status(400).send({ error: 'senhaId inválido.' });

    try {
      const ausente = await atendimentoService.marcarAusente(parsed.data.senhaId);
      return reply.status(200).send(ausente);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  // POST /api/atendimento/transferir
  app.post('/api/atendimento/transferir', async (request, reply) => {
    const schema = z.object({
      senhaId: z.string().uuid(),
      novoServicoId: z.string().uuid(),
    });
    const parsed = schema.safeParse(request.body);

    if (!parsed.success) return reply.status(400).send({ error: 'Dados inválidos para transferência.' });

    try {
      const transferida = await atendimentoService.transferirSenha(parsed.data.senhaId, parsed.data.novoServicoId);
      return reply.status(200).send(transferida);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  // GET /api/atendimento/estatisticas-fila
  app.get('/api/atendimento/estatisticas-fila', async (request, reply) => {
    const stats = await atendimentoService.obterEstatisticasFila();
    return reply.status(200).send(stats);
  });
}
