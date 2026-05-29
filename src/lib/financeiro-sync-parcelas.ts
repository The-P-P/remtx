import { prisma } from "@/lib/prisma";
import {
  ensureCategoriasFinanceirasPadrao,
  getCategoriaCaucao,
  getCategoriaLocacaoVeiculos,
} from "@/lib/financeiro-categorias";
import {
  sincronizarLancamentoCaucao,
  sincronizarLancamentoParcela,
} from "@/lib/financeiro-lancamento";
import { parseDateInput } from "@/lib/utils";

/** Cria lançamentos no financeiro para parcelas/cauções já marcadas como pagas. */
export async function criarLancamentosFaltantesPagamentos() {
  await ensureCategoriasFinanceirasPadrao();

  const parcelasSemLancamento = await prisma.parcelaLocacao.findMany({
    where: {
      dataPagamento: { not: null },
      transacaoFinanceira: null,
    },
    include: {
      locacao: {
        include: {
          veiculo: { select: { placa: true } },
          cliente: { select: { nome: true } },
        },
      },
    },
  });

  for (const p of parcelasSemLancamento) {
    const valor = Number(p.valor);
    const data = parseDateInput(p.dataPagamento!);
    const descricaoJuros =
      Number(p.valorJuros) > 0
        ? ` (incl. juros R$ ${Number(p.valorJuros).toFixed(2)})`
        : "";

    await prisma.$transaction(async (tx) => {
      const categoria = await getCategoriaLocacaoVeiculos(tx);
      await sincronizarLancamentoParcela(tx, {
        categoriaId: categoria.id,
        tipo: "ENTRADA",
        valor,
        descricao: `Locação ${p.locacao.veiculo.placa} — ${p.locacao.cliente.nome}${descricaoJuros}`,
        data,
        parcelaId: p.id,
        locacaoId: p.locacaoId,
      });
    });
  }

  const categoriaCaucao = await getCategoriaCaucao(prisma);

  const locacoesCaucaoSemLancamento = await prisma.locacao.findMany({
    where: {
      caucaoPaga: true,
      valorCaucao: { gt: 0 },
    },
    include: {
      veiculo: { select: { placa: true } },
      cliente: { select: { nome: true } },
      transacoesFinanceiras: {
        where: {
          parcelaId: null,
          categoriaId: categoriaCaucao.id,
        },
        select: { id: true },
      },
    },
  });

  for (const loc of locacoesCaucaoSemLancamento) {
    if (loc.transacoesFinanceiras.length > 0) continue;

    const valorCaucao = Number(loc.valorCaucao);
    const data = parseDateInput(loc.caucaoDataPagamento ?? loc.dataInicio);

    await prisma.$transaction(async (tx) => {
      const categoria = await getCategoriaCaucao(tx);
      await sincronizarLancamentoCaucao(tx, {
        categoriaId: categoria.id,
        tipo: "ENTRADA",
        valor: valorCaucao,
        descricao: `Caução — ${loc.veiculo.placa} — ${loc.cliente.nome}`,
        data,
        formaPagamento: null,
        locacaoId: loc.id,
      });
    });
  }
}
