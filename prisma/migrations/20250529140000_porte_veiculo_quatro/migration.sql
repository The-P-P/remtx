-- Mapeia portes removidos para os 4 tipos finais
UPDATE "Veiculo" SET "porte" = 'SUV' WHERE "porte" = 'CROSSOVER';
UPDATE "Veiculo" SET "porte" = 'SEDAN' WHERE "porte" IN ('MINIVAN', 'STATION_WAGON', 'COUPE', 'ESPORTIVO');
UPDATE "Veiculo" SET "porte" = 'PICAPE' WHERE "porte" = 'FURGAO';

ALTER TYPE "PorteVeiculo" RENAME TO "PorteVeiculo_old";

CREATE TYPE "PorteVeiculo" AS ENUM ('HATCH', 'SEDAN', 'SUV', 'PICAPE');

ALTER TABLE "Veiculo" ALTER COLUMN "porte" DROP DEFAULT;
ALTER TABLE "Veiculo" ALTER COLUMN "porte" TYPE "PorteVeiculo" USING ("porte"::text::"PorteVeiculo");
ALTER TABLE "Veiculo" ALTER COLUMN "porte" SET DEFAULT 'SEDAN';

DROP TYPE "PorteVeiculo_old";
