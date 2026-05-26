import Link from "next/link";
import { Calendar } from "lucide-react";
import { getLocacoes } from "@/lib/actions/locacoes";
import { ClientesSection } from "@/components/clientes/clientes-section";
import { LocacoesList } from "@/components/locacoes/locacoes-list";
import { PageActions } from "@/components/shared/page-actions";
import { Button } from "@/components/ui/button";
import { STATUS_LOCACAO_LABEL } from "@/lib/constants/enums";
import type { StatusLocacao } from "@/types/prisma";

const FILTROS: { value: string; label: string }[] = [
  { value: "", label: "Todos" },
  ...(
    Object.entries(STATUS_LOCACAO_LABEL) as [StatusLocacao, string][]
  ).map(([value, label]) => ({ value, label })),
];

export default async function ClientesContratosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const locacoes = await getLocacoes(status || undefined);

  return (
    <ClientesSection
      description="Contratos de locação — reservas, ativos e histórico"
      action={
        <PageActions>
          <Button
            className="w-full sm:w-auto"
            render={<Link href="/clientes/locacoes/nova" />}
          >
            <Calendar className="size-4" />
            Nova locação
          </Button>
        </PageActions>
      }
    >
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {FILTROS.map((f) => (
          <Link
            key={f.value || "all"}
            href={
              f.value
                ? `/clientes/contratos?status=${f.value}`
                : "/clientes/contratos"
            }
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
      <LocacoesList locacoes={locacoes} />
    </ClientesSection>
  );
}
