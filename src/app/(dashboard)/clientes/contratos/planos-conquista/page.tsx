import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getPlanosConquista } from "@/lib/actions/contratos";
import { ClientesSection } from "@/components/clientes/clientes-section";
import { ContratosNav } from "@/components/clientes/contratos-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { STATUS_PLANO_CONQUISTA_LABEL } from "@/lib/constants/enums";
import { Eye } from "lucide-react";

const FILTROS = [
  { value: "", label: "Todos" },
  { value: "ATIVO", label: "Ativos" },
  { value: "CONCLUIDO", label: "Concluídos" },
  { value: "CANCELADO", label: "Cancelados" },
];

export default async function PlanosConquistaPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const planos = await getPlanosConquista(status || undefined);

  return (
    <ClientesSection description="Acompanhamento do Plano Conquista por cliente">
      <ContratosNav />
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {FILTROS.map((f) => (
          <Link
            key={f.value || "all"}
            href={
              f.value
                ? `/clientes/contratos/planos-conquista?status=${f.value}`
                : "/clientes/contratos/planos-conquista"
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

      {planos.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nenhum plano Conquista cadastrado.
        </p>
      ) : (
        <div className="space-y-3">
          {planos.map((p) => {
            const pct = Math.round((p.mesesPagos / p.totalMeses) * 100);
            return (
              <Card key={p.id}>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">
                        {STATUS_PLANO_CONQUISTA_LABEL[p.status]}
                      </Badge>
                      <span className="font-mono text-xs">
                        {p.locacao.numeroContrato ?? "—"}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{p.cliente.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.locacao.veiculo.placa} — {p.locacao.veiculo.marca}{" "}
                      {p.locacao.veiculo.modelo}
                    </p>
                    <div className="h-2 max-w-md overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-violet-600"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {p.mesesPagos}/{p.totalMeses} mensalidades ({pct}%) ·{" "}
                      {formatCurrency(Number(p.valorMensal))}/mês · Adesão{" "}
                      {p.adesaoPaga ? "paga" : "pendente"}
                      {p.dataPrevistaConclusao &&
                        ` · Previsão ${format(p.dataPrevistaConclusao, "dd/MM/yyyy", { locale: ptBR })}`}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    render={<Link href={`/locacoes/${p.locacao.id}`} />}
                  >
                    <Eye className="size-4" />
                    Ver contrato
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </ClientesSection>
  );
}
