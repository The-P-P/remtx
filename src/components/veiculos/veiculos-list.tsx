import Link from "next/link";
import { Eye, Pencil } from "lucide-react";
import { VeiculoDeleteButton } from "@/components/veiculos/veiculo-delete-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusVeiculoBadge } from "@/components/veiculos/status-badge";
import { AlertaKmBadge } from "@/components/veiculos/alerta-km-badge";
import { formatKm } from "@/lib/utils";
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {veiculos.map((v) => (
        <Card
          key={v.id}
          className={v.status === "INATIVO" ? "opacity-60" : undefined}
        >
          <CardContent className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-mono text-lg font-bold">{v.placa}</p>
                <p className="text-sm text-muted-foreground">
                  {v.marca} {v.modelo} ({v.ano})
                </p>
              </div>
              <div className="flex shrink-0 gap-0.5">
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
            </div>

            <dl className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Km atual</dt>
                <dd className="font-medium">{formatKm(v.kmAtual)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Revisão</dt>
                <dd className="font-medium">{formatKm(v.kmProximaRevisao)}</dd>
              </div>
            </dl>

              <div className="flex flex-wrap gap-2 text-xs">
                {v._count.problemasCronicos > 0 && (
                  <span className="text-red-600 dark:text-red-300">
                    {v._count.problemasCronicos} problema(s)
                  </span>
                )}
                <Link
                  href={`/manutencoes?veiculoId=${v.id}`}
                  className="text-primary hover:underline"
                >
                  Manutenções
                </Link>
                {v.locacoes[0] && (
                  <Link
                    href={`/locacoes/${v.locacoes[0].id}`}
                    className="text-primary hover:underline"
                  >
                    Locação
                  </Link>
                )}
                {v.status === "DISPONIVEL" && (
                  <Link
                    href={`/clientes/locacoes/nova?veiculoId=${v.id}`}
                    className="text-primary hover:underline"
                  >
                    Alugar
                  </Link>
                )}
              </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
