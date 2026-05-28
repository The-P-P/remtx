import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function RelatoriosKpiCards({
  data,
}: {
  data: {
    receita: number;
    despesa: number;
    lucro: number;
    custoManutencao: number;
    ticketMedio: number;
    taxaOcupacao: number;
    inadimplencia: number;
  };
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Receita</p><p className="text-lg font-bold text-emerald-700 dark:text-emerald-500">{formatCurrency(data.receita)}</p></CardContent></Card>
      <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Despesa</p><p className="text-lg font-bold text-red-700 dark:text-red-500">{formatCurrency(data.despesa)}</p></CardContent></Card>
      <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Lucro</p><p className={`text-lg font-bold ${data.lucro >= 0 ? "text-blue-700 dark:text-blue-500" : "text-red-700 dark:text-red-500"}`}>{formatCurrency(data.lucro)}</p></CardContent></Card>
      <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Custo manutenção</p><p className="text-lg font-bold">{formatCurrency(data.custoManutencao)}</p></CardContent></Card>
      <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Ticket médio</p><p className="text-lg font-bold">{formatCurrency(data.ticketMedio)}</p></CardContent></Card>
      <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Taxa ocupação</p><p className="text-lg font-bold">{data.taxaOcupacao.toFixed(1)}%</p></CardContent></Card>
      <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Inadimplência</p><p className="text-lg font-bold">{data.inadimplencia.toFixed(1)}%</p></CardContent></Card>
    </div>
  );
}
