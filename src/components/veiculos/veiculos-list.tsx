import Link from "next/link";
import { Eye, Pencil } from "lucide-react";
import { VeiculoDeleteButton } from "@/components/veiculos/veiculo-delete-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusVeiculoBadge } from "@/components/veiculos/status-badge";
import { AlertaKmBadge } from "@/components/veiculos/alerta-km-badge";
import { formatKm, formatCurrency } from "@/lib/utils";
import { VeiculoSilhouette } from "@/components/veiculos/veiculo-silhouette";
import { corParaHex } from "@/lib/porte-veiculo";
import { resolverPorte } from "@/lib/veiculo-visual";
import { Badge } from "@/components/ui/badge";
import type { getVeiculos } from "@/lib/actions/veiculos";

type VeiculoItem = Awaited<ReturnType<typeof getVeiculos>>[number];

export function VeiculosList({ veiculos }: { veiculos: VeiculoItem[] }) {
  if (veiculos.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhum veículo encontrado.
      </p>
    );
  }

  return (
    <div className="grid min-w-0 max-w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {veiculos.map((v) => {
        const corHex = corParaHex(v.cor);
        const porte = resolverPorte(v.porte, v.modelo);

        return (
          <Card
            key={v.id}
            className={`min-w-0 max-w-full overflow-hidden py-0 gap-0 ${v.status === "INATIVO" ? "opacity-65" : ""}`}
          >
            <VeiculoSilhouette
              porte={porte}
              cor={corHex}
              corLabel={v.cor}
              compact
            />
          <CardContent className="min-w-0 space-y-3 p-3 pt-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-base font-bold tracking-wide sm:text-lg">
                  {v.placa}
                </p>
                {v.apelido && (
                  <p className="truncate text-sm font-medium text-primary">
                    {v.apelido}
                  </p>
                )}
                <p className="text-sm text-muted-foreground break-words">
                  {v.marca} {v.modelo} ({v.ano})
                </p>
              </div>
              <div className="flex shrink-0 gap-1 self-end sm:self-start">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  render={<Link href={`/veiculos/${v.id}`} />}
                >
                  <Eye className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  render={<Link href={`/veiculos/${v.id}/editar`} />}
                >
                  <Pencil className="size-4" />
                </Button>
                <VeiculoDeleteButton
                  id={v.id}
                  descricao={`${v.placa} — ${v.marca} ${v.modelo}`}
                  modoExclusao={
                    v._count.locacoes === 0 ? "permanente" : "inativar"
                  }
                  bloqueado={v.locacoes.length > 0}
                  motivoBloqueio={
                    v.locacoes.length > 0
                      ? "Veículo com locação ativa ou reservada"
                      : undefined
                  }
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusVeiculoBadge status={v.status} />
              <AlertaKmBadge
                kmAtual={v.kmAtual}
                kmProximaRevisao={v.kmProximaRevisao}
              />
              {v.financiamento?.ativo && (
                <Badge variant="outline" className="max-w-full text-xs whitespace-normal">
                  <span className="sm:hidden">
                    Financiado · {v.financiamento.parcelas.length} parc.
                  </span>
                  <span className="hidden sm:inline">
                    Financiado · {v.financiamento.parcelas.length} parcela(s) restante(s)
                  </span>
                </Badge>
              )}
            </div>

            <dl className="grid grid-cols-2 gap-2 text-sm rounded-xl border border-border/60 bg-muted/25 p-2.5">
              <div>
                <dt className="text-xs text-muted-foreground">Km atual</dt>
                <dd className="font-medium">{formatKm(v.kmAtual)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Revisão</dt>
                <dd className="font-medium">{formatKm(v.kmProximaRevisao)}</dd>
              </div>
              {v.financiamento?.ativo && (
                <div className="col-span-2">
                  <dt className="text-xs text-muted-foreground">Saldo financiamento</dt>
                  <dd className="font-medium tabular-nums text-red-700 dark:text-red-500">
                    {formatCurrency(Number(v.financiamento.saldoDevedor))}
                  </dd>
                </div>
              )}
            </dl>

              <div className="flex flex-wrap gap-3 border-t border-border/60 pt-2 text-xs">
                {v._count.problemasCronicos > 0 && (
                  <span className="font-medium text-red-600 dark:text-red-300">
                    {v._count.problemasCronicos} problema(s)
                  </span>
                )}
                <Link
                  href={`/manutencoes?veiculoId=${v.id}`}
                  className="font-medium text-primary underline-offset-2 hover:underline"
                >
                  Manutenções
                </Link>
                {v.locacoes[0] && (
                  <Link
                    href={`/locacoes/${v.locacoes[0].id}`}
                    className="font-medium text-primary underline-offset-2 hover:underline"
                  >
                    Locação
                  </Link>
                )}
                {v.status === "DISPONIVEL" && (
                  <Link
                    href={`/clientes/locacoes/nova?veiculoId=${v.id}`}
                    className="font-medium text-primary underline-offset-2 hover:underline"
                  >
                    Alugar
                  </Link>
                )}
              </div>
          </CardContent>
        </Card>
        );
      })}
    </div>
  );
}
