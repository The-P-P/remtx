import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { ResumoCategoriaItem } from "@/lib/actions/financeiro";

export function FinanceiroResumoCategorias({
  itens,
}: {
  itens: ResumoCategoriaItem[];
}) {
  if (itens.length === 0) return null;

  const entradas = itens.filter((i) => i.tipo === "ENTRADA");
  const saidas = itens.filter((i) => i.tipo === "SAIDA");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Por categoria no período</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-2">
        {entradas.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase text-emerald-700 dark:text-emerald-400">
              Entradas
            </p>
            <ul className="space-y-1.5 text-sm">
              {entradas.map((i) => (
                <li key={i.categoriaId} className="flex justify-between gap-2">
                  <span className="text-muted-foreground">{i.nome}</span>
                  <span className="font-medium tabular-nums text-emerald-700 dark:text-emerald-500">
                    {formatCurrency(i.total)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {saidas.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase text-red-700 dark:text-red-400">
              Saídas
            </p>
            <ul className="space-y-1.5 text-sm">
              {saidas.map((i) => (
                <li key={i.categoriaId} className="flex justify-between gap-2">
                  <span className="text-muted-foreground">{i.nome}</span>
                  <span className="font-medium tabular-nums text-red-700 dark:text-red-500">
                    {formatCurrency(i.total)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
