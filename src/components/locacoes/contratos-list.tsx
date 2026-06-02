import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { labelDataFimPrevista } from "@/lib/format/locacao";
import { Eye, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LocacaoStatusBadge } from "@/components/locacoes/locacao-status-badge";
import { formatCurrency } from "@/lib/utils";
import { MODELO_CONTRATO_LABEL } from "@/lib/constants/enums";
import type { getContratosComDocumento } from "@/lib/actions/contratos";

type Item = Awaited<ReturnType<typeof getContratosComDocumento>>[number];

export function ContratosList({ locacoes }: { locacoes: Item[] }) {
  if (locacoes.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhum contrato encontrado.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {locacoes.map((l) => {
        const periodicidade =
          l.modeloContrato === "PLANO_CONQUISTA" ? "mês" : "semana";
        const plano = l.planoConquista;

        return (
          <Card key={l.id}>
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <LocacaoStatusBadge status={l.status} />
                  <Badge variant="outline">
                    {MODELO_CONTRATO_LABEL[l.modeloContrato]}
                  </Badge>
                  {l.contrato?.numero && (
                    <span className="font-mono text-xs text-muted-foreground">
                      {l.contrato.numero}
                    </span>
                  )}
                </div>
                <p className="text-sm leading-6">
                  <strong>{l.cliente.nome}</strong> · {l.veiculo.placa} —{" "}
                  {l.veiculo.marca} {l.veiculo.modelo}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(l.dataInicio, "dd/MM/yyyy", { locale: ptBR })} →{" "}
                  {labelDataFimPrevista(l.dataFimPrevista)} ·{" "}
                  {formatCurrency(Number(l.valorDiaria))}/{periodicidade}
                </p>
                {plano && (
                  <p className="text-xs text-violet-700 dark:text-violet-300">
                    Plano Conquista: {plano.mesesPagos}/{plano.totalMeses}{" "}
                    mensalidades
                    {plano.adesaoPaga ? " · adesão paga" : " · adesão pendente"}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {l.contrato && (
                  <Button
                    variant="outline"
                    size="sm"
                    render={
                      <Link
                        href={`/api/locacoes/${l.id}/contrato`}
                        target="_blank"
                      />
                    }
                  >
                    <FileDown className="size-4" />
                    PDF
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href={`/locacoes/${l.id}`} />}
                >
                  <Eye className="size-4" />
                  Abrir
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
