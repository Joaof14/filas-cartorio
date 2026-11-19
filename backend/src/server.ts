import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';

dotenv.config();

const port = Number(process.env.PORT) || 3333;
const host = process.env.HOST || '0.0.0.0';

export async function buildApp() {
    const app = Fastify({ logger: true });

    await app.register(cors, {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    });

    app.get('/health', async () => ({
        status: 'UP',
        database: 'CONNECTED',
        timestamp: new Date().toISOString(),
    }));

    return app;
}

async function start() {
    const app = await buildApp();
    try {
        await app.listen({ port, host });
        console.log(`🚀 API do Cartório rodando em http://${host}:${port}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}

if (process.env.NODE_ENV !== 'test') {
    start();
}