import Link from "next/link";
import {
  getTransacoes,
  getResumoFinanceiro,
  getCategoriasFinanceiras,
} from "@/lib/actions/financeiro";
import { FinanceiroSection } from "@/components/financeiro/financeiro-section";
import { FinanceiroMesNav } from "@/components/financeiro/financeiro-mes-nav";
import { FinanceiroResumoCards } from "@/components/financeiro/financeiro-resumo-cards";
import { TransacoesList } from "@/components/financeiro/transacoes-list";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { financeiroQuery } from "@/lib/financeiro-periodo";

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ ano?: string; mes?: string; tipo?: string; categoriaId?: string }>;
}) {
  const params = await searchParams;
  const [resumo, transacoes, categorias] = await Promise.all([
    getResumoFinanceiro(params),
    getTransacoes(params),
    getCategoriasFinanceiras(true),
  ]);

  const extraParts: string[] = [];
  if (params.tipo === "ENTRADA" || params.tipo === "SAIDA") {
    extraParts.push(`tipo=${params.tipo}`);
  }
  if (params.categoriaId) extraParts.push(`categoriaId=${params.categoriaId}`);
  const extraQuery = extraParts.join("&") || undefined;

  const novaHref = financeiroQuery(resumo.ano, resumo.mes).replace(
    "/financeiro?",
    "/financeiro/nova?"
  );

  return (
    <FinanceiroSection novaTransacaoHref={novaHref}>
      <FinanceiroMesNav
        ano={resumo.ano}
        mes={resumo.mes}
        extraQuery={extraQuery}
      />

      <FinanceiroResumoCards
        entradas={resumo.entradas}
        saidas={resumo.saidas}
        saldo={resumo.saldo}
      />

      <form method="get" className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="ano" value={resumo.ano} />
        <input type="hidden" name="mes" value={resumo.mes} />
        <div className="space-y-1">
          <label htmlFor="tipo" className="text-xs text-muted-foreground">
            Tipo
          </label>
          <select
            id="tipo"
            name="tipo"
            defaultValue={params.tipo ?? ""}
            className="flex h-8 min-w-[120px] rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30"
          >
            <option value="">Todos</option>
            <option value="ENTRADA">Entradas</option>
            <option value="SAIDA">Saídas</option>
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="categoriaId" className="text-xs text-muted-foreground">
            Categoria
          </label>
          <select
            id="categoriaId"
            name="categoriaId"
            defaultValue={params.categoriaId ?? ""}
            className="flex h-8 min-w-[160px] rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30"
          >
            <option value="">Todas</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome} ({c.tipo === "ENTRADA" ? "E" : "S"})
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" variant="secondary">
          Filtrar
        </Button>
        {(params.tipo || params.categoriaId) && (
          <Button
            variant="ghost"
            render={
              <Link href={financeiroQuery(resumo.ano, resumo.mes)} />
            }
          >
            Limpar
          </Button>
        )}
      </form>

      <Card>
        <CardContent className="p-0">
          <TransacoesList
            transacoes={transacoes}
            ano={resumo.ano}
            mes={resumo.mes}
          />
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        {resumo.quantidade} lançamento(s) no período. Pagamentos confirmados na
        agenda de locações aparecem aqui quando marcados para registrar no
        financeiro.
      </p>
    </FinanceiroSection>
  );
}
