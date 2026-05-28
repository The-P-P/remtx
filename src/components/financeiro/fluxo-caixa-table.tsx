"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { format, isWithinInterval, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type {
  FluxoGranularidade,
  FluxoPeriodoItem,
} from "@/lib/actions/financeiro";

export function FluxoCaixaTable({
  ano,
  granularidade,
  periodos,
  totalEntradas,
  totalSaidas,
  saldoAno,
}: {
  ano: number;
  granularidade: FluxoGranularidade;
  periodos: FluxoPeriodoItem[];
  totalEntradas: number;
  totalSaidas: number;
  saldoAno: number;
}) {
  const agora = new Date().getFullYear();
  const tabelaRef = useRef<HTMLDivElement | null>(null);
  const labelGranularidade =
    granularidade === "diario"
      ? "Diário"
      : granularidade === "semanal"
        ? "Semanal"
        : "Mensal";
  const hoje = startOfDay(new Date());

  const periodoAtualKey = useMemo(() => {
    if (ano !== hoje.getFullYear()) return null;
    const atual = periodos.find((p) =>
      isWithinInterval(hoje, {
        start: startOfDay(p.inicio),
        end: startOfDay(p.fim),
      })
    );
    return atual?.chave ?? null;
  }, [ano, hoje, periodos]);

  useEffect(() => {
    if (!periodoAtualKey || !tabelaRef.current) return;
    const el = tabelaRef.current.querySelector<HTMLElement>(
      `[data-periodo="${periodoAtualKey}"]`
    );
    if (!el) return;
    el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [periodoAtualKey, granularidade]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/70 bg-card/80 p-2 shadow-sm">
        <span className="px-2 text-xs text-muted-foreground">Visualização:</span>
        <Button
          variant={granularidade === "mensal" ? "secondary" : "ghost"}
          size="sm"
          render={<Link href={`/financeiro/fluxo?ano=${ano}&granularidade=mensal`} />}
        >
          Mensal
        </Button>
        <Button
          variant={granularidade === "semanal" ? "secondary" : "ghost"}
          size="sm"
          render={<Link href={`/financeiro/fluxo?ano=${ano}&granularidade=semanal`} />}
        >
          Semanal
        </Button>
        <Button
          variant={granularidade === "diario" ? "secondary" : "ghost"}
          size="sm"
          render={<Link href={`/financeiro/fluxo?ano=${ano}&granularidade=diario`} />}
        >
          Diário
        </Button>
      </div>

      <div className="flex items-center justify-between gap-2 rounded-2xl border border-border/70 bg-card/80 px-2 py-1 shadow-sm">
        <Button
          variant="ghost"
          size="icon-sm"
          render={
            <Link
              href={`/financeiro/fluxo?ano=${ano - 1}&granularidade=${granularidade}`}
            />
          }
        >
          <ChevronLeft className="size-4" />
        </Button>
        <p className="text-sm font-medium">{ano}</p>
        <Button
          variant="ghost"
          size="icon-sm"
          render={
            <Link
              href={`/financeiro/fluxo?ano=${ano + 1}&granularidade=${granularidade}`}
              aria-disabled={ano >= agora + 1}
            />
          }
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle className="text-base">
            Resumo anual ({labelGranularidade})
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3 text-sm">
          <div>
            <p className="text-muted-foreground">Total entradas</p>
            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-500">
              {formatCurrency(totalEntradas)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Total saídas</p>
            <p className="text-lg font-bold text-red-700 dark:text-red-500">
              {formatCurrency(totalSaidas)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Saldo do ano</p>
            <p
              className={`text-lg font-bold ${saldoAno >= 0 ? "text-blue-700 dark:text-blue-500" : "text-red-700 dark:text-red-500"}`}
            >
              {formatCurrency(saldoAno)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/10">
        <CardContent className="p-0 overflow-x-auto max-h-[65vh]" ref={tabelaRef}>
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b bg-muted/45 text-left">
                <th className="px-4 py-3 font-medium">Período</th>
                <th className="px-4 py-3 font-medium text-emerald-700 dark:text-emerald-500">
                  Entradas
                </th>
                <th className="px-4 py-3 font-medium text-red-700 dark:text-red-500">
                  Saídas
                </th>
                <th className="px-4 py-3 font-medium">Saldo</th>
                <th className="px-4 py-3 font-medium w-20" />
              </tr>
            </thead>
            <tbody>
              {periodos.map((p) => {
                const isAtual = p.chave === periodoAtualKey;
                return (
                <tr
                  key={p.chave}
                  data-periodo={p.chave}
                  className={`border-b last:border-0 transition-colors ${isAtual ? "bg-blue-50/75 dark:bg-blue-500/10" : "hover:bg-muted/35"}`}
                >
                  <td className="px-4 py-3 font-medium capitalize">
                    {granularidade === "mensal"
                      ? format(p.inicio, "MMMM", { locale: ptBR })
                      : granularidade === "semanal"
                        ? `${format(p.inicio, "dd/MM", { locale: ptBR })} — ${format(p.fim, "dd/MM", { locale: ptBR })}`
                        : format(p.inicio, "dd/MM/yyyy", { locale: ptBR })}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-emerald-700 dark:text-emerald-500">
                    {formatCurrency(p.entradas)}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-red-700 dark:text-red-500">
                    {formatCurrency(p.saidas)}
                  </td>
                  <td
                    className={`px-4 py-3 tabular-nums font-medium ${p.saldo >= 0 ? "text-blue-700 dark:text-blue-500" : "text-red-700 dark:text-red-500"}`}
                  >
                    {formatCurrency(p.saldo)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={
                        granularidade === "mensal"
                          ? `/financeiro?ano=${ano}&mes=${p.inicio.getMonth() + 1}`
                          : `/financeiro?de=${format(p.inicio, "yyyy-MM-dd")}&ate=${format(p.fim, "yyyy-MM-dd")}`
                      }
                      className="text-xs font-medium text-primary underline-offset-2 hover:underline"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              )})}
            </tbody>
            <tfoot>
              <tr className="bg-muted/30 font-semibold">
                <td className="px-4 py-3">Total {ano}</td>
                <td className="px-4 py-3 tabular-nums text-emerald-700 dark:text-emerald-500">
                  {formatCurrency(totalEntradas)}
                </td>
                <td className="px-4 py-3 tabular-nums text-red-700 dark:text-red-500">
                  {formatCurrency(totalSaidas)}
                </td>
                <td
                  className={`px-4 py-3 tabular-nums ${saldoAno >= 0 ? "text-blue-700 dark:text-blue-500" : "text-red-700 dark:text-red-500"}`}
                  colSpan={2}
                >
                  {formatCurrency(saldoAno)}
                </td>
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
