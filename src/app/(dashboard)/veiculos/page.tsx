import Link from "next/link";
import { Plus, Eye, Pencil } from "lucide-react";
import { getVeiculos } from "@/lib/actions/veiculos";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusVeiculoBadge } from "@/components/veiculos/status-badge";
import { AlertaKmBadge } from "@/components/veiculos/alerta-km-badge";
import { STATUS_VEICULO_LABEL } from "@/lib/constants/enums";
import type { StatusVeiculo } from "@/types/prisma";
import { formatKm } from "@/lib/utils";

const FILTROS: { value: string; label: string }[] = [
  { value: "", label: "Todos" },
  ...(
    Object.entries(STATUS_VEICULO_LABEL) as [StatusVeiculo, string][]
  ).map(([value, label]) => ({ value, label })),
];

export default async function VeiculosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const veiculos = await getVeiculos(status || undefined);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestão de Frota"
        description="Cadastro e acompanhamento de veículos da locadora"
        action={
          <Button render={<Link href="/veiculos/novo" />}>
            <Plus className="size-4" />
            Novo veículo
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <Link
            key={f.value || "all"}
            href={f.value ? `/veiculos?status=${f.value}` : "/veiculos"}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              (status ?? "") === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Placa</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Km atual</TableHead>
                <TableHead>Revisão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Alerta km</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {veiculos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    Nenhum veículo encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                veiculos.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-mono font-medium">{v.placa}</TableCell>
                    <TableCell>
                      {v.marca} {v.modelo} ({v.ano})
                    </TableCell>
                    <TableCell>{formatKm(v.kmAtual)}</TableCell>
                    <TableCell>{formatKm(v.kmProximaRevisao)}</TableCell>
                    <TableCell>
                      <StatusVeiculoBadge status={v.status} />
                    </TableCell>
                    <TableCell>
                      <AlertaKmBadge
                        kmAtual={v.kmAtual}
                        kmProximaRevisao={v.kmProximaRevisao}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" render={<Link href={`/veiculos/${v.id}`} />}>
                          <Eye className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" render={<Link href={`/veiculos/${v.id}/editar`} />}>
                          <Pencil className="size-4" />
                        </Button>
                      </div>
                      {v._count.problemasCronicos > 0 && (
                        <span className="text-xs text-red-600">
                          {v._count.problemasCronicos} problema(s)
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
