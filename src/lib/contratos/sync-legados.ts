import { prisma } from "@/lib/prisma";
import { provisionarContratoLocacao } from "@/lib/contratos/provisionar";
import { atualizarPlanoConquistaParcelaPaga } from "@/lib/contratos/plano-conquista";

/** Gera contratos e planos faltantes para locações já existentes da locadora. */
export async function sincronizarContratosLegados(locadoraId: string) {
  const semContrato = await prisma.locacao.findMany({
    where: { locadoraId, contrato: null },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });

  let gerados = 0;
  for (const { id } of semContrato) {
    await provisionarContratoLocacao(id);
    gerados++;
  }

  const parcelasPagasPlano = await prisma.parcelaLocacao.findMany({
    where: {
      dataPagamento: { not: null },
      locacao: { locadoraId, modeloContrato: "PLANO_CONQUISTA" },
      OR: [
        { registroPlanoConquista: null },
        { registroPlanoConquista: { dataPagamento: null } },
      ],
    },
    select: { id: true },
  });

  for (const p of parcelasPagasPlano) {
    await atualizarPlanoConquistaParcelaPaga(p.id);
  }

  const caucaoPagaSemAdesao = await prisma.locacao.findMany({
    where: {
      locadoraId,
      modeloContrato: "PLANO_CONQUISTA",
      caucaoPaga: true,
      planoConquista: { adesaoPaga: false },
    },
    select: { id: true },
  });

  const { marcarAdesaoPlanoConquistaPaga } = await import(
    "@/lib/contratos/plano-conquista"
  );
  for (const { id } of caucaoPagaSemAdesao) {
    await marcarAdesaoPlanoConquistaPaga(id);
  }

  return { gerados, totalSemContrato: semContrato.length };
}
