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
import { formatCurrency, formatKm, parseDateInput } from "@/lib/utils";
import { labelDataFimPrevista } from "@/lib/format/locacao";
import { formatTelefoneDisplay } from "@/lib/format/br";
import { nomeDiaSemana } from "@/lib/parcelas-semanais";
import { resumoCaucaoLocacao } from "@/lib/caucao-locacao";
import { ContratoDocumentoCard } from "@/components/locacoes/contrato-documento-card";
import { PlanoConquistaCard } from "@/components/locacoes/plano-conquista-card";
import { MODELO_CONTRATO_LABEL } from "@/lib/constants/enums";

export default async function LocacaoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locacao = await getLocacaoById(id);
  if (!locacao) notFound();

  const podeEditar = ["RESERVADA", "ATIVA"].includes(locacao.status);
  const dataInicio = parseDateInput(locacao.dataInicio);
  const caucao = resumoCaucaoLocacao(locacao);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${locacao.veiculo.placa} — ${locacao.cliente.nome}`}
        description="Contrato de locação"
        backHref="/clientes/contratos"
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
              {format(dataInicio, "dd/MM/yyyy", { locale: ptBR })} →{" "}
              {labelDataFimPrevista(locacao.dataFimPrevista)}
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
              {formatCurrency(Number(locacao.valorDiaria))}/
              {locacao.periodicidadePagamento === "MENSAL" ? "mês" : "semana"}
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
        <ContratoDocumentoCard
          locacaoId={id}
          numero={locacao.contrato?.numero ?? locacao.numeroContrato}
          modelo={locacao.modeloContrato}
          geradoEm={locacao.contrato?.geradoEm}
        />
        {locacao.planoConquista && (
          <PlanoConquistaCard plano={locacao.planoConquista} />
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Modelo: <strong>{MODELO_CONTRATO_LABEL[locacao.modeloContrato]}</strong>
        {locacao.numeroContrato && (
          <> · Nº {locacao.numeroContrato}</>
        )}
      </p>

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
            <p>{formatTelefoneDisplay(locacao.cliente.telefone)}</p>
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

      {caucao.valorCaucao > 0 && ["RESERVADA", "ATIVA"].includes(locacao.status) && (
        <Card className="border-sky-500/30 bg-sky-500/5">
          <CardHeader>
            <CardTitle className="text-base">Caução na retirada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              Na retirada o cliente paga{" "}
              <strong>{formatCurrency(caucao.totalRetirada)}</strong>:{" "}
              {formatCurrency(caucao.valorSemanal)} (1ª semana) +{" "}
              {formatCurrency(caucao.valorCaucao)} (caução, reembolsável na
              devolução).
            </p>
            <p className="text-muted-foreground">
              Status da caução:{" "}
              {caucao.paga ? (
                <span className="text-emerald-600 dark:text-emerald-400">
                  Recebida
                  {caucao.dataPagamento &&
                    ` em ${format(caucao.dataPagamento, "dd/MM/yyyy", { locale: ptBR })}`}
                </span>
              ) : (
                <span className="text-amber-700 dark:text-amber-300">
                  Pendente
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      )}

      {["RESERVADA", "ATIVA"].includes(locacao.status) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {locacao.periodicidadePagamento === "MENSAL"
                ? "Pagamentos mensais"
                : "Pagamentos semanais"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {locacao.status === "RESERVADA" ? (
              <p className="text-sm text-muted-foreground">
                Ao confirmar a retirada, serão gerados pagamentos toda{" "}
                <strong>{nomeDiaSemana(dataInicio)}</strong> até a data
                de devolução prevista.
                {caucao.valorCaucao > 0 && (
                  <>
                    {" "}
                    A caução de {formatCurrency(caucao.valorCaucao)} entra no
                    recebimento do dia da retirada junto com a 1ª semana.
                  </>
                )}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Vencimento toda <strong>{nomeDiaSemana(dataInicio)}</strong>{" "}
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
