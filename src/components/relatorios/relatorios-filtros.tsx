import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function RelatoriosFiltros({
  ano,
  mes,
  de,
  ate,
}: {
  ano: number;
  mes: number;
  de?: string;
  ate?: string;
}) {
  return (
    <form method="get" className="rounded-lg border p-4 space-y-3">
      <p className="text-sm font-medium">Filtros</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <label htmlFor="ano" className="text-xs text-muted-foreground">Ano (modo mensal)</label>
          <Input id="ano" name="ano" type="number" defaultValue={ano} />
        </div>
        <div className="space-y-1">
          <label htmlFor="mes" className="text-xs text-muted-foreground">Mês</label>
          <Input id="mes" name="mes" type="number" min={1} max={12} defaultValue={mes} />
        </div>
        <div className="space-y-1">
          <label htmlFor="de" className="text-xs text-muted-foreground">De (opcional)</label>
          <Input id="de" name="de" type="date" defaultValue={de ?? ""} />
        </div>
        <div className="space-y-1">
          <label htmlFor="ate" className="text-xs text-muted-foreground">Até</label>
          <Input id="ate" name="ate" type="date" defaultValue={ate ?? ""} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" variant="secondary">Aplicar</Button>
        <Button type="button" variant="ghost" render={<a href="/relatorios" />}>Limpar</Button>
      </div>
      <Card className="bg-muted/30">
        <CardContent className="pt-4 text-xs text-muted-foreground">
          Se informar De/Até, o relatório usa o intervalo. Sem intervalo, usa Ano/Mês.
        </CardContent>
      </Card>
    </form>
  );
}
