"use client";

import { useState, useTransition, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Check,
  CalendarClock,
  RotateCcw,
  Settings2,
  Banknote,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TIPO_EVENTO_AGENDA_STYLE } from "@/lib/constants/enums";
import { formatCurrency } from "@/lib/utils";
import {
  concluirTarefaAgenda,
  desfazerTarefaAgenda,
  reagendarTarefaAgenda,
  confirmarPagamentoParcela,
  confirmarCaucaoLocacao,
  confirmarRecebimentoRetirada,
  ajustarPagamentoParcela,
  type ConfirmacaoPagamentoInput,
} from "@/lib/actions/agenda-tarefas";
import { confirmarPagamentoParcelaFinanciamento } from "@/lib/actions/financiamento-veiculo";
import {
  AgendaNovaTarefaForm,
  type EventoAgendaEdit,
} from "@/components/locacoes/agenda-nova-tarefa-form";
import { submitNovoEventoAgenda } from "@/lib/actions/form-actions";
import { deleteEventoAgenda } from "@/lib/actions/eventos-agenda";
import { ReagendarPagamentoForm } from "@/components/locacoes/reagendar-pagamento-form";
import type { TipoEventoAgenda } from "@/types/prisma";

type VeiculoOption = { id: string; placa: string; marca: string; modelo: string };
type ClienteOption = { id: string; nome: string };

export type TarefaAgendaSerializada = {
  id: string;
  chave: string;
  referenciaTipo:
    | "parcela"
    | "evento"
    | "agenda"
    | "financiamento"
    | "transacao"
    | "manutencao"
    | "locacao";
  referenciaId: string;
  titulo: string;
  descricao?: string | null;
  dataInicio: string;
  dataFim?: string | null;
  tipo: TipoEventoAgenda;
  href?: string;
  meta?: {
    valor?: number;
    valorBase?: number;
    valorJuros?: number;
    valorMulta?: number;
    valorJurosDiarios?: number;
    modeloEncargos?: "PADRAO" | "PLANO_CONQUISTA";
    encargosContrato?: string;
    diasAtraso?: number;
    atrasado?: boolean;
    concluido?: boolean;
    pagamentoAjustado?: boolean;
    dataVencimentoContrato?: string;
    diaSemanaContrato?: string;
    pagamentoReagendado?: boolean;
    dataPagamento?: string;
    veiculoId?: string;
    clienteId?: string;
    parcelaNumero?: number;
    totalParcelas?: number;
    locacaoId?: string;
    clienteNome?: string;
    valorCaucao?: number;
    totalRetirada?: number;
  };
};

type DialogMode =
  | "reagendar"
  | "ajustar"
  | "confirmar"
  | "recebimento-retirada"
  | "nova-tarefa"
  | "editar-tarefa"
  | null;

