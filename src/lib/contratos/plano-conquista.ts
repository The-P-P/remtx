import { addMonths } from "date-fns";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { dateKey, parseDateInput } from "@/lib/utils";
import { listarVencimentosMensais } from "@/lib/parcelas-mensais";

type Tx = Prisma.TransactionClient;

export async function criarPlanoConquistaParaLocacao(
  tx: Tx,
  locacaoId: string
) {
  const locacao = await tx.locacao.findUniqueOrThrow({
    where: { id: locacaoId },
    include: { parcelas: { orderBy: { dataVencimento: "asc" } } },
  });

  if (locacao.modeloContrato !== "PLANO_CONQUISTA") return null;

  const totalMeses = locacao.planoConquistaMeses ?? 24;
  const valorMensal = Number(locacao.valorDiaria);
  const valorAdesao = Number(
    locacao.planoConquistaValorAdesao ?? locacao.valorCaucao
  );
  const dataInicio = parseDateInput(locacao.dataInicio);

  const plano = await tx.planoConquista.upsert({
    where: { locacaoId },
    create: {
      clienteId: locacao.clienteId,
      locacaoId,
      totalMeses,
      valorMensal,
      valorAdesao,
      dataInicio,
      dataPrevistaConclusao: addMonths(dataInicio, totalMeses),
    },
    update: {
      totalMeses,
      valorMensal,
      valorAdesao,
      dataPrevistaConclusao: addMonths(dataInicio, totalMeses),
    },
  });

  const vencimentos = listarVencimentosMensais(dataInicio, totalMeses);
  const parcelaPorData = new Map(
    locacao.parcelas.map((p) => [
      dateKey(p.dataVencimentoOriginal ?? p.dataVencimento),
      p,
    ])
  );

  for (let i = 0; i < vencimentos.length; i++) {
    const mesNumero = i + 1;
    const parcela = parcelaPorData.get(dateKey(vencimentos[i]));
    await tx.planoConquistaRegistro.upsert({
      where: { planoId_mesNumero: { planoId: plano.id, mesNumero } },
      create: {
        planoId: plano.id,
        mesNumero,
        valor: valorMensal,
        dataVencimento: vencimentos[i],
        parcelaId: parcela?.id,
      },
      update: {
        valor: valorMensal,
        dataVencimento: vencimentos[i],
        parcelaId: parcela?.id ?? undefined,
      },
    });
  }

  return plano;
}

export async function atualizarPlanoConquistaParcelaPaga(parcelaId: string) {
  const parcela = await prisma.parcelaLocacao.findUnique({
    where: { id: parcelaId },
    include: {
      locacao: { select: { modeloContrato: true } },
      registroPlanoConquista: true,
    },
  });

  if (!parcela?.dataPagamento) return;
  if (parcela.locacao.modeloContrato !== "PLANO_CONQUISTA") return;

  const plano = await prisma.planoConquista.findUnique({
    where: { locacaoId: parcela.locacaoId },
  });
  if (!plano) return;

  const registro = parcela.registroPlanoConquista;
  if (registro) {
    await prisma.planoConquistaRegistro.update({
      where: { id: registro.id },
      data: { dataPagamento: parcela.dataPagamento },
    });
  }

  const pagos = await prisma.planoConquistaRegistro.count({
    where: {
      planoId: plano.id,
      dataPagamento: { not: null },
    },
  });

  const status =
    pagos >= plano.totalMeses && plano.adesaoPaga ? "CONCLUIDO" : plano.status;

  await prisma.planoConquista.update({
    where: { id: plano.id },
    data: {
      mesesPagos: pagos,
      status,
      dataConclusao:
        status === "CONCLUIDO" ? new Date() : plano.dataConclusao,
    },
  });
}

export async function marcarAdesaoPlanoConquistaPaga(locacaoId: string) {
  const plano = await prisma.planoConquista.findUnique({
    where: { locacaoId },
  });
  if (!plano) return;

  await prisma.planoConquista.update({
    where: { id: plano.id },
    data: {
      adesaoPaga: true,
      valorAdesaoPago: plano.valorAdesao,
    },
  });

  const pagos = plano.mesesPagos;
  if (pagos >= plano.totalMeses) {
    await prisma.planoConquista.update({
      where: { id: plano.id },
      data: { status: "CONCLUIDO", dataConclusao: new Date() },
    });
  }
}
