-- Financiamento de veículos da frota

CREATE TABLE "FinanciamentoVeiculo" (
    "id" TEXT NOT NULL,
    "veiculoId" TEXT NOT NULL,
    "instituicao" TEXT,
    "valorFinanciado" DECIMAL(12,2) NOT NULL,
    "valorEntrada" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "saldoDevedor" DECIMAL(12,2) NOT NULL,
    "valorParcela" DECIMAL(10,2) NOT NULL,
    "totalParcelas" INTEGER NOT NULL,
    "diaVencimento" INTEGER NOT NULL,
    "dataPrimeiraParcela" TIMESTAMP(3) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "quitadoEm" TIMESTAMP(3),
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanciamentoVeiculo_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ParcelaFinanciamento" (
    "id" TEXT NOT NULL,
    "financiamentoId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "dataPagamento" TIMESTAMP(3),
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParcelaFinanciamento_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FinanciamentoVeiculo_veiculoId_key" ON "FinanciamentoVeiculo"("veiculoId");
CREATE INDEX "FinanciamentoVeiculo_ativo_idx" ON "FinanciamentoVeiculo"("ativo");
CREATE INDEX "FinanciamentoVeiculo_saldoDevedor_idx" ON "FinanciamentoVeiculo"("saldoDevedor");

CREATE UNIQUE INDEX "ParcelaFinanciamento_financiamentoId_numero_key" ON "ParcelaFinanciamento"("financiamentoId", "numero");
CREATE INDEX "ParcelaFinanciamento_financiamentoId_idx" ON "ParcelaFinanciamento"("financiamentoId");
CREATE INDEX "ParcelaFinanciamento_dataVencimento_idx" ON "ParcelaFinanciamento"("dataVencimento");
CREATE INDEX "ParcelaFinanciamento_dataPagamento_idx" ON "ParcelaFinanciamento"("dataPagamento");

ALTER TABLE "FinanciamentoVeiculo" ADD CONSTRAINT "FinanciamentoVeiculo_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "Veiculo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ParcelaFinanciamento" ADD CONSTRAINT "ParcelaFinanciamento_financiamentoId_fkey" FOREIGN KEY ("financiamentoId") REFERENCES "FinanciamentoVeiculo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TransacaoFinanceira" ADD COLUMN "parcelaFinanciamentoId" TEXT;
CREATE UNIQUE INDEX "TransacaoFinanceira_parcelaFinanciamentoId_key" ON "TransacaoFinanceira"("parcelaFinanciamentoId");
ALTER TABLE "TransacaoFinanceira" ADD CONSTRAINT "TransacaoFinanceira_parcelaFinanciamentoId_fkey" FOREIGN KEY ("parcelaFinanciamentoId") REFERENCES "ParcelaFinanciamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;
