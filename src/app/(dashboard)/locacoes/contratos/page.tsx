import Link from "next/link";
import { getLocacoes } from "@/lib/actions/locacoes";
import { LocacoesSection } from "@/components/locacoes/locacoes-section";
import { LocacoesList } from "@/components/locacoes/locacoes-list";
import { STATUS_LOCACAO_LABEL } from "@/lib/constants/enums";
import type { StatusLocacao } from "@/types/prisma";

const FILTROS: { value: string; label: string }[] = [
  { value: "", label: "Todos" },
  ...(
    Object.entries(STATUS_LOCACAO_LABEL) as [StatusLocacao, string][]
  ).map(([value, label]) => ({ value, label })),
];

export default async function ContratosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const locacoes = await getLocacoes(status || undefined);

  return (
    <LocacoesSection>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {FILTROS.map((f) => (
          <Link
            key={f.value || "all"}
            href={
              f.value
                ? `/locacoes/contratos?status=${f.value}`
                : "/locacoes/contratos"
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
    </LocacoesSection>
  );
}
