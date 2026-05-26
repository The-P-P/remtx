import Link from "next/link";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  ano: number;
  mes: number;
  basePath?: string;
  extraQuery?: string;
};

function hrefMes(basePath: string, ano: number, mes: number, extra?: string) {
  const q = `ano=${ano}&mes=${mes}${extra ? `&${extra}` : ""}`;
  return `${basePath}?${q}`;
}

export function FinanceiroMesNav({
  ano,
  mes,
  basePath = "/financeiro",
  extraQuery,
}: Props) {
  const ref = new Date(ano, mes - 1, 1);
  const anterior = subMonths(ref, 1);
  const proximo = addMonths(ref, 1);
  const label = format(ref, "MMMM yyyy", { locale: ptBR });

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/30 px-2 py-1">
      <Button
        variant="ghost"
        size="icon-sm"
        render={
          <Link
            href={hrefMes(
              basePath,
              anterior.getFullYear(),
              anterior.getMonth() + 1,
              extraQuery
            )}
          />
        }
      >
        <ChevronLeft className="size-4" />
      </Button>
      <p className="text-sm font-medium capitalize">{label}</p>
      <Button
        variant="ghost"
        size="icon-sm"
        render={
          <Link
            href={hrefMes(
              basePath,
              proximo.getFullYear(),
              proximo.getMonth() + 1,
              extraQuery
            )}
          />
        }
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