export function AgendaTarefasDia({
  tarefas,
  diaLabel,
  dataPadrao,
  ano,
  mes,
  dia,
  veiculos,
  clientes,
  abrirNovaTarefa,
}: {
  tarefas: TarefaAgendaSerializada[];
  diaLabel: string;
  dataPadrao: string;
  ano: number;
  mes: number;
  dia: number;
  veiculos: VeiculoOption[];
  clientes: ClienteOption[];
  abrirNovaTarefa?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogMode>(null);
  const [tarefaAtiva, setTarefaAtiva] = useState<TarefaAgendaSerializada | null>(
    null
  );
  const abriuNovaTarefa = useRef(false);

  useEffect(() => {
    if (abrirNovaTarefa && !abriuNovaTarefa.current) {
      abriuNovaTarefa.current = true;
      setDialog("nova-tarefa");
      setErro(null);
    }
  }, [abrirNovaTarefa]);

  function run(
    fn: () => Promise<{ success: boolean; error?: string }>,
    close = true
  ) {
    setErro(null);
    startTransition(async () => {
      const r = await fn();
      if (!r.success) {
        setErro("error" in r && r.error ? r.error : "Erro");
        return;
      }
      if (close) setDialog(null);
      router.refresh();
    });
  }

  function abrirDialog(mode: DialogMode, t: TarefaAgendaSerializada) {
    setTarefaAtiva(t);
    setDialog(mode);
    setErro(null);
  }

  function buildConfirmacaoInput(
    form: HTMLFormElement
  ): ConfirmacaoPagamentoInput {
    const cb = form.elements.namedItem(
      "registrarFinanceiro"
    ) as HTMLInputElement | null;
    const forma = form.elements.namedItem(
      "formaPagamento"
    ) as HTMLSelectElement | null;
    return {
      registrarFinanceiro: cb?.checked !== false,
      formaPagamento: forma?.value || null,
      dataRecebimento: dataPadrao,
    };
  }

  const isPagamentoCliente = (tipo: TipoEventoAgenda) =>
    tipo === "PAGAMENTO_CLIENTE";
  const isCaucaoLocacao = (tipo: TipoEventoAgenda) => tipo === "CAUCAO_LOCACAO";
  const isPagamentoFinanciamento = (tipo: TipoEventoAgenda) =>
    tipo === "FINANCIAMENTO_VEICULO";
  const isPagamentoTipo = (tipo: TipoEventoAgenda) =>
    isPagamentoCliente(tipo) ||
    isCaucaoLocacao(tipo) ||
    isPagamentoFinanciamento(tipo);

  const retiradasPendentes = useMemo(() => {
    const map = new Map<
      string,
      { caucao?: TarefaAgendaSerializada; parcela?: TarefaAgendaSerializada }
    >();

    for (const t of tarefas) {
      const locId =
        t.meta?.locacaoId ??
        (t.chave.startsWith("caucao-") ? t.referenciaId : undefined);
      if (!locId) continue;

      const entry = map.get(locId) ?? {};
      if (isCaucaoLocacao(t.tipo) && !t.meta?.concluido) {
        entry.caucao = t;
      }
      if (isPagamentoCliente(t.tipo) && !t.meta?.concluido && !entry.parcela) {
        entry.parcela = t;
      }
      map.set(locId, entry);
    }

    return [...map.entries()]
      .filter(([, v]) => v.caucao && v.parcela)
      .map(([locacaoId, v]) => ({
        locacaoId,
        caucao: v.caucao,
        parcela: v.parcela,
        total:
          (v.caucao?.meta?.valor ?? 0) + (v.parcela?.meta?.valor ?? 0),
        label:
          v.caucao?.meta?.clienteNome ??
          v.parcela?.meta?.clienteNome ??
          "Cliente",
      }));
  }, [tarefas]);
  const isEventoManual = (t: TarefaAgendaSerializada) =>
    t.referenciaTipo === "evento";

  const isTarefaManual = (t: TarefaAgendaSerializada) =>
    t.referenciaTipo !== "transacao" &&
    t.referenciaTipo !== "manutencao" &&
    (isEventoManual(t) ||
    [
      "ENTREGA_VEICULO",
      "RETIRADA_VEICULO",
      "OFICINA_SERVICO",
      "MANUTENCAO_AGENDADA",
      "LEMBRETE",
      "IPVA",
      "FINANCEIRO",
    ].includes(t.tipo));

  function eventoEditFromTarefa(t: TarefaAgendaSerializada): EventoAgendaEdit {
    return {
      id: t.referenciaId,
      tipo: t.tipo,
      titulo: t.titulo,
      descricao: t.descricao,
      dataInicio: format(new Date(t.dataInicio), "yyyy-MM-dd"),
      dataFim: t.dataFim,
      veiculoId: t.meta?.veiculoId,
      clienteId: t.meta?.clienteId,
      valor: t.meta?.valor,
    };
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{diaLabel}</p>
        <Button
          size="sm"
          onClick={() => {
            setDialog("nova-tarefa");
            setErro(null);
          }}
        >
          <Plus className="size-4" />
          Adicionar tarefa
        </Button>
      </div>
      {erro && !dialog && (
        <p className="text-sm text-red-600 dark:text-red-400">{erro}</p>
      )}

      {retiradasPendentes.length > 0 && (
        <div className="space-y-2 rounded-lg border border-sky-500/40 bg-sky-500/10 p-3">
          <p className="text-sm font-medium text-sky-900 dark:text-sky-200">
            Recebimento na retirada (1ª semana + caução)
          </p>
          {retiradasPendentes.map((r) => (
            <div
              key={r.locacaoId}
              className="flex flex-wrap items-center justify-between gap-2"
            >
              <p className="text-sm text-muted-foreground">
                {r.label} — {formatCurrency(r.total)}
              </p>
              <Button
                size="sm"
                disabled={pending}
                onClick={() => {
                  setTarefaAtiva({
                    id: `retirada-${r.locacaoId}`,
                    chave: `caucao-${r.locacaoId}`,
                    referenciaTipo: "locacao",
                    referenciaId: r.locacaoId,
                    titulo: r.label,
                    dataInicio: dataPadrao,
                    tipo: "CAUCAO_LOCACAO",
                    meta: { valor: r.total, locacaoId: r.locacaoId },
                  });
                  setDialog("recebimento-retirada");
                  setErro(null);
                }}
              >
                <Banknote className="size-3.5" />
                Receber tudo
              </Button>
            </div>
          ))}
        </div>
      )}

      {tarefas.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Nenhuma tarefa neste dia. Use &quot;Adicionar tarefa&quot; para entrega,
          retirada, oficina, etc.
        </p>
      )}

      {tarefas.map((t) => {
        const concluido = t.meta?.concluido;
        const isPagamento = isPagamentoTipo(t.tipo);
        const tarefaCheck =
          isTarefaManual(t) ||
          t.chave.startsWith("loc-") ||
          t.chave.startsWith("ipva-") ||
          t.chave.startsWith("manutencao-");

        return (
          <div
            key={t.id}
            className={`rounded-lg border p-3 space-y-3 ${TIPO_EVENTO_AGENDA_STYLE[t.tipo]} ${
              concluido ? "opacity-70" : ""
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                {t.href ? (
                  <Link href={t.href} className="font-medium hover:underline">
                    {t.titulo}
                  </Link>
                ) : (
                  <p className="font-medium">{t.titulo}</p>
                )}
                {t.descricao && (
                  <p className="text-sm opacity-80">{t.descricao}</p>
                )}
                {isPagamento && t.meta?.valor != null && (
                  <div className="mt-1 text-sm">
                    <p className="font-semibold">
                      {formatCurrency(t.meta.valor)}
                      {isPagamentoCliente(t.tipo) &&
                        t.meta.valorJuros != null &&
                        t.meta.valorJuros > 0 && (
                          <span className="ml-1 font-normal text-amber-700 dark:text-amber-300">
                            (base {formatCurrency(t.meta.valorBase ?? 0)}
                            {t.meta.valorMulta != null && t.meta.valorMulta > 0
                              ? ` + multa ${formatCurrency(t.meta.valorMulta)}`
                              : ""}
                            {t.meta.valorJurosDiarios != null &&
                            t.meta.valorJurosDiarios > 0
                              ? ` + juros ${formatCurrency(t.meta.valorJurosDiarios)}`
                              : ` + encargos ${formatCurrency(t.meta.valorJuros)}`}
                            )
                          </span>
                        )}
                    </p>
                    {isPagamentoFinanciamento(t.tipo) &&
                      t.meta.parcelaNumero != null &&
                      t.meta.totalParcelas != null && (
                        <p className="text-xs text-muted-foreground">
                          Parcela {t.meta.parcelaNumero} de {t.meta.totalParcelas}
                        </p>
                      )}
                    {t.meta.atrasado && isPagamentoCliente(t.tipo) && (
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        {t.meta.diasAtraso} dia(s) de atraso —{" "}
                        {t.meta.encargosContrato ??
                          "multa de mora + 1% ao dia"}
                      </p>
                    )}
                    {t.meta.atrasado && isPagamentoFinanciamento(t.tipo) && (
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        Parcela em atraso
                      </p>
                    )}
                    {t.meta.pagamentoAjustado && (
                      <p className="text-xs text-muted-foreground">
                        Pagamento registrado com ajuste manual
                      </p>
                    )}
                    {concluido && t.meta.dataPagamento && (
                      <p className="text-xs text-emerald-700 dark:text-emerald-400">
                        Pago em{" "}
                        {format(new Date(t.meta.dataPagamento), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </p>
                    )}
                  </div>
                )}
                {t.referenciaTipo === "transacao" && t.meta?.valor != null && (
                  <p className="mt-1 text-sm font-semibold">
                    {formatCurrency(t.meta.valor)}
                  </p>
                )}
                {t.referenciaTipo === "manutencao" && t.meta?.valor != null && (
                  <p className="mt-1 text-sm font-semibold">
                    {formatCurrency(t.meta.valor)}
                  </p>
                )}
              </div>
              <Badge variant="outline" className="shrink-0">
                {t.referenciaTipo === "transacao"
                  ? "Lançado"
                  : concluido
                    ? "Feito"
                    : t.meta?.atrasado
                      ? "Atrasado"
                      : "Pendente"}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              {isPagamento && !concluido && (
                <>
                  <Button
                    size="sm"
                    disabled={pending}
                    onClick={() => abrirDialog("confirmar", t)}
                  >
                    <Banknote className="size-3.5" />
                    Confirmar pagamento
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => abrirDialog("reagendar", t)}
                  >
                    <CalendarClock className="size-3.5" />
                    Reagendar
                  </Button>
                  {isPagamentoCliente(t.tipo) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={pending}
                      onClick={() => abrirDialog("ajustar", t)}
                    >
                      <Settings2 className="size-3.5" />
                      Ajustar check
                    </Button>
                  )}
                </>
              )}

              {isPagamento && concluido && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() =>
                    run(() =>
                      desfazerTarefaAgenda(t.chave, t.referenciaId)
                    )
                  }
                >
                  <RotateCcw className="size-3.5" />
                  Desfazer pagamento
                </Button>
              )}

              {tarefaCheck && !isPagamento && !concluido && (
                <>
                  <Button
                    size="sm"
                    disabled={pending}
                    onClick={() =>
                      run(() =>
                        concluirTarefaAgenda(
                          t.chave,
                          t.tipo,
                          t.referenciaId
                        )
                      )
                    }
                  >
                    <Check className="size-3.5" />
                    Marcar feito
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => abrirDialog("reagendar", t)}
                  >
                    <CalendarClock className="size-3.5" />
                    Reagendar
                  </Button>
                </>
              )}

              {tarefaCheck && !isPagamento && concluido && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() =>
                    run(() =>
                      desfazerTarefaAgenda(t.chave, t.referenciaId)
                    )
                  }
                >
                  <RotateCcw className="size-3.5" />
                  Desfazer
                </Button>
              )}

              {isEventoManual(t) && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => {
                      setTarefaAtiva(t);
                      setDialog("editar-tarefa");
                      setErro(null);
                    }}
                  >
                    <Pencil className="size-3.5" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={pending}
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      if (
                        !confirm(
                          "Excluir esta tarefa da agenda? Esta ação não pode ser desfeita."
                        )
                      ) {
                        return;
                      }
                      run(() => deleteEventoAgenda(t.referenciaId));
                    }}
                  >
                    <Trash2 className="size-3.5" />
                    Excluir
                  </Button>
                </>
              )}
            </div>
          </div>
        );
      })}

      <Dialog open={dialog !== null} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialog === "confirmar" &&
                (tarefaAtiva && isCaucaoLocacao(tarefaAtiva.tipo)
                  ? "Confirmar caução"
                  : "Confirmar pagamento")}
              {dialog === "recebimento-retirada" && "Receber na retirada"}
              {dialog === "reagendar" && "Reagendar tarefa"}
              {dialog === "ajustar" && "Ajustar pagamento (check esquecido)"}
              {dialog === "nova-tarefa" && "Nova tarefa neste dia"}
              {dialog === "editar-tarefa" && "Editar tarefa"}
            </DialogTitle>
          </DialogHeader>

          {erro && (
            <p className="text-sm text-red-600 dark:text-red-400">{erro}</p>
          )}

          {dialog === "recebimento-retirada" && tarefaAtiva && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const input = buildConfirmacaoInput(e.currentTarget);
                run(() =>
                  confirmarRecebimentoRetirada(tarefaAtiva.referenciaId, input)
                );
              }}
            >
              <p className="text-sm text-muted-foreground">
                Confirma o recebimento da{" "}
                <strong>1ª semana + caução</strong> de{" "}
                <strong>{tarefaAtiva.titulo}</strong> (
                {formatCurrency(tarefaAtiva.meta?.valor ?? 0)}).
              </p>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="registrarFinanceiro"
                  defaultChecked
                  className="size-4 rounded"
                />
                Registrar entradas no financeiro (caução e locação)
              </label>
              <div className="space-y-2">
                <Label htmlFor="formaPagamentoRetirada">Forma de pagamento</Label>
                <select
                  id="formaPagamentoRetirada"
                  name="formaPagamento"
                  defaultValue="PIX"
                  className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30"
                >
                  <option value="">Não informado</option>
                  <option value="PIX">PIX</option>
                  <option value="DINHEIRO">Dinheiro</option>
                  <option value="CARTAO_DEBITO">Cartão débito</option>
                  <option value="CARTAO_CREDITO">Cartão crédito</option>
                  <option value="TRANSFERENCIA">Transferência</option>
                  <option value="BOLETO">Boleto</option>
                  <option value="OUTRO">Outro</option>
                </select>
              </div>
              <Button type="submit" disabled={pending} className="w-full">
                {pending ? "Salvando..." : "Confirmar recebimento"}
              </Button>
            </form>
          )}

          {dialog === "confirmar" && tarefaAtiva && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const input = buildConfirmacaoInput(e.currentTarget);
                if (isPagamentoFinanciamento(tarefaAtiva.tipo)) {
                  const fd = new FormData(e.currentTarget);
                  fd.set("dataRecebimento", dataPadrao);
                  run(() =>
                    confirmarPagamentoParcelaFinanciamento(
                      tarefaAtiva.referenciaId,
                      fd
                    )
                  );
                } else if (isCaucaoLocacao(tarefaAtiva.tipo)) {
                  run(() =>
                    confirmarCaucaoLocacao(tarefaAtiva.referenciaId, input)
                  );
                } else {
                  run(() =>
                    confirmarPagamentoParcela(tarefaAtiva.referenciaId, input)
                  );
                }
              }}
            >
              <p className="text-sm text-muted-foreground">
                {isPagamentoFinanciamento(tarefaAtiva.tipo)
                  ? "Valor a pagar"
                  : isCaucaoLocacao(tarefaAtiva.tipo)
                    ? "Caução a receber"
                    : "Valor a receber"}
                :{" "}
                <strong>{formatCurrency(tarefaAtiva.meta?.valor ?? 0)}</strong>
              </p>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="registrarFinanceiro"
                  defaultChecked
                  className="size-4 rounded"
                />
                {isPagamentoFinanciamento(tarefaAtiva.tipo)
                  ? "Registrar saída no financeiro"
                  : isCaucaoLocacao(tarefaAtiva.tipo)
                    ? "Registrar caução no financeiro"
                    : "Registrar entrada no financeiro"}
              </label>
              <p className="text-xs text-muted-foreground">
                Deixe marcado para lançar automaticamente em Financeiro.
              </p>
              <div className="space-y-2">
                <Label htmlFor="formaPagamentoConfirmar">Forma de pagamento</Label>
                <select
                  id="formaPagamentoConfirmar"
                  name="formaPagamento"
                  defaultValue="PIX"
                  className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30"
                >
                  <option value="">Não informado</option>
                  <option value="PIX">PIX</option>
                  <option value="DINHEIRO">Dinheiro</option>
                  <option value="CARTAO_DEBITO">Cartão débito</option>
                  <option value="CARTAO_CREDITO">Cartão crédito</option>
                  <option value="TRANSFERENCIA">Transferência</option>
                  <option value="BOLETO">Boleto</option>
                  <option value="OUTRO">Outro</option>
                </select>
              </div>
              {isPagamentoCliente(tarefaAtiva.tipo) && (
                <p className="text-xs text-muted-foreground">
                  A próxima parcela semanal já está na agenda conforme o contrato.
                </p>
              )}
              <Button type="submit" disabled={pending} className="w-full">
                {pending ? "Salvando..." : "Confirmar pagamento"}
              </Button>
            </form>
          )}

          {dialog === "reagendar" && tarefaAtiva && (
            <>
              {tarefaAtiva.tipo === "PAGAMENTO_CLIENTE" &&
              tarefaAtiva.meta?.valorBase != null ? (
                <ReagendarPagamentoForm
                  valorBase={tarefaAtiva.meta.valorBase}
                  modeloContrato={tarefaAtiva.meta.modeloEncargos}
                  periodicidadePagamento={
                    tarefaAtiva.meta.modeloEncargos === "PLANO_CONQUISTA"
                      ? "MENSAL"
                      : "SEMANAL"
                  }
                  vencimentoContrato={
                    tarefaAtiva.meta.dataVencimentoContrato ??
                    tarefaAtiva.dataInicio
                  }
                  diaSemanaContrato={tarefaAtiva.meta.diaSemanaContrato}
                  dataPagamentoAtual={tarefaAtiva.dataInicio}
                  defaultNovaData={format(
                    new Date(tarefaAtiva.dataInicio),
                    "yyyy-MM-dd"
                  )}
                  disabled={pending}
                  onSubmit={(fd) =>
                    run(() =>
                      reagendarTarefaAgenda(
                        tarefaAtiva.chave,
                        tarefaAtiva.tipo,
                        tarefaAtiva.referenciaId,
                        fd
                      )
                    )
                  }
                />
              ) : (
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    run(() =>
                      reagendarTarefaAgenda(
                        tarefaAtiva.chave,
                        tarefaAtiva.tipo,
                        tarefaAtiva.referenciaId,
                        fd
                      )
                    );
                  }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="novaData">Nova data</Label>
                    <Input
                      id="novaData"
                      name="novaData"
                      type="date"
                      required
                      defaultValue={format(
                        new Date(tarefaAtiva.dataInicio),
                        "yyyy-MM-dd"
                      )}
                    />
                  </div>
                  <Button type="submit" disabled={pending} className="w-full">
                    Reagendar
                  </Button>
                </form>
              )}
            </>
          )}

          {(dialog === "nova-tarefa" || dialog === "editar-tarefa") && (
            <AgendaNovaTarefaForm
              action={submitNovoEventoAgenda}
              veiculos={veiculos}
              clientes={clientes}
              dataPadrao={dataPadrao}
              redirectAno={ano}
              redirectMes={mes}
              redirectDia={dia}
              eventoEdit={
                dialog === "editar-tarefa" && tarefaAtiva
                  ? eventoEditFromTarefa(tarefaAtiva)
                  : null
              }
              onSuccess={() => {
                setDialog(null);
                setTarefaAtiva(null);
                router.refresh();
              }}
              onCancel={() => {
                setDialog(null);
                setTarefaAtiva(null);
              }}
            />
          )}

          {dialog === "ajustar" && tarefaAtiva && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                run(() =>
                  ajustarPagamentoParcela(tarefaAtiva.referenciaId, fd)
                );
              }}
            >
              <p className="text-sm text-muted-foreground">
                Use quando o funcionário esqueceu de marcar o pagamento no dia
                certo. Por padrão não gera juros nem lançamento financeiro.
              </p>
              <div className="space-y-2">
                <Label htmlFor="dataPagamento">Data real do pagamento</Label>
                <Input
                  id="dataPagamento"
                  name="dataPagamento"
                  type="date"
                  required
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="isentarJuros"
                  defaultChecked
                  className="size-4 rounded"
                />
                Isentar juros de atraso
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="registrarFinanceiro"
                  className="size-4 rounded"
                />
                Registrar no financeiro (valor base, sem juros)
              </label>
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observação</Label>
                <Textarea id="observacoes" name="observacoes" rows={2} />
              </div>
              <Button type="submit" disabled={pending} className="w-full">
                Salvar ajuste
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
