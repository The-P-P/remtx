import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ALERTA_CORES } from "@/lib/manutencao-alerts";
import { formatKm, formatCurrency } from "@/lib/utils";
import type { getVeiculoById } from "@/lib/actions/veiculos";

type ManutencaoResumo = NonNullable<
  Awaited<ReturnType<typeof getVeiculoById>>
>["manutencoes"][number];

export function VeiculoManutencoesList({
  manutencoes,
}: {
  manutencoes: ManutencaoResumo[];
}) {
  if (manutencoes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma manutenção registrada.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-2 md:hidden">
        {manutencoes.map((m) => {
          const estilo = ALERTA_CORES[m.alerta];
          return (
            <div
              key={m.id}
              className="rounded-lg border bg-muted/30 p-3 text-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">
                    {format(m.dataRealizada, "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                  <p className="text-muted-foreground">{m.tipoManutencao.nome}</p>
                </div>
                <Badge
                  className={`shrink-0 ${estilo.bg} ${estilo.text} text-[10px]`}
                >
                  {estilo.label}
                </Badge>
              </div>
              <p className="mt-2 text-xs">
                {formatKm(m.kmRealizada)}
                {m.custo ? ` · ${formatCurrency(Number(m.custo))}` : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                {m.pecas.length} peça(s)
              </p>
            </div>
          );
        })}
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Km</TableHead>
              <TableHead>Peças</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {manutencoes.map((m) => {
              const estilo = ALERTA_CORES[m.alerta];
              return (
                <TableRow key={m.id}>
                  <TableCell>
                    {format(m.dataRealizada, "dd/MM/yy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>{m.tipoManutencao.nome}</TableCell>
                  <TableCell>{formatKm(m.kmRealizada)}</TableCell>
                  <TableCell>
                    <span className="text-xs">
                      {m.pecas.length} peça(s)
                      {m.custo ? ` · ${formatCurrency(Number(m.custo))}` : ""}
                    </span>
                    <Badge
                      className={`ml-1 ${estilo.bg} ${estilo.text} text-[10px]`}
                    >
                      {estilo.label}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
