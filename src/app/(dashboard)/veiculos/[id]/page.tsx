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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusVeiculoBadge } from "@/components/veiculos/status-badge";
import { AlertaKmBadge } from "@/components/veiculos/alerta-km-badge";
import { ProblemaCronicoForm } from "@/components/veiculos/problema-cronico-form";
import { VeiculoDeleteButtonServer } from "@/components/veiculos/veiculo-delete-button-lazy";
import { GRAVIDADE_LABEL, GRAVIDADE_STYLE } from "@/lib/constants/enums";
import { ALERTA_CORES } from "@/lib/manutencao-alerts";
import { formatKm, formatCurrency } from "@/lib/utils";

export default async function VeiculoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const veiculo = await getVeiculoById(id);
  if (!veiculo) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${veiculo.placa} — ${veiculo.marca} ${veiculo.modelo}`}
        description={`Ano ${veiculo.ano}${veiculo.cor ? ` · ${veiculo.cor}` : ""}`}
        backHref="/veiculos"
        action={
          <div className="flex gap-2">
            <Button variant="outline" render={<Link href={`/veiculos/${id}/editar`} />}>
              <Pencil className="size-4" />
              Editar
            </Button>
            <Button render={<Link href={`/manutencoes/nova?veiculoId=${id}`} />}>
              <Wrench className="size-4" />
              Registrar manutenção
            </Button>
            <VeiculoDeleteButtonServer id={id} variant="button" />
          </div>
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
                    className={`rounded-lg border p-3 ${p.ativo ? "border-red-100 bg-red-50/50" : "opacity-60"}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge className={GRAVIDADE_STYLE[p.gravidade]}>
                          {GRAVIDADE_LABEL[p.gravidade]}
                        </Badge>
                        <p className="mt-2 text-sm">{p.descricao}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(p.dataRegistro, "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      <form
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
          <CardHeader>
            <CardTitle>Últimas manutenções</CardTitle>
          </CardHeader>
          <CardContent>
            {veiculo.manutencoes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma manutenção registrada.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Km</TableHead>
                    <TableHead>Peças</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {veiculo.manutencoes.map((m) => {
                    const estilo = ALERTA_CORES[m.alerta];
                    return (
                      <TableRow key={m.id}>
                        <TableCell>
                          {format(m.dataRealizada, "dd/MM/yy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>{m.tipoManutencao.nome}</TableCell>
                        <TableCell>{formatKm(m.kmRealizada)}</TableCell>
                        <TableCell>
                          <span className="text-xs">
                            {m.pecas.length} peça(s)
                            {m.custo ? ` · ${formatCurrency(Number(m.custo))}` : ""}
                          </span>
                          <Badge
                            className={`ml-1 ${estilo.bg} ${estilo.text} text-[10px]`}
                          >
                            {estilo.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
