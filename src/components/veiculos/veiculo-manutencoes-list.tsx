import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  veiculoId,
}: {
  manutencoes: ManutencaoResumo[];
  veiculoId: string;
}) {
  if (manutencoes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma manutenção registrada.{" "}
        <Link
          href={`/manutencoes/nova?veiculoId=${veiculoId}`}
          className="font-medium text-primary hover:underline"
        >
          Registrar primeira manutenção
        </Link>
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
                <div className="min-w-0">
                  <p className="font-medium">
                    {format(m.dataRealizada, "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                  <p className="text-muted-foreground">{m.tipoManutencao.nome}</p>
                </div>
                <div className="flex shrink-0 gap-0.5">
                  <Badge
                    className={`${estilo.bg} ${estilo.text} text-[10px]`}
                  >
                    {estilo.label}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    render={<Link href={`/manutencoes/${m.id}/editar`} />}
                  >
                    <Pencil className="size-4" />
                  </Button>
                </div>
              </div>
              <p className="mt-2 text-xs">
                {formatKm(m.kmRealizada)} → próx. {formatKm(m.kmProxima)}
                {m.custo ? ` · ${formatCurrency(Number(m.custo))}` : ""}
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
              <TableHead>Próxima</TableHead>
              <TableHead className="text-right">Ações</TableHead>
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
                    <span className="text-xs">{formatKm(m.kmProxima)}</span>
                    <Badge
                      className={`ml-1 ${estilo.bg} ${estilo.text} text-[10px]`}
                    >
                      {estilo.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      render={<Link href={`/manutencoes/${m.id}/editar`} />}
                    >
                      <Pencil className="size-4" />
                    </Button>
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
