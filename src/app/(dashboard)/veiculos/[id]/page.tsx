import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Wrench, Pencil } from "lucide-react";
import {
  getVeiculoById,
  toggleProblemaCronico,
} from "@/lib/actions/veiculos";
import { submitProblemaCronico } from "@/lib/actions/form-actions";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusVeiculoBadge } from "@/components/veiculos/status-badge";
import { AlertaKmBadge } from "@/components/veiculos/alerta-km-badge";
import { ProblemaCronicoForm } from "@/components/veiculos/problema-cronico-form";
import { VeiculoManutencoesList } from "@/components/veiculos/veiculo-manutencoes-list";
import { VeiculoDeleteButtonServer } from "@/components/veiculos/veiculo-delete-button-lazy";
import { PageActions } from "@/components/shared/page-actions";
import { GRAVIDADE_LABEL, GRAVIDADE_STYLE } from "@/lib/constants/enums";
import { formatKm } from "@/lib/utils";

export default async function VeiculoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const veiculo = await getVeiculoById(id);
  if (!veiculo) notFound();

  const ultimaManutencao = veiculo.manutencoes[0] ?? null;
  const kmRestante = veiculo.kmProximaRevisao - veiculo.kmAtual;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${veiculo.placa} — ${veiculo.marca} ${veiculo.modelo}`}
        description={`Ano ${veiculo.ano}${veiculo.cor ? ` · ${veiculo.cor}` : ""}`}
        backHref="/veiculos"
        action={
          <PageActions>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              render={<Link href={`/veiculos/${id}/editar`} />}
            >
              <Pencil className="size-4" />
              Editar
            </Button>
            <Button
              className="w-full sm:w-auto"
              render={<Link href={`/manutencoes/nova?veiculoId=${id}`} />}
            >
              <Wrench className="size-4" />
              <span className="sm:hidden">Manutenção</span>
              <span className="hidden sm:inline">Registrar manutenção</span>
            </Button>
            <VeiculoDeleteButtonServer id={id} variant="button" />
          </PageActions>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Status</p>
            <div className="mt-2">
              <StatusVeiculoBadge status={veiculo.status} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Km atual</p>
            <p className="mt-2 text-xl font-bold">{formatKm(veiculo.kmAtual)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Próxima revisão</p>
            <p className="mt-2 text-xl font-bold">
              {formatKm(veiculo.kmProximaRevisao)}
            </p>
            {ultimaManutencao && (
              <p className="mt-1 text-xs text-muted-foreground">
                {ultimaManutencao.tipoManutencao.nome}
                {kmRestante >= 0
                  ? ` · faltam ${formatKm(kmRestante)}`
                  : ` · ${formatKm(Math.abs(kmRestante))} km em atraso`}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Alerta manutenção</p>
            <div className="mt-2">
              <AlertaKmBadge
                kmAtual={veiculo.kmAtual}
                kmProximaRevisao={veiculo.kmProximaRevisao}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {veiculo.observacoes && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{veiculo.observacoes}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Problemas crônicos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProblemaCronicoForm veiculoId={id} action={submitProblemaCronico} />
            {veiculo.problemasCronicos.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum problema registrado.
              </p>
            ) : (
              <ul className="space-y-2">
                {veiculo.problemasCronicos.map((p) => (
                  <li
                    key={p.id}
                    className={`rounded-lg border p-3 ${p.ativo ? "border-red-200/60 bg-red-50/50 dark:border-red-500/40 dark:bg-red-500/10" : "opacity-60"}`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <Badge className={GRAVIDADE_STYLE[p.gravidade]}>
                          {GRAVIDADE_LABEL[p.gravidade]}
                        </Badge>
                        <p className="mt-2 text-sm text-foreground dark:text-red-500/90">
                          {p.descricao}
                        </p>
                        <p className="text-xs text-muted-foreground dark:text-red-500/70">
                          {format(p.dataRegistro, "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      <form className="shrink-0"
                        action={async () => {
                          "use server";
                          await toggleProblemaCronico(p.id, id, !p.ativo);
                        }}
                      >
                        <Button type="submit" variant="outline" size="sm">
                          {p.ativo ? "Resolver" : "Reativar"}
                        </Button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle>
              Manutenções ({veiculo._count.manutencoes})
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              render={<Link href={`/manutencoes?veiculoId=${id}`} />}
            >
              Ver histórico
            </Button>
          </CardHeader>
          <CardContent>
            <VeiculoManutencoesList
              manutencoes={veiculo.manutencoes}
              veiculoId={id}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
