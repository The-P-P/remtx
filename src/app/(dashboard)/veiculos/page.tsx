import Link from "next/link";
import { Plus } from "lucide-react";
import { getVeiculos } from "@/lib/actions/veiculos";
import { PageHeader } from "@/components/shared/page-header";
import { PageActions } from "@/components/shared/page-actions";
import { Button } from "@/components/ui/button";
import { VeiculosList } from "@/components/veiculos/veiculos-list";
import { STATUS_VEICULO_LABEL } from "@/lib/constants/enums";
import type { StatusVeiculo } from "@/types/prisma";

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
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Gestão de Frota"
        description="Cadastro e acompanhamento de veículos da locadora"
        action={
          <PageActions>
            <Button className="w-full sm:w-auto" render={<Link href="/veiculos/novo" />}>
              <Plus className="size-4" />
              Novo veículo
            </Button>
          </PageActions>
        }
      />

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {FILTROS.map((f) => (
          <Link
            key={f.value || "all"}
            href={f.value ? `/veiculos?status=${f.value}` : "/veiculos"}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              (status ?? "") === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <VeiculosList veiculos={veiculos} />
    </div>
  );
}
