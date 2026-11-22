import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

export async function servicosRoutes(app: FastifyInstance) {
    // Listar todos os servicos ativos para o Totem
    app.get('/api/servicos', async (request, reply) => {
        const servicos = await prisma.servico.findMany({
            where: { ativo: true },
            orderBy: { nome: 'asc' },
        });
        return reply.status(200).send(servicos);
    });

    // Cadastrar novo servico
    app.post('/api/servicos', async (request, reply) => {
        const createServicoSchema = z.object({
            nome: z.string().min(3),
            sigla: z.string().length(3).toUpperCase(),
            tempoMedio: z.number().int().positive().default(5),
        });

        const data = createServicoSchema.parse(request.body);

        const existe = await prisma.servico.findUnique({
            where: { sigla: data.sigla },
        });

        if (existe) {
            return reply.status(409).send({ error: 'Sigla de serviço já cadastrada.' });
        }

        const novo = await prisma.servico.create({ data });
        return reply.status(201).send(novo);
    });
}