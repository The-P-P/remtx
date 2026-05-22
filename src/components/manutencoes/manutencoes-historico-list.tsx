import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pencil } from "lucide-react";
import { ManutencaoDeleteButton } from "@/components/manutencoes/manutencao-delete-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ALERTA_LABEL } from "@/lib/constants/enums";
import { ALERTA_CORES } from "@/lib/manutencao-alerts";
import { formatKm, formatCurrency } from "@/lib/utils";
import type { AlertaManutencao } from "@/types/prisma";
import type { getManutencoes } from "@/lib/actions/manutencoes";

type ManutencaoItem = Awaited<ReturnType<typeof getManutencoes>>[number];

export function ManutencoesHistoricoList({
  manutencoes,
}: {
  manutencoes: ManutencaoItem[];
}) {
  if (manutencoes.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhuma manutenção registrada.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {manutencoes.map((m) => {
        const estilo = ALERTA_CORES[m.alerta as AlertaManutencao];
        return (
          <li key={m.id} className="space-y-3 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">
                      {format(m.dataRealizada, "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                    <Link
                      href={`/veiculos/${m.veiculoId}`}
                      className="font-mono text-base font-bold hover:underline"
                    >
                      {m.veiculo.placa}
                    </Link>
                    <p className="truncate text-sm text-muted-foreground">
                      {m.veiculo.marca} {m.veiculo.modelo}
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      {m.tipoManutencao.nome}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      render={
                        <Link href={`/manutencoes/${m.id}/editar`} />
                      }
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <ManutencaoDeleteButton
                      id={m.id}
                      descricao={`${m.veiculo.placa} — ${m.tipoManutencao.nome} (${format(m.dataRealizada, "dd/MM/yyyy", { locale: ptBR })})`}
                    />
                  </div>
                </div>

                <Badge
                  className={`${estilo.bg} ${estilo.text} border ${estilo.border}`}
                >
                  {ALERTA_LABEL[m.alerta as AlertaManutencao]}
                </Badge>

                <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                  <div>
                    <dt className="text-xs text-muted-foreground">Km</dt>
                    <dd className="font-medium">{formatKm(m.kmRealizada)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Próxima</dt>
                    <dd className="font-medium">{formatKm(m.kmProxima)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Custo</dt>
                    <dd className="font-medium">
                      {m.custo ? formatCurrency(Number(m.custo)) : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Peças</dt>
                    <dd className="font-medium">{m.pecas.length}</dd>
                  </div>
                </dl>

                {m.pecas.length > 0 && (
                  <ul className="space-y-0.5 border-t pt-2 text-xs text-muted-foreground">
                    {m.pecas.map((p) => (
                      <li key={p.id}>
                        {p.quantidade}x {p.nome}
                      </li>
                    ))}
                  </ul>
                )}
          </li>
        );
      })}
    </ul>
  );
}
