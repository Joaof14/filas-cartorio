import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { servicosRoutes } from './routes/servicos.js';
import { guichesRoutes } from './routes/guiches.js';
import { senhasRoutes } from './routes/senhas.js';
import { initSocketIO } from './lib/socket.js';
import { atendimentoRoutes } from './routes/atendimento.js';

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

  // Registro das Rotas da Aplicacao
  await app.register(servicosRoutes);
  await app.register(guichesRoutes);
  await app.register(senhasRoutes);
  await app.register(atendimentoRoutes); 

  return app;
}

async function start() {
  const app = await buildApp();

  try {
    // Inicializa o servidor Fastify e o HTTP nativo
    await app.ready();
    const server = app.server;

    // Inicializa o Socket.IO acoplado ao servidor HTTP
    initSocketIO(server);

    await app.listen({ port, host });
    console.log(`\n🚀 API do Cartório + WebSockets rodando em: http://${host}:${port}`);
    console.log(`🎫 Emissão de senhas disponível em: POST http://${host}:${port}/api/senhas/emitir\n`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  start();
}

