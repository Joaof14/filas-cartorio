import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Populando o banco com os serviços oficiais do cartório...');

  // 1. Catálogo Oficial dos 5 Serviços do Cartório
  const servicos = [
    { nome: 'Reconhecimento de Firma', sigla: 'FIR', tempoMedio: 3 },
    { nome: 'Autenticação de Documentos', sigla: 'AUT', tempoMedio: 4 },
    { nome: 'Procurações e Escrituras', sigla: 'NOT', tempoMedio: 20 },
    { nome: 'Registro Civil (Nascimento/Óbito)', sigla: 'CIV', tempoMedio: 15 },
    { nome: 'Casamento e Habilitação', sigla: 'CAS', tempoMedio: 25 },
  ];

  for (const s of servicos) {
    await prisma.servico.upsert({
      where: { sigla: s.sigla },
      update: { nome: s.nome, tempoMedio: s.tempoMedio },
      create: s,
    });
  }

  // 2. Guichês Físicos de Atendimento
  const guiches = [
    { numero: 1, nome: 'Guichê 01' },
    { numero: 2, nome: 'Guichê 02' },
    { numero: 3, nome: 'Guichê 03' },
    { numero: 4, nome: 'Guichê 04' },
  ];

  for (const g of guiches) {
    await prisma.guiche.upsert({
      where: { numero: g.numero },
      update: { nome: g.nome },
      create: g,
    });
  }

  // 3. Usuário Padrão de Teste
  await prisma.usuario.upsert({
    where: { login: 'atendente1' },
    update: {},
    create: {
      nome: 'Escrevente Padrão',
      login: 'atendente1',
      senha: '123',
      role: Role.ATENDENTE,
    },
  });

  console.log('✅ Seed concluído: 5 serviços e 4 guichês cadastrados!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
