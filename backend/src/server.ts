import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { servicosRoutes } from './routes/servicos.js';
import { guichesRoutes } from './routes/guiches.js';

dotenv.config();

const port = Number(process.env.PORT) || 3333;
const host = process.env.HOST || '0.0.0.0';

export async function buildApp() {
    const app = Fastify({ logger: true });

    await app.register(cors, {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    });

    // Rota de Saude
    app.get('/health', async () => ({
        status: 'UP',
        database: 'CONNECTED',
        timestamp: new Date().toISOString(),
    }));

    // Registro das Rotas da Sprint 1
    await app.register(servicosRoutes);
    await app.register(guichesRoutes);

    return app;
}

async function start() {
    const app = await buildApp();
    try {
        await app.listen({ port, host });
        console.log(`\n🚀 API do Cartório rodando em http://${host}:${port}`);
        console.log(`📋 Serviços em: http://${host}:${port}/api/servicos`);
        console.log(`🚪 Guichês em: http://${host}:${port}/api/guiches\n`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}

if (process.env.NODE_ENV !== 'test') {
    start();
}