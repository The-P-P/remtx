import Link from "next/link";
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
import { TransacoesList } from "@/components/financeiro/transacoes-list";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { financeiroQuery } from "@/lib/financeiro-periodo";
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
    de: params.de,
    ate: params.ate,
    tipo: params.tipo,
    categoriaId: params.categoriaId,
    q: params.q,
  };

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
    tipo: params.tipo,
    categoriaId: params.categoriaId,
    q: params.q,
  });

  const limparHref =
    resumoFinal.modo === "intervalo"
      ? `/financeiro?de=${params.de}&ate=${params.ate}`
      : financeiroQuery(resumoFinal.ano, resumoFinal.mes);

  const temFiltrosExtras =
    !!params.tipo || !!params.categoriaId || !!params.q;

  return (
    <FinanceiroSection
      novaTransacaoHref={novaHref}
      exportButton={<FinanceiroExportButton queryString={exportQuery} />}
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

      <FinanceiroResumoCategorias itens={resumoCategorias} />

      <FinanceiroConferenciaCard conferencia={conferenciaFinal} />

      <form method="get" className="space-y-3 rounded-lg border p-4">
        <p className="text-sm font-medium">Filtros</p>
        {resumoFinal.modo === "mes" && (
          <>
            <input type="hidden" name="ano" value={resumoFinal.ano} />
            <input type="hidden" name="mes" value={resumoFinal.mes} />
          </>
        )}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <label htmlFor="de" className="text-xs text-muted-foreground">
              De (opcional — substitui o mês)
            </label>
            <Input id="de" name="de" type="date" defaultValue={params.de ?? ""} />
          </div>
          <div className="space-y-1">
            <label htmlFor="ate" className="text-xs text-muted-foreground">
              Até
            </label>
            <Input id="ate" name="ate" type="date" defaultValue={params.ate ?? ""} />
          </div>
          <div className="space-y-1">
            <label htmlFor="q" className="text-xs text-muted-foreground">
              Buscar descrição
            </label>
            <Input
              id="q"
              name="q"
              placeholder="Ex.: placa, cliente..."
              defaultValue={params.q ?? ""}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="tipo" className="text-xs text-muted-foreground">
              Tipo
            </label>
            <select
              id="tipo"
              name="tipo"
              defaultValue={params.tipo ?? ""}
              className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30"
            >
              <option value="">Todos</option>
              <option value="ENTRADA">Entradas</option>
              <option value="SAIDA">Saídas</option>
            </select>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="categoriaId" className="text-xs text-muted-foreground">
              Categoria
            </label>
            <select
              id="categoriaId"
              name="categoriaId"
              defaultValue={params.categoriaId ?? ""}
              className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30"
            >
              <option value="">Todas</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} ({c.tipo === "ENTRADA" ? "E" : "S"})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="secondary">
            Aplicar filtros
          </Button>
          {(temFiltrosExtras || params.de) && (
            <Button variant="ghost" render={<Link href={limparHref} />}>
              Limpar
            </Button>
          )}
        </div>
      </form>

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
