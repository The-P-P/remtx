import Link from "next/link";
import { X } from "lucide-react";
import {
  getManutencoes,
  getVeiculoParaFiltroManutencoes,
} from "@/lib/actions/manutencoes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ManutencoesHistoricoList } from "@/components/manutencoes/manutencoes-historico-list";
import { ManutencoesSection } from "@/components/manutencoes/manutencoes-section";

export default async function ManutencoesHistoricoPage({
  searchParams,
}: {
  searchParams: Promise<{ veiculoId?: string }>;
}) {
  const { veiculoId } = await searchParams;
  const [manutencoes, veiculoFiltro] = await Promise.all([
    getManutencoes(veiculoId),
    veiculoId ? getVeiculoParaFiltroManutencoes(veiculoId) : null,
  ]);

  return (
    <ManutencoesSection>
      {veiculoFiltro && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/40 px-4 py-3">
          <p className="text-sm">
            Manutenções de{" "}
            <strong>
              {veiculoFiltro.placa} — {veiculoFiltro.marca} {veiculoFiltro.modelo}
            </strong>
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              render={<Link href={`/veiculos/${veiculoFiltro.id}`} />}
            >
              Ver veículo
            </Button>
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/manutencoes" />}
            >
              <X className="size-4" />
              Limpar filtro
            </Button>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <ManutencoesHistoricoList manutencoes={manutencoes} />
        </CardContent>
      </Card>
    </ManutencoesSection>
  );
}
