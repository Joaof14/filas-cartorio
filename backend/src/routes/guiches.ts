import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

export async function guichesRoutes(app: FastifyInstance) {
    // Listar guiches ativos
    app.get('/api/guiches', async (request, reply) => {
        const guiches = await prisma.guiche.findMany({
            where: { ativo: true },
            orderBy: { numero: 'asc' },
        });
        return reply.status(200).send(guiches);
    });

    // Criar guiche
    app.post('/api/guiches', async (request, reply) => {
        const createGuicheSchema = z.object({
            numero: z.number().int().positive(),
            nome: z.string().min(3),
        });

        const data = createGuicheSchema.parse(request.body);

        const existe = await prisma.guiche.findUnique({
            where: { numero: data.numero },
        });

        if (existe) {
            return reply.status(409).send({ error: 'Número de guichê já existente.' });
        }

        const novo = await prisma.guiche.create({ data });
        return reply.status(201).send(novo);
    });
}