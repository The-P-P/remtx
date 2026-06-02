-- CreateEnum
CREATE TYPE "TipoModeloContrato" AS ENUM ('PADRAO', 'PLANO_CONQUISTA');
CREATE TYPE "StatusContratoDocumento" AS ENUM ('RASCUNHO', 'GERADO');
CREATE TYPE "StatusPlanoConquista" AS ENUM ('ATIVO', 'CONCLUIDO', 'CANCELADO');
CREATE TYPE "PeriodicidadePagamento" AS ENUM ('SEMANAL', 'MENSAL');

-- AlterTable Veiculo
ALTER TABLE "Veiculo" ADD COLUMN "renavam" TEXT;

-- AlterTable Cliente
ALTER TABLE "Cliente" ADD COLUMN "rg" TEXT;
ALTER TABLE "Cliente" ADD COLUMN "rgOrgao" TEXT;
ALTER TABLE "Cliente" ADD COLUMN "nacionalidade" TEXT DEFAULT 'brasileiro';

-- AlterTable Locacao
ALTER TABLE "Locacao" ADD COLUMN "modeloContrato" "TipoModeloContrato" NOT NULL DEFAULT 'PADRAO';
ALTER TABLE "Locacao" ADD COLUMN "periodicidadePagamento" "PeriodicidadePagamento" NOT NULL DEFAULT 'SEMANAL';
ALTER TABLE "Locacao" ADD COLUMN "numeroContrato" TEXT;
ALTER TABLE "Locacao" ADD COLUMN "planoConquistaMeses" INTEGER;
ALTER TABLE "Locacao" ADD COLUMN "planoConquistaValorAdesao" DECIMAL(12,2);

CREATE UNIQUE INDEX "Locacao_numeroContrato_key" ON "Locacao"("numeroContrato");
CREATE INDEX "Locacao_modeloContrato_idx" ON "Locacao"("modeloContrato");

-- CreateTable ConfiguracaoLocadora
CREATE TABLE "ConfiguracaoLocadora" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "razaoSocial" TEXT NOT NULL,
    "cpfCnpj" TEXT NOT NULL,
    "rg" TEXT,
    "rgOrgao" TEXT,
    "endereco" TEXT NOT NULL,
    "cidade" TEXT NOT NULL DEFAULT 'São Luís',
    "uf" TEXT NOT NULL DEFAULT 'MA',
    "cep" TEXT,
    "multaRescisao" DECIMAL(10,2) NOT NULL DEFAULT 750,
    "kmSemanalMax" INTEGER NOT NULL DEFAULT 1500,
    "valorKmExtra" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfiguracaoLocadora_pkey" PRIMARY KEY ("id")
);

-- CreateTable ContratoLocacao
CREATE TABLE "ContratoLocacao" (
    "id" TEXT NOT NULL,
    "locacaoId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "modelo" "TipoModeloContrato" NOT NULL,
    "status" "StatusContratoDocumento" NOT NULL DEFAULT 'GERADO',
    "dadosSnapshot" JSONB NOT NULL,
    "geradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "versao" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContratoLocacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable PlanoConquista
CREATE TABLE "PlanoConquista" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "locacaoId" TEXT NOT NULL,
    "status" "StatusPlanoConquista" NOT NULL DEFAULT 'ATIVO',
    "totalMeses" INTEGER NOT NULL DEFAULT 24,
    "mesesPagos" INTEGER NOT NULL DEFAULT 0,
    "valorMensal" DECIMAL(10,2) NOT NULL,
    "valorAdesao" DECIMAL(12,2) NOT NULL,
    "valorAdesaoPago" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "adesaoPaga" BOOLEAN NOT NULL DEFAULT false,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataPrevistaConclusao" TIMESTAMP(3),
    "dataConclusao" TIMESTAMP(3),
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanoConquista_pkey" PRIMARY KEY ("id")
);

-- CreateTable PlanoConquistaRegistro
CREATE TABLE "PlanoConquistaRegistro" (
    "id" TEXT NOT NULL,
    "planoId" TEXT NOT NULL,
    "mesNumero" INTEGER NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "dataPagamento" TIMESTAMP(3),
    "parcelaId" TEXT,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanoConquistaRegistro_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContratoLocacao_locacaoId_key" ON "ContratoLocacao"("locacaoId");
CREATE UNIQUE INDEX "ContratoLocacao_numero_key" ON "ContratoLocacao"("numero");
CREATE INDEX "ContratoLocacao_modelo_idx" ON "ContratoLocacao"("modelo");
CREATE INDEX "ContratoLocacao_numero_idx" ON "ContratoLocacao"("numero");

CREATE UNIQUE INDEX "PlanoConquista_locacaoId_key" ON "PlanoConquista"("locacaoId");
CREATE INDEX "PlanoConquista_clienteId_idx" ON "PlanoConquista"("clienteId");
CREATE INDEX "PlanoConquista_status_idx" ON "PlanoConquista"("status");

CREATE UNIQUE INDEX "PlanoConquistaRegistro_parcelaId_key" ON "PlanoConquistaRegistro"("parcelaId");
CREATE UNIQUE INDEX "PlanoConquistaRegistro_planoId_mesNumero_key" ON "PlanoConquistaRegistro"("planoId", "mesNumero");
CREATE INDEX "PlanoConquistaRegistro_planoId_idx" ON "PlanoConquistaRegistro"("planoId");

-- AddForeignKey
ALTER TABLE "ContratoLocacao" ADD CONSTRAINT "ContratoLocacao_locacaoId_fkey" FOREIGN KEY ("locacaoId") REFERENCES "Locacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlanoConquista" ADD CONSTRAINT "PlanoConquista_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PlanoConquista" ADD CONSTRAINT "PlanoConquista_locacaoId_fkey" FOREIGN KEY ("locacaoId") REFERENCES "Locacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlanoConquistaRegistro" ADD CONSTRAINT "PlanoConquistaRegistro_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "PlanoConquista"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlanoConquistaRegistro" ADD CONSTRAINT "PlanoConquistaRegistro_parcelaId_fkey" FOREIGN KEY ("parcelaId") REFERENCES "ParcelaLocacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed locadora padrão (modelo Ednaldo)
INSERT INTO "ConfiguracaoLocadora" ("id", "razaoSocial", "cpfCnpj", "rg", "rgOrgao", "endereco", "cidade", "uf", "cep", "updatedAt")
VALUES (
  'default',
  'Jumaille Muched Costa Jadão',
  '65568893349',
  '796304971',
  'SESP/MA',
  'Rua Nhozinho Nogueira, Alemanha, São Luís- MA',
  'São Luís',
  'MA',
  '65036-240',
  CURRENT_TIMESTAMP
) ON CONFLICT ("id") DO NOTHING;
