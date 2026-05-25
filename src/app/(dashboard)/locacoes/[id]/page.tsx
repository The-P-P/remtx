import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pencil } from "lucide-react";
import { getLocacaoById } from "@/lib/actions/locacoes";
import { PageHeader } from "@/components/shared/page-header";
import { PageActions } from "@/components/shared/page-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocacaoStatusBadge } from "@/components/locacoes/locacao-status-badge";
import {
  LocacaoAcoes,
  ParcelaPagarButton,
} from "@/components/locacoes/locacao-acoes";
import { formatCurrency, formatKm } from "@/lib/utils";
import { nomeDiaSemana } from "@/lib/parcelas-semanais";

export default async function LocacaoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locacao = await getLocacaoById(id);
  if (!locacao) notFound();

  const podeEditar = ["RESERVADA", "ATIVA"].includes(locacao.status);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${locacao.veiculo.placa} — ${locacao.cliente.nome}`}
        description="Contrato de locação"
        backHref="/locacoes/contratos"
        action={
          podeEditar ? (
            <PageActions>
              <Button
                variant="outline"
                render={<Link href={`/locacoes/${id}/editar`} />}
              >
                <Pencil className="size-4" />
                Editar
              </Button>
            </PageActions>
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Status</p>
            <div className="mt-2">
              <LocacaoStatusBadge status={locacao.status} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Período</p>
            <p className="mt-2 text-sm font-medium">
              {format(locacao.dataInicio, "dd/MM/yyyy", { locale: ptBR })} →{" "}
              {format(locacao.dataFimPrevista, "dd/MM/yyyy", { locale: ptBR })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Km</p>
            <p className="mt-2 text-sm font-medium">
              {formatKm(locacao.kmInicio)}
              {locacao.kmFim != null ? ` → ${formatKm(locacao.kmFim)}` : ""}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Valor</p>
            <p className="mt-2 text-sm font-medium">
              {formatCurrency(Number(locacao.valorDiaria))}/semana
              {locacao.valorTotal != null && (
                <span className="block text-muted-foreground">
                  Total: {formatCurrency(Number(locacao.valorTotal))}
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              <Link href={`/clientes/${locacao.clienteId}`} className="font-medium underline">
                {locacao.cliente.nome}
              </Link>
            </p>
            <p>{locacao.cliente.telefone}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Veículo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              <Link href={`/veiculos/${locacao.veiculoId}`} className="font-medium underline">
                {locacao.veiculo.placa} — {locacao.veiculo.marca}{" "}
                {locacao.veiculo.modelo}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      {locacao.observacoes && (
        <Card>
          <CardContent className="pt-6 text-sm">{locacao.observacoes}</CardContent>
        </Card>
      )}

      <LocacaoAcoes
        locacaoId={id}
        status={locacao.status}
        kmInicio={locacao.kmInicio}
        kmAtualVeiculo={locacao.veiculo.kmAtual}
      />

      {["RESERVADA", "ATIVA"].includes(locacao.status) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pagamentos semanais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {locacao.status === "RESERVADA" ? (
              <p className="text-sm text-muted-foreground">
                Ao confirmar a retirada, serão gerados pagamentos toda{" "}
                <strong>{nomeDiaSemana(locacao.dataInicio)}</strong> até a data
                de devolução prevista.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Vencimento toda <strong>{nomeDiaSemana(locacao.dataInicio)}</strong>{" "}
                — {formatCurrency(Number(locacao.valorDiaria))}/semana. Confirme
                pagamentos e juros na{" "}
                <Link href="/locacoes" className="underline">
                  Agenda
                </Link>
                .
              </p>
            )}
            {locacao.parcelas.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {locacao.status === "ATIVA"
                  ? "Nenhum vencimento gerado. Edite a locação ou confirme datas para recalcular."
                  : null}
              </p>
            ) : (
              <ul className="divide-y rounded-lg border">
                {locacao.parcelas.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">
                        {formatCurrency(Number(p.valor))} —{" "}
                        {format(p.dataVencimento, "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                      {p.dataPagamento && (
                        <p className="text-xs text-emerald-600">
                          Pago em{" "}
                          {format(p.dataPagamento, "dd/MM/yyyy", { locale: ptBR })}
                          {p.pagamentoAjustado ? " (ajuste)" : ""}
                        </p>
                      )}
                      {!p.dataPagamento && Number(p.valorJuros) > 0 && (
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          Juros: {formatCurrency(Number(p.valorJuros))}
                        </p>
                      )}
                    </div>
                    {!p.dataPagamento && <ParcelaPagarButton parcelaId={p.id} />}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
