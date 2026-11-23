import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { buildApp } from '../server.js';
import { FastifyInstance } from 'fastify';

describe('Suíte de Testes — Emissão de Senhas e Regras de Fila', () => {
  let app: FastifyInstance;
  let servicoIdValido: string;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    const res = await supertest(app.server).get('/api/servicos');
    if (res.body.length > 0) {
      servicoIdValido = res.body[0].id;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/senhas/emitir — Deve emitir senha GERAL com formato correto', async () => {
    const response = await supertest(app.server)
      .post('/api/senhas/emitir')
      .send({
        servicoId: servicoIdValido,
        tipoPrioridade: 'GERAL',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('codigo');
    expect(response.body.codigo).toMatch(/^[A-Z]{3}-G\d{3}$/); // Ex: FIR-G001
    expect(response.body.tipoPrioridade).toBe('GERAL');
    expect(response.body.status).toBe('AGUARDANDO');
  });

  it('POST /api/senhas/emitir — Deve emitir senha PRIORITÁRIA com prefixo P', async () => {
    const response = await supertest(app.server)
      .post('/api/senhas/emitir')
      .send({
        servicoId: servicoIdValido,
        tipoPrioridade: 'PRIORITARIA',
      });

    expect(response.status).toBe(201);
    expect(response.body.codigo).toMatch(/^[A-Z]{3}-P\d{3}$/); // Ex: FIR-P001
    expect(response.body.tipoPrioridade).toBe('PRIORITARIA');
  });

  it('POST /api/senhas/emitir — Deve rejeitar requisição sem servicoId', async () => {
    const response = await supertest(app.server)
      .post('/api/senhas/emitir')
      .send({
        tipoPrioridade: 'GERAL',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('GET /api/senhas/hoje — Deve listar as senhas emitidas no dia', async () => {
    const response = await supertest(app.server).get('/api/senhas/hoje');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(2);
  });
});
