-- Multi-tenancy: cada locadora (conta) com dados isolados

CREATE TABLE "Locadora" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Locadora_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Locadora_nome_idx" ON "Locadora"("nome");

INSERT INTO "Locadora" ("id", "nome", "updatedAt")
VALUES ('locadora-legado', 'Locadora principal', CURRENT_TIMESTAMP);

-- User
ALTER TABLE "User" ADD COLUMN "locadoraId" TEXT;
UPDATE "User" SET "locadoraId" = 'locadora-legado';
ALTER TABLE "User" ALTER COLUMN "locadoraId" SET NOT NULL;
ALTER TABLE "User" ADD CONSTRAINT "User_locadoraId_fkey" FOREIGN KEY ("locadoraId") REFERENCES "Locadora"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "User_locadoraId_idx" ON "User"("locadoraId");

-- Veiculo
ALTER TABLE "Veiculo" ADD COLUMN "locadoraId" TEXT;
UPDATE "Veiculo" SET "locadoraId" = 'locadora-legado';
ALTER TABLE "Veiculo" ALTER COLUMN "locadoraId" SET NOT NULL;
DROP INDEX IF EXISTS "Veiculo_placa_key";
CREATE UNIQUE INDEX "Veiculo_locadoraId_placa_key" ON "Veiculo"("locadoraId", "placa");
CREATE INDEX "Veiculo_locadoraId_idx" ON "Veiculo"("locadoraId");
ALTER TABLE "Veiculo" ADD CONSTRAINT "Veiculo_locadoraId_fkey" FOREIGN KEY ("locadoraId") REFERENCES "Locadora"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Cliente
ALTER TABLE "Cliente" ADD COLUMN "locadoraId" TEXT;
UPDATE "Cliente" SET "locadoraId" = 'locadora-legado';
ALTER TABLE "Cliente" ALTER COLUMN "locadoraId" SET NOT NULL;
DROP INDEX IF EXISTS "Cliente_cpf_key";
CREATE UNIQUE INDEX "Cliente_locadoraId_cpf_key" ON "Cliente"("locadoraId", "cpf");
CREATE INDEX "Cliente_locadoraId_idx" ON "Cliente"("locadoraId");
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_locadoraId_fkey" FOREIGN KEY ("locadoraId") REFERENCES "Locadora"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Locacao
ALTER TABLE "Locacao" ADD COLUMN "locadoraId" TEXT;
UPDATE "Locacao" SET "locadoraId" = 'locadora-legado';
ALTER TABLE "Locacao" ALTER COLUMN "locadoraId" SET NOT NULL;
DROP INDEX IF EXISTS "Locacao_numeroContrato_key";
CREATE UNIQUE INDEX "Locacao_locadoraId_numeroContrato_key" ON "Locacao"("locadoraId", "numeroContrato");
CREATE INDEX "Locacao_locadoraId_idx" ON "Locacao"("locadoraId");
ALTER TABLE "Locacao" ADD CONSTRAINT "Locacao_locadoraId_fkey" FOREIGN KEY ("locadoraId") REFERENCES "Locadora"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ConfiguracaoLocadora
ALTER TABLE "ConfiguracaoLocadora" ADD COLUMN "locadoraId" TEXT;
UPDATE "ConfiguracaoLocadora" SET "locadoraId" = 'locadora-legado' WHERE "id" = 'default';
UPDATE "ConfiguracaoLocadora" SET "id" = 'locadora-legado' WHERE "id" = 'default';
ALTER TABLE "ConfiguracaoLocadora" ALTER COLUMN "locadoraId" SET NOT NULL;
CREATE UNIQUE INDEX "ConfiguracaoLocadora_locadoraId_key" ON "ConfiguracaoLocadora"("locadoraId");
ALTER TABLE "ConfiguracaoLocadora" ADD CONSTRAINT "ConfiguracaoLocadora_locadoraId_fkey" FOREIGN KEY ("locadoraId") REFERENCES "Locadora"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ContratoLocacao
ALTER TABLE "ContratoLocacao" ADD COLUMN "locadoraId" TEXT;
UPDATE "ContratoLocacao" SET "locadoraId" = 'locadora-legado';
ALTER TABLE "ContratoLocacao" ALTER COLUMN "locadoraId" SET NOT NULL;
DROP INDEX IF EXISTS "ContratoLocacao_numero_key";
CREATE UNIQUE INDEX "ContratoLocacao_locadoraId_numero_key" ON "ContratoLocacao"("locadoraId", "numero");
CREATE INDEX "ContratoLocacao_locadoraId_idx" ON "ContratoLocacao"("locadoraId");
ALTER TABLE "ContratoLocacao" ADD CONSTRAINT "ContratoLocacao_locadoraId_fkey" FOREIGN KEY ("locadoraId") REFERENCES "Locadora"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ConclusaoAgenda
ALTER TABLE "ConclusaoAgenda" ADD COLUMN "locadoraId" TEXT;
UPDATE "ConclusaoAgenda" SET "locadoraId" = 'locadora-legado';
ALTER TABLE "ConclusaoAgenda" ALTER COLUMN "locadoraId" SET NOT NULL;
DROP INDEX IF EXISTS "ConclusaoAgenda_chave_key";
CREATE UNIQUE INDEX "ConclusaoAgenda_locadoraId_chave_key" ON "ConclusaoAgenda"("locadoraId", "chave");
CREATE INDEX "ConclusaoAgenda_locadoraId_idx" ON "ConclusaoAgenda"("locadoraId");
ALTER TABLE "ConclusaoAgenda" ADD CONSTRAINT "ConclusaoAgenda_locadoraId_fkey" FOREIGN KEY ("locadoraId") REFERENCES "Locadora"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- EventoAgenda
ALTER TABLE "EventoAgenda" ADD COLUMN "locadoraId" TEXT;
UPDATE "EventoAgenda" SET "locadoraId" = 'locadora-legado';
ALTER TABLE "EventoAgenda" ALTER COLUMN "locadoraId" SET NOT NULL;
CREATE INDEX "EventoAgenda_locadoraId_idx" ON "EventoAgenda"("locadoraId");
ALTER TABLE "EventoAgenda" ADD CONSTRAINT "EventoAgenda_locadoraId_fkey" FOREIGN KEY ("locadoraId") REFERENCES "Locadora"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- TipoManutencao
ALTER TABLE "TipoManutencao" ADD COLUMN "locadoraId" TEXT;
UPDATE "TipoManutencao" SET "locadoraId" = 'locadora-legado';
ALTER TABLE "TipoManutencao" ALTER COLUMN "locadoraId" SET NOT NULL;
DROP INDEX IF EXISTS "TipoManutencao_nome_key";
CREATE UNIQUE INDEX "TipoManutencao_locadoraId_nome_key" ON "TipoManutencao"("locadoraId", "nome");
CREATE INDEX "TipoManutencao_locadoraId_idx" ON "TipoManutencao"("locadoraId");
ALTER TABLE "TipoManutencao" ADD CONSTRAINT "TipoManutencao_locadoraId_fkey" FOREIGN KEY ("locadoraId") REFERENCES "Locadora"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CategoriaFinanceira
ALTER TABLE "CategoriaFinanceira" ADD COLUMN "locadoraId" TEXT;
UPDATE "CategoriaFinanceira" SET "locadoraId" = 'locadora-legado';
ALTER TABLE "CategoriaFinanceira" ALTER COLUMN "locadoraId" SET NOT NULL;
DROP INDEX IF EXISTS "CategoriaFinanceira_nome_key";
CREATE UNIQUE INDEX "CategoriaFinanceira_locadoraId_nome_key" ON "CategoriaFinanceira"("locadoraId", "nome");
CREATE INDEX "CategoriaFinanceira_locadoraId_idx" ON "CategoriaFinanceira"("locadoraId");
ALTER TABLE "CategoriaFinanceira" ADD CONSTRAINT "CategoriaFinanceira_locadoraId_fkey" FOREIGN KEY ("locadoraId") REFERENCES "Locadora"("id") ON DELETE CASCADE ON UPDATE CASCADE;
