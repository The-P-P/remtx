import { prisma } from "@/lib/prisma";
import { CATEGORIA_LOCACAO_NOME } from "@/lib/financeiro-categorias";

/** Compara recebimentos de locação (parcelas pagas) vs lançamentos no financeiro. */
export async function getConferenciaLocacaoPeriodo(
  inicio: Date,
  fim: Date,
  locadoraId: string
) {
  const categoria = await prisma.categoriaFinanceira.findUnique({
    where: {
      locadoraId_nome: { locadoraId, nome: CATEGORIA_LOCACAO_NOME },
    },
  });

  const [parcelasPagas, transacoesLocacao] = await Promise.all([
    prisma.parcelaLocacao.findMany({
      where: {
        dataPagamento: { gte: inicio, lte: fim },
        pagamentoAjustado: false,
        locacao: { locadoraId },
      },
      select: {
        id: true,
        valor: true,
        transacaoFinanceira: { select: { id: true } },
        locacao: {
          select: {
            id: true,
            veiculo: { select: { placa: true } },
            cliente: { select: { nome: true } },
          },
        },
      },
    }),
    categoria
      ? prisma.transacaoFinanceira.findMany({
          where: {
            categoriaId: categoria.id,
            tipo: "ENTRADA",
            data: { gte: inicio, lte: fim },
          },
          select: { valor: true, parcelaId: true },
        })
      : Promise.resolve([]),
  ]);

  const totalParcelas = parcelasPagas.reduce(
    (s, p) => s + Number(p.valor),
    0
  );
  const totalFinanceiro = transacoesLocacao.reduce(
    (s, t) => s + Number(t.valor),
    0
  );
  const semLancamento = parcelasPagas.filter((p) => !p.transacaoFinanceira);

  return {
    totalParcelas: Math.round(totalParcelas * 100) / 100,
    totalFinanceiro: Math.round(totalFinanceiro * 100) / 100,
    diferenca: Math.round((totalFinanceiro - totalParcelas) * 100) / 100,
    parcelasPagas: parcelasPagas.length,
    semLancamento: semLancamento.length,
    exemplosSemLancamento: semLancamento.slice(0, 5).map((p) => ({
      parcelaId: p.id,
      locacaoId: p.locacao.id,
      placa: p.locacao.veiculo.placa,
      cliente: p.locacao.cliente.nome,
      valor: Number(p.valor),
    })),
  };
}
