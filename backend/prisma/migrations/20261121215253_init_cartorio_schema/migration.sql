-- CreateEnum
CREATE TYPE "TipoPrioridade" AS ENUM ('GERAL', 'PRIORITARIA');

-- CreateEnum
CREATE TYPE "StatusSenha" AS ENUM ('AGUARDANDO', 'CHAMANDO', 'EM_ATENDIMENTO', 'FINALIZADA', 'AUSENTE');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ATENDENTE', 'GESTOR');

-- CreateTable
CREATE TABLE "servicos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "sigla" TEXT NOT NULL,
    "tempoMedio" INTEGER NOT NULL DEFAULT 5,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "servicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guiches" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guiches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ATENDENTE',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "senhas" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "numeroSequencial" INTEGER NOT NULL,
    "tipoPrioridade" "TipoPrioridade" NOT NULL DEFAULT 'GERAL',
    "status" "StatusSenha" NOT NULL DEFAULT 'AGUARDANDO',
    "servicoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chamadaEm" TIMESTAMP(3),

    CONSTRAINT "senhas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atendimentos" (
    "id" TEXT NOT NULL,
    "inicioEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fimEm" TIMESTAMP(3),
    "senhaId" TEXT NOT NULL,
    "guicheId" TEXT NOT NULL,
    "usuarioId" TEXT,

    CONSTRAINT "atendimentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "servicos_sigla_key" ON "servicos"("sigla");

-- CreateIndex
CREATE UNIQUE INDEX "guiches_numero_key" ON "guiches"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_login_key" ON "usuarios"("login");

-- AddForeignKey
ALTER TABLE "senhas" ADD CONSTRAINT "senhas_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "servicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimentos" ADD CONSTRAINT "atendimentos_senhaId_fkey" FOREIGN KEY ("senhaId") REFERENCES "senhas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimentos" ADD CONSTRAINT "atendimentos_guicheId_fkey" FOREIGN KEY ("guicheId") REFERENCES "guiches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimentos" ADD CONSTRAINT "atendimentos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
