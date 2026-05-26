import { ArrowDownLeft, ArrowUpRight, Scale } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function FinanceiroResumoCards({
  entradas,
  saidas,
  saldo,
}: {
  entradas: number;
  saidas: number;
  saldo: number;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Card>
        <CardContent className="flex items-center gap-3 pt-6">
          <ArrowUpRight className="size-7 text-emerald-600 dark:text-emerald-500" />
          <div>
            <p className="text-xs text-muted-foreground">Entradas</p>
            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-500">
              {formatCurrency(entradas)}
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-3 pt-6">
          <ArrowDownLeft className="size-7 text-red-600 dark:text-red-500" />
          <div>
            <p className="text-xs text-muted-foreground">Saídas</p>
            <p className="text-lg font-bold text-red-700 dark:text-red-500">
              {formatCurrency(saidas)}
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-3 pt-6">
          <Scale
            className={`size-7 ${saldo >= 0 ? "text-blue-600 dark:text-blue-500" : "text-red-600 dark:text-red-500"}`}
          />
          <div>
            <p className="text-xs text-muted-foreground">Saldo do período</p>
            <p
              className={`text-lg font-bold ${saldo >= 0 ? "text-blue-700 dark:text-blue-500" : "text-red-700 dark:text-red-500"}`}
            >
              {formatCurrency(saldo)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
