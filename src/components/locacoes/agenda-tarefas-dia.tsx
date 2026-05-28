"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
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
  ajustarPagamentoParcela,
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
  referenciaTipo: "parcela" | "evento" | "agenda" | "financiamento";
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
    diasAtraso?: number;
    atrasado?: boolean;
    concluido?: boolean;
    pagamentoAjustado?: boolean;
    dataVencimentoContrato?: string;
    diaSemanaContrato?: string;
    pagamentoReagendado?: boolean;
    veiculoId?: string;
    clienteId?: string;
    parcelaNumero?: number;
    totalParcelas?: number;
  };
};

type DialogMode =
  | "reagendar"
  | "ajustar"
  | "confirmar"
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

  const isPagamentoCliente = (tipo: TipoEventoAgenda) =>
    tipo === "PAGAMENTO_CLIENTE";
  const isPagamentoFinanciamento = (tipo: TipoEventoAgenda) =>
    tipo === "FINANCIAMENTO_VEICULO";
  const isPagamentoTipo = (tipo: TipoEventoAgenda) =>
    isPagamentoCliente(tipo) || isPagamentoFinanciamento(tipo);
  const isEventoManual = (t: TarefaAgendaSerializada) =>
    t.referenciaTipo === "evento";

  const isTarefaManual = (t: TarefaAgendaSerializada) =>
    isEventoManual(t) ||
    [
      "ENTREGA_VEICULO",
      "RETIRADA_VEICULO",
      "OFICINA_SERVICO",
      "MANUTENCAO_AGENDADA",
      "LEMBRETE",
      "IPVA",
      "FINANCEIRO",
    ].includes(t.tipo);

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

      {tarefas.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Nenhuma tarefa neste dia. Use &quot;Adicionar tarefa&quot; para entrega,
          retirada, oficina, etc.
        </p>
      )}

      {tarefas.map((t) => {
        const concluido = t.meta?.concluido;
        const isPagamento = isPagamentoTipo(t.tipo);
        const tarefaCheck = isTarefaManual(t) || t.chave.startsWith("loc-") || t.chave.startsWith("ipva-");

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
                            (base {formatCurrency(t.meta.valorBase ?? 0)} + juros{" "}
                            {formatCurrency(t.meta.valorJuros)})
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
                        {t.meta.diasAtraso} dia(s) de atraso — 5% do valor
                        semanal por dia
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
                  </div>
                )}
              </div>
              <Badge variant="outline" className="shrink-0">
                {concluido ? "Feito" : t.meta?.atrasado ? "Atrasado" : "Pendente"}
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
              {dialog === "confirmar" && "Confirmar pagamento"}
              {dialog === "reagendar" && "Reagendar tarefa"}
              {dialog === "ajustar" && "Ajustar pagamento (check esquecido)"}
              {dialog === "nova-tarefa" && "Nova tarefa neste dia"}
              {dialog === "editar-tarefa" && "Editar tarefa"}
            </DialogTitle>
          </DialogHeader>

          {erro && (
            <p className="text-sm text-red-600 dark:text-red-400">{erro}</p>
          )}

          {dialog === "confirmar" && tarefaAtiva && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                if (isPagamentoFinanciamento(tarefaAtiva.tipo)) {
                  run(() =>
                    confirmarPagamentoParcelaFinanciamento(
                      tarefaAtiva.referenciaId,
                      fd
                    )
                  );
                } else {
                  run(() =>
                    confirmarPagamentoParcela(tarefaAtiva.referenciaId, fd)
                  );
                }
              }}
            >
              <p className="text-sm text-muted-foreground">
                {isPagamentoFinanciamento(tarefaAtiva.tipo)
                  ? "Valor a pagar"
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
                  : "Registrar entrada no financeiro"}
              </label>
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
