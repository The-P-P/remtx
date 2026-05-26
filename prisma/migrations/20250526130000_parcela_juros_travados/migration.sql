-- Juros fixados no reagendamento (multa do período anterior)
ALTER TABLE "ParcelaLocacao" ADD COLUMN "jurosTravados" DECIMAL(10,2) NOT NULL DEFAULT 0;
