-- AlterEnum
ALTER TYPE "TipoEventoAgenda" ADD VALUE 'CAUCAO_LOCACAO';

-- AlterTable
ALTER TABLE "Locacao" ADD COLUMN "valorCaucao" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN "caucaoPaga" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "caucaoDataPagamento" TIMESTAMP(3);
