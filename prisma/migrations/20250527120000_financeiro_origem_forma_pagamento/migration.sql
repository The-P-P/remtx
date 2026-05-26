-- CreateEnum
CREATE TYPE "FormaPagamento" AS ENUM ('PIX', 'DINHEIRO', 'CARTAO_DEBITO', 'CARTAO_CREDITO', 'TRANSFERENCIA', 'BOLETO', 'OUTRO');

-- AlterTable
ALTER TABLE "TransacaoFinanceira" ADD COLUMN "formaPagamento" "FormaPagamento",
ADD COLUMN "parcelaId" TEXT,
ADD COLUMN "manutencaoId" TEXT,
ADD COLUMN "locacaoId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "TransacaoFinanceira_parcelaId_key" ON "TransacaoFinanceira"("parcelaId");
CREATE UNIQUE INDEX "TransacaoFinanceira_manutencaoId_key" ON "TransacaoFinanceira"("manutencaoId");
CREATE INDEX "TransacaoFinanceira_locacaoId_idx" ON "TransacaoFinanceira"("locacaoId");

-- AddForeignKey
ALTER TABLE "TransacaoFinanceira" ADD CONSTRAINT "TransacaoFinanceira_parcelaId_fkey" FOREIGN KEY ("parcelaId") REFERENCES "ParcelaLocacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TransacaoFinanceira" ADD CONSTRAINT "TransacaoFinanceira_manutencaoId_fkey" FOREIGN KEY ("manutencaoId") REFERENCES "Manutencao"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TransacaoFinanceira" ADD CONSTRAINT "TransacaoFinanceira_locacaoId_fkey" FOREIGN KEY ("locacaoId") REFERENCES "Locacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;
