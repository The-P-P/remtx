import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { FluxoMensalItem } from "@/lib/actions/financeiro";

export function FluxoCaixaTable({
  ano,
  meses,
  totalEntradas,
  totalSaidas,
  saldoAno,
}: {
  ano: number;
  meses: FluxoMensalItem[];
  totalEntradas: number;
  totalSaidas: number;
  saldoAno: number;
}) {
  const agora = new Date().getFullYear();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/30 px-2 py-1">
        <Button
          variant="ghost"
          size="icon-sm"
          render={<Link href={`/financeiro/fluxo?ano=${ano - 1}`} />}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <p className="text-sm font-medium">{ano}</p>
        <Button
          variant="ghost"
          size="icon-sm"
          render={
            <Link
              href={`/financeiro/fluxo?ano=${ano + 1}`}
              aria-disabled={ano >= agora + 1}
            />
          }
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumo anual</CardTitle>
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

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left">
                <th className="px-4 py-3 font-medium">Mês</th>
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
              {meses.map((m) => (
                <tr key={m.mes} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium capitalize">
                    {format(new Date(ano, m.mes - 1, 1), "MMMM", {
                      locale: ptBR,
                    })}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-emerald-700 dark:text-emerald-500">
                    {formatCurrency(m.entradas)}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-red-700 dark:text-red-500">
                    {formatCurrency(m.saidas)}
                  </td>
                  <td
                    className={`px-4 py-3 tabular-nums font-medium ${m.saldo >= 0 ? "text-blue-700 dark:text-blue-500" : "text-red-700 dark:text-red-500"}`}
                  >
                    {formatCurrency(m.saldo)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/financeiro?ano=${ano}&mes=${m.mes}`}
                      className="text-xs text-primary underline"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
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
