import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { buildApp } from '../server.js';
import { FastifyInstance } from 'fastify';

describe('Suíte de Testes de Integração — API do Cartório', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health — Deve responder status 200 e indicar serviço ativo', async () => {
    const response = await supertest(app.server).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'UP');
    expect(response.body).toHaveProperty('database', 'CONNECTED');
  });

  it('GET /api/servicos — Deve listar serviços ativos do cartório', async () => {
    const response = await supertest(app.server).get('/api/servicos');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    
    // Se o seed foi executado, deve conter servicos
    if (response.body.length > 0) {
      const primeiro = response.body[0];
      expect(primeiro).toHaveProperty('id');
      expect(primeiro).toHaveProperty('nome');
      expect(primeiro).toHaveProperty('sigla');
      expect(primeiro).toHaveProperty('tempoMedio');
    }
  });

  it('GET /api/guiches — Deve listar guichês físicos do cartório', async () => {
    const response = await supertest(app.server).get('/api/guiches');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
