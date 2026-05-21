-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'ATENDENTE', 'FINANCEIRO', 'MECANICO');

-- CreateEnum
CREATE TYPE "StatusVeiculo" AS ENUM ('DISPONIVEL', 'ALUGADO', 'EM_MANUTENCAO', 'INATIVO');

-- CreateEnum
CREATE TYPE "StatusLocacao" AS ENUM ('RESERVADA', 'ATIVA', 'FINALIZADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoTransacao" AS ENUM ('ENTRADA', 'SAIDA');

-- CreateEnum
CREATE TYPE "AlertaManutencao" AS ENUM ('VERDE', 'AMARELO', 'VERMELHO');

-- CreateEnum
CREATE TYPE "GravidadeProblema" AS ENUM ('LEVE', 'MEDIA', 'GRAVE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'ATENDENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Veiculo" (
    "id" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "cor" TEXT,
    "kmAtual" INTEGER NOT NULL DEFAULT 0,
    "kmProximaRevisao" INTEGER NOT NULL,
    "status" "StatusVeiculo" NOT NULL DEFAULT 'DISPONIVEL',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Veiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT,
    "endereco" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Locacao" (
    "id" TEXT NOT NULL,
    "veiculoId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFimPrevista" TIMESTAMP(3) NOT NULL,
    "dataFimReal" TIMESTAMP(3),
    "kmInicio" INTEGER NOT NULL,
    "kmFim" INTEGER,
    "valorDiaria" DECIMAL(10,2) NOT NULL,
    "valorTotal" DECIMAL(10,2),
    "status" "StatusLocacao" NOT NULL DEFAULT 'RESERVADA',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Locacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoManutencao" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "intervaloKm" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TipoManutencao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PecaPadraoTipo" (
    "id" TEXT NOT NULL,
    "tipoManutencaoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "PecaPadraoTipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Manutencao" (
    "id" TEXT NOT NULL,
    "veiculoId" TEXT NOT NULL,
    "tipoManutencaoId" TEXT NOT NULL,
    "dataRealizada" TIMESTAMP(3) NOT NULL,
    "kmRealizada" INTEGER NOT NULL,
    "kmProxima" INTEGER NOT NULL,
    "custo" DECIMAL(10,2),
    "alerta" "AlertaManutencao" NOT NULL DEFAULT 'VERDE',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Manutencao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PecaManutencao" (
    "id" TEXT NOT NULL,
    "manutencaoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "valorUnitario" DECIMAL(10,2),

    CONSTRAINT "PecaManutencao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProblemaCronico" (
    "id" TEXT NOT NULL,
    "veiculoId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "gravidade" "GravidadeProblema" NOT NULL DEFAULT 'MEDIA',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "dataRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProblemaCronico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoriaFinanceira" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoTransacao" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoriaFinanceira_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransacaoFinanceira" (
    "id" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "tipo" "TipoTransacao" NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "descricao" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransacaoFinanceira_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Veiculo_placa_key" ON "Veiculo"("placa");

-- CreateIndex
CREATE INDEX "Veiculo_status_idx" ON "Veiculo"("status");

-- CreateIndex
CREATE INDEX "Veiculo_placa_idx" ON "Veiculo"("placa");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_cpf_key" ON "Cliente"("cpf");

-- CreateIndex
CREATE INDEX "Cliente_nome_idx" ON "Cliente"("nome");

-- CreateIndex
CREATE INDEX "Cliente_cpf_idx" ON "Cliente"("cpf");

-- CreateIndex
CREATE INDEX "Locacao_status_idx" ON "Locacao"("status");

-- CreateIndex
CREATE INDEX "Locacao_veiculoId_idx" ON "Locacao"("veiculoId");

-- CreateIndex
CREATE INDEX "Locacao_clienteId_idx" ON "Locacao"("clienteId");

-- CreateIndex
CREATE INDEX "Locacao_dataInicio_idx" ON "Locacao"("dataInicio");

-- CreateIndex
CREATE UNIQUE INDEX "TipoManutencao_nome_key" ON "TipoManutencao"("nome");

-- CreateIndex
CREATE INDEX "PecaPadraoTipo_tipoManutencaoId_idx" ON "PecaPadraoTipo"("tipoManutencaoId");

-- CreateIndex
CREATE INDEX "Manutencao_veiculoId_idx" ON "Manutencao"("veiculoId");

-- CreateIndex
CREATE INDEX "Manutencao_tipoManutencaoId_idx" ON "Manutencao"("tipoManutencaoId");

-- CreateIndex
CREATE INDEX "Manutencao_kmProxima_idx" ON "Manutencao"("kmProxima");

-- CreateIndex
CREATE INDEX "PecaManutencao_manutencaoId_idx" ON "PecaManutencao"("manutencaoId");

-- CreateIndex
CREATE INDEX "ProblemaCronico_veiculoId_idx" ON "ProblemaCronico"("veiculoId");

-- CreateIndex
CREATE INDEX "ProblemaCronico_ativo_idx" ON "ProblemaCronico"("ativo");

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaFinanceira_nome_key" ON "CategoriaFinanceira"("nome");

-- CreateIndex
CREATE INDEX "TransacaoFinanceira_data_idx" ON "TransacaoFinanceira"("data");

-- CreateIndex
CREATE INDEX "TransacaoFinanceira_tipo_idx" ON "TransacaoFinanceira"("tipo");

-- CreateIndex
CREATE INDEX "TransacaoFinanceira_categoriaId_idx" ON "TransacaoFinanceira"("categoriaId");

-- AddForeignKey
ALTER TABLE "Locacao" ADD CONSTRAINT "Locacao_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "Veiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Locacao" ADD CONSTRAINT "Locacao_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PecaPadraoTipo" ADD CONSTRAINT "PecaPadraoTipo_tipoManutencaoId_fkey" FOREIGN KEY ("tipoManutencaoId") REFERENCES "TipoManutencao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Manutencao" ADD CONSTRAINT "Manutencao_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "Veiculo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Manutencao" ADD CONSTRAINT "Manutencao_tipoManutencaoId_fkey" FOREIGN KEY ("tipoManutencaoId") REFERENCES "TipoManutencao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PecaManutencao" ADD CONSTRAINT "PecaManutencao_manutencaoId_fkey" FOREIGN KEY ("manutencaoId") REFERENCES "Manutencao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemaCronico" ADD CONSTRAINT "ProblemaCronico_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "Veiculo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransacaoFinanceira" ADD CONSTRAINT "TransacaoFinanceira_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaFinanceira"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
