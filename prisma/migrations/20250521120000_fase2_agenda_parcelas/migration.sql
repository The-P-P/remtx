-- Fase 2: agenda, parcelas semanais, IPVA e tipos de tarefa manual

-- CreateEnum
CREATE TYPE "TipoEventoAgenda" AS ENUM (
  'LOCACAO_INICIO',
  'LOCACAO_FIM_PREVISTO',
  'LOCACAO_FIM_REAL',
  'PAGAMENTO_CLIENTE',
  'ENTREGA_VEICULO',
  'RETIRADA_VEICULO',
  'OFICINA_SERVICO',
  'MANUTENCAO_AGENDADA',
  'IPVA',
  'LEMBRETE',
  'FINANCEIRO'
);

-- AlterTable
ALTER TABLE "Veiculo" ADD COLUMN "ipvaVencimento" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ParcelaLocacao" (
    "id" TEXT NOT NULL,
    "locacaoId" TEXT NOT NULL,
    "valorBase" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "valorJuros" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "valor" DECIMAL(10,2) NOT NULL,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "dataVencimentoOriginal" TIMESTAMP(3),
    "dataPagamento" TIMESTAMP(3),
    "pagamentoAjustado" BOOLEAN NOT NULL DEFAULT false,
    "isentarJuros" BOOLEAN NOT NULL DEFAULT false,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParcelaLocacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConclusaoAgenda" (
    "id" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "tipo" "TipoEventoAgenda" NOT NULL,
    "dataPrevista" TIMESTAMP(3) NOT NULL,
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "concluidaEm" TIMESTAMP(3),
    "reagendadaPara" TIMESTAMP(3),
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConclusaoAgenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoAgenda" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3),
    "tipo" "TipoEventoAgenda" NOT NULL DEFAULT 'LEMBRETE',
    "valor" DECIMAL(10,2),
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "veiculoId" TEXT,
    "clienteId" TEXT,
    "locacaoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventoAgenda_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ParcelaLocacao_locacaoId_idx" ON "ParcelaLocacao"("locacaoId");

-- CreateIndex
CREATE INDEX "ParcelaLocacao_dataVencimento_idx" ON "ParcelaLocacao"("dataVencimento");

-- CreateIndex
CREATE UNIQUE INDEX "ConclusaoAgenda_chave_key" ON "ConclusaoAgenda"("chave");

-- CreateIndex
CREATE INDEX "ConclusaoAgenda_dataPrevista_idx" ON "ConclusaoAgenda"("dataPrevista");

-- CreateIndex
CREATE INDEX "ConclusaoAgenda_reagendadaPara_idx" ON "ConclusaoAgenda"("reagendadaPara");

-- CreateIndex
CREATE INDEX "EventoAgenda_dataInicio_idx" ON "EventoAgenda"("dataInicio");

-- CreateIndex
CREATE INDEX "EventoAgenda_tipo_idx" ON "EventoAgenda"("tipo");

-- CreateIndex
CREATE INDEX "EventoAgenda_veiculoId_idx" ON "EventoAgenda"("veiculoId");

-- AddForeignKey
ALTER TABLE "ParcelaLocacao" ADD CONSTRAINT "ParcelaLocacao_locacaoId_fkey" FOREIGN KEY ("locacaoId") REFERENCES "Locacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoAgenda" ADD CONSTRAINT "EventoAgenda_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "Veiculo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoAgenda" ADD CONSTRAINT "EventoAgenda_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoAgenda" ADD CONSTRAINT "EventoAgenda_locacaoId_fkey" FOREIGN KEY ("locacaoId") REFERENCES "Locacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;
