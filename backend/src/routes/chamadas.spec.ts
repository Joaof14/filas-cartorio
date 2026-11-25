import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { buildApp } from '../server.js';
import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js'; 

describe('Suíte de Testes — Chamadas de Senha e Notificação no Monitor', () => {
  let app: FastifyInstance;
  let servicoId: string;
  let guicheId: string;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
    await prisma.senha.deleteMany({
      where: { status: 'AGUARDANDO' },
    });
    // Obter servico e guiche validos
    const resServicos = await supertest(app.server).get('/api/servicos');
    servicoId = resServicos.body[0].id;

    const resGuiches = await supertest(app.server).get('/api/guiches');
    guicheId = resGuiches.body[0].id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/senhas/chamar — Deve chamar a proxima senha e mudar status para CHAMANDO', async () => {
    // 1. Emite uma nova senha para teste
    await supertest(app.server)
      .post('/api/senhas/emitir')
      .send({ servicoId, tipoPrioridade: 'GERAL' });

    // 2. Chama a senha usando o guiche
    const response = await supertest(app.server)
      .post('/api/senhas/chamar')
      .send({ guicheId });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('codigo');
    expect(response.body.status).toBe('CHAMANDO');
    expect(response.body).toHaveProperty('chamadaEm');
    expect(response.body.guiche).toHaveProperty('numero');
  });

  it('POST /api/senhas/chamar — Deve priorizar senhas PRIORITARIAS sobre GERAIS', async () => {
    // Emite uma senha geral
    await supertest(app.server)
      .post('/api/senhas/emitir')
      .send({ servicoId, tipoPrioridade: 'GERAL' });

    // Emite uma senha prioritaria logo em seguida
    const resPrioritaria = await supertest(app.server)
      .post('/api/senhas/emitir')
      .send({ servicoId, tipoPrioridade: 'PRIORITARIA' });

    // O sistema deve chamar primeiro a prioritaria
    const response = await supertest(app.server)
      .post('/api/senhas/chamar')
      .send({ guicheId });

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(resPrioritaria.body.id);
    expect(response.body.tipoPrioridade).toBe('PRIORITARIA');
  });

  it('GET /api/senhas/ultimas-chamadas — Deve listar chamadas recentes com dados do guiche', async () => {
    const response = await supertest(app.server).get('/api/senhas/ultimas-chamadas');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(1);

    const primeira = response.body[0];
    expect(primeira).toHaveProperty('codigo');
    expect(primeira).toHaveProperty('servico');
    expect(primeira).toHaveProperty('guiche');
  });
});
