import Link from "next/link";
import { format, startOfMonth, subDays, subMonths } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function presetHref(params: Record<string, string>) {
  const q = new URLSearchParams(params);
  return `/relatorios?${q.toString()}`;
}

export function RelatoriosFiltros({
  ano,
  mes,
  de,
  ate,
  activePreset,
}: {
  ano: number;
  mes: number;
  de?: string;
  ate?: string;
  activePreset?: string;
}) {
  const hoje = new Date();
  const inicioMes = startOfMonth(hoje);

  const presets = [
    {
      key: "mes",
      label: "Este mês",
      href: presetHref({
        ano: String(hoje.getFullYear()),
        mes: String(hoje.getMonth() + 1),
      }),
    },
    {
      key: "mes-anterior",
      label: "Mês passado",
      href: presetHref({
        ano: String(subMonths(hoje, 1).getFullYear()),
        mes: String(subMonths(hoje, 1).getMonth() + 1),
      }),
    },
    {
      key: "30d",
      label: "Últimos 30 dias",
      href: presetHref({
        de: format(subDays(hoje, 29), "yyyy-MM-dd"),
        ate: format(hoje, "yyyy-MM-dd"),
      }),
    },
    {
      key: "90d",
      label: "Últimos 90 dias",
      href: presetHref({
        de: format(subDays(hoje, 89), "yyyy-MM-dd"),
        ate: format(hoje, "yyyy-MM-dd"),
      }),
    },
  ];

  return (
    <form method="get" className="space-y-3 rounded-lg border p-3 sm:p-4">
      <p className="text-sm font-medium">Filtros de período</p>
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {presets.map((p) => (
          <Link
            key={p.key}
            href={p.href}
            className={cn(
              "shrink-0 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
              activePreset === p.key
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/70 text-muted-foreground hover:bg-muted/50"
            )}
          >
            {p.label}
          </Link>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <label htmlFor="ano" className="text-xs text-muted-foreground">
            Ano (modo mensal)
          </label>
          <Input id="ano" name="ano" type="number" defaultValue={ano} />
        </div>
        <div className="space-y-1">
          <label htmlFor="mes" className="text-xs text-muted-foreground">
            Mês
          </label>
          <Input
            id="mes"
            name="mes"
            type="number"
            min={1}
            max={12}
            defaultValue={mes}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="de" className="text-xs text-muted-foreground">
            De (intervalo)
          </label>
          <Input id="de" name="de" type="date" defaultValue={de ?? ""} />
        </div>
        <div className="space-y-1">
          <label htmlFor="ate" className="text-xs text-muted-foreground">
            Até
          </label>
          <Input id="ate" name="ate" type="date" defaultValue={ate ?? ""} />
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="submit" variant="secondary" className="w-full sm:w-auto">
          Aplicar
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full sm:w-auto"
          render={<Link href="/relatorios" />}
        >
          Limpar
        </Button>
      </div>

      <Card className="bg-muted/30">
        <CardContent className="pt-4 text-xs text-muted-foreground">
          Use os atalhos ou informe De/Até para intervalo personalizado. Sem
          intervalo, usa Ano/Mês ({format(inicioMes, "MM/yyyy")} como referência).
        </CardContent>
      </Card>
    </form>
  );
}
