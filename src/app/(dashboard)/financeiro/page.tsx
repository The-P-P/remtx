import {
  getTransacoes,
  getResumoFinanceiro,
  getResumoPorCategoria,
  getCategoriasFinanceiras,
} from "@/lib/actions/financeiro";
import { getConferenciaLocacaoPeriodo } from "@/lib/financeiro-conferencia";
import { FinanceiroSection } from "@/components/financeiro/financeiro-section";
import { FinanceiroMesNav } from "@/components/financeiro/financeiro-mes-nav";
import { FinanceiroResumoCards } from "@/components/financeiro/financeiro-resumo-cards";
import { FinanceiroResumoCategorias } from "@/components/financeiro/financeiro-resumo-categorias";
import { FinanceiroConferenciaCard } from "@/components/financeiro/financeiro-conferencia-card";
import { FinanceiroExportButton } from "@/components/financeiro/financeiro-export-button";
import { FinanceiroFiltrosSheet } from "@/components/financeiro/financeiro-filtros-sheet";
import { TransacoesList } from "@/components/financeiro/transacoes-list";
import { Card, CardContent } from "@/components/ui/card";
import { financeiroQuery } from "@/lib/financeiro-periodo";
import { criarLancamentosFaltantesPagamentos } from "@/lib/financeiro-sync-parcelas";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function buildQueryString(params: Record<string, string | undefined>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) q.set(k, v);
  }
  return q.toString();
}

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{
    ano?: string;
    mes?: string;
    periodoTipo?: string;
    dataRef?: string;
    de?: string;
    ate?: string;
    tipo?: string;
    categoriaId?: string;
    q?: string;
  }>;
}) {
  const params = await searchParams;
  const filtros = {
    ano: params.ano,
    mes: params.mes,
    periodoTipo: params.periodoTipo,
    dataRef: params.dataRef,
    de: params.de,
    ate: params.ate,
    tipo: params.tipo,
    categoriaId: params.categoriaId,
    q: params.q,
  };

  await criarLancamentosFaltantesPagamentos();

  const [resumoFinal, transacoes, categorias, resumoCategorias] =
    await Promise.all([
      getResumoFinanceiro(filtros),
      getTransacoes(filtros),
      getCategoriasFinanceiras(true),
      getResumoPorCategoria(filtros),
    ]);

  const conferenciaFinal = await getConferenciaLocacaoPeriodo(
    resumoFinal.inicio,
    resumoFinal.fim
  );

  const extra: Record<string, string | undefined> = {
    tipo: params.tipo,
    categoriaId: params.categoriaId,
    q: params.q,
    periodoTipo: params.periodoTipo,
    dataRef: params.dataRef,
    de: params.de,
    ate: params.ate,
  };

  const novaHref = financeiroQuery(resumoFinal.ano, resumoFinal.mes, {
    ...extra,
  }).replace("/financeiro?", "/financeiro/nova?");

  const exportQuery = buildQueryString({
    ano: params.de && params.ate ? undefined : String(resumoFinal.ano),
    mes: params.de && params.ate ? undefined : String(resumoFinal.mes),
    de: params.de,
    ate: params.ate,
    periodoTipo: params.periodoTipo,
    dataRef: params.dataRef,
    tipo: params.tipo,
    categoriaId: params.categoriaId,
    q: params.q,
  });

  const limparHref =
    resumoFinal.modo === "intervalo"
      ? `/financeiro?de=${params.de}&ate=${params.ate}`
      : financeiroQuery(resumoFinal.ano, resumoFinal.mes);

  return (
    <FinanceiroSection
      novaTransacaoHref={novaHref}
      exportButton={<FinanceiroExportButton queryString={exportQuery} />}
      navAction={
        <FinanceiroFiltrosSheet
          ano={resumoFinal.ano}
          mes={resumoFinal.mes}
          categorias={categorias}
          defaults={{
            periodoTipo: params.periodoTipo,
            dataRef: params.dataRef,
            de: params.de,
            ate: params.ate,
            q: params.q,
            tipo: params.tipo,
            categoriaId: params.categoriaId,
          }}
          limparHref={limparHref}
        />
      }
    >
      {resumoFinal.modo === "mes" ? (
        <FinanceiroMesNav
          ano={resumoFinal.ano}
          mes={resumoFinal.mes}
          extraQuery={buildQueryString(extra)}
        />
      ) : (
        <p className="rounded-lg border bg-muted/30 px-4 py-2 text-sm text-center capitalize">
          Período:{" "}
          {format(resumoFinal.inicio, "dd/MM/yyyy", { locale: ptBR })} —{" "}
          {format(resumoFinal.fim, "dd/MM/yyyy", { locale: ptBR })}
        </p>
      )}

      <FinanceiroResumoCards
        entradas={resumoFinal.entradas}
        saidas={resumoFinal.saidas}
        saldo={resumoFinal.saldo}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <FinanceiroResumoCategorias itens={resumoCategorias} />
        <FinanceiroConferenciaCard conferencia={conferenciaFinal} />
      </div>

      <Card>
        <CardContent className="p-0">
          <TransacoesList
            transacoes={transacoes}
            ano={resumoFinal.ano}
            mes={resumoFinal.mes}
          />
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        {resumoFinal.quantidade} lançamento(s) no período. Pagamentos da agenda e
        manutenções podem gerar lançamentos automaticamente.
      </p>
    </FinanceiroSection>
  );
}
