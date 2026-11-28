import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { buildApp } from '../server.js';
import { FastifyInstance } from 'fastify';

describe('Suíte de Testes — Operação de Guichês e Testes de Concorrência', () => {
  let app: FastifyInstance;
  let servicoId: string;
  let guiches: any[] = [];

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    const resSrv = await supertest(app.server).get('/api/servicos');
    servicoId = resSrv.body[0].id;

    const resG = await supertest(app.server).get('/api/guiches');
    guiches = resG.body;
  });

  afterAll(async () => {
    await app.close();
  });

  it('Concorrência: Dois guichês chamando simultaneamente NÃO devem receber a mesma senha', async () => {
    // 1. Emite 2 senhas na fila
    const s1 = await supertest(app.server).post('/api/senhas/emitir').send({ servicoId, tipoPrioridade: 'GERAL' });
    const s2 = await supertest(app.server).post('/api/senhas/emitir').send({ servicoId, tipoPrioridade: 'GERAL' });

    expect(s1.status).toBe(201);
    expect(s2.status).toBe(201);

    // 2. Dispara 2 chamadas simultaneas concorrentes via Promise.all
    const [chamada1, chamada2] = await Promise.all([
      supertest(app.server).post('/api/atendimento/chamar-proximo').send({ guicheId: guiches[0].id }),
      supertest(app.server).post('/api/atendimento/chamar-proximo').send({ guicheId: guiches[1].id }),
    ]);

    expect(chamada1.status).toBe(200);
    expect(chamada2.status).toBe(200);

    // As duas senhas retornadas DEVEM ser distintas
    expect(chamada1.body.id).not.toBe(chamada2.body.id);
  });

  it('Ciclo Completo: Iniciar e Finalizar Atendimento gravando timestamps', async () => {
    // Emite e chama
    const resSenha = await supertest(app.server).post('/api/senhas/emitir').send({ servicoId, tipoPrioridade: 'GERAL' });
    const resChamada = await supertest(app.server).post('/api/atendimento/chamar-proximo').send({ guicheId: guiches[0].id });
    const senhaId = resChamada.body.id;

    // Iniciar
    const resIniciar = await supertest(app.server).post('/api/atendimento/iniciar').send({ senhaId });
    expect(resIniciar.status).toBe(200);
    expect(resIniciar.body.status).toBe('EM_ATENDIMENTO');

    // Finalizar
    const resFinalizar = await supertest(app.server).post('/api/atendimento/finalizar').send({ senhaId });
    expect(resFinalizar.status).toBe(200);
    expect(resFinalizar.body.status).toBe('FINALIZADA');
  });

  it('Transferência: Deve devolver a senha para AGUARDANDO no novo serviço', async () => {
    // Pega um segundo servico diferente
    const resSrv = await supertest(app.server).get('/api/servicos');
    const segundoServicoId = resSrv.body[1].id;

    // Emite e chama
    await supertest(app.server).post('/api/senhas/emitir').send({ servicoId, tipoPrioridade: 'PRIORITARIA' });
    const resChamada = await supertest(app.server).post('/api/atendimento/chamar-proximo').send({ guicheId: guiches[0].id });

    // Transfere
    const resTransf = await supertest(app.server).post('/api/atendimento/transferir').send({
      senhaId: resChamada.body.id,
      novoServicoId: segundoServicoId,
    });

    expect(resTransf.status).toBe(200);
    expect(resTransf.body.status).toBe('AGUARDANDO');
    expect(resTransf.body.servicoId).toBe(segundoServicoId);
    expect(resTransf.body.tipoPrioridade).toBe('PRIORITARIA'); // Mantém prioridade legal
  });
});
