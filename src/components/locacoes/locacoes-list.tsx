import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { labelDataFimPrevista } from "@/lib/format/locacao";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LocacaoStatusBadge } from "@/components/locacoes/locacao-status-badge";
import { formatCurrency } from "@/lib/utils";
import type { getLocacoes } from "@/lib/actions/locacoes";

type LocacaoItem = Awaited<ReturnType<typeof getLocacoes>>[number];

export function LocacoesList({ locacoes }: { locacoes: LocacaoItem[] }) {
  if (locacoes.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhuma locação encontrada.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {locacoes.map((l) => (
        <Card key={l.id}>
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <LocacaoStatusBadge status={l.status} />
                <span className="rounded-md bg-muted/60 px-2 py-0.5 font-mono text-xs font-semibold">
                  {l.veiculo.placa}
                </span>
              </div>
              <p className="text-sm leading-6">
                <strong>{l.cliente.nome}</strong> · {l.veiculo.marca}{" "}
                {l.veiculo.modelo}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(l.dataInicio, "dd/MM/yyyy", { locale: ptBR })} →{" "}
                {labelDataFimPrevista(l.dataFimPrevista)} ·{" "}
                {formatCurrency(Number(l.valorDiaria))}/semana
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              render={<Link href={`/locacoes/${l.id}`} />}
            >
              <Eye className="size-4" />
              Ver contrato
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
