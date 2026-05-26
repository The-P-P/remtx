-- Locação sem data de devolução prevista (prazo indeterminado)
ALTER TABLE "Locacao" ALTER COLUMN "dataFimPrevista" DROP NOT NULL;
