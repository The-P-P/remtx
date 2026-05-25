"use client";

import { useState, useTransition } from "react";
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
import {
  TIPO_EVENTO_AGENDA_LABEL,
  TIPO_EVENTO_AGENDA_STYLE,
} from "@/lib/constants/enums";
import { formatCurrency } from "@/lib/utils";
import {
  concluirTarefaAgenda,
  desfazerTarefaAgenda,
  reagendarTarefaAgenda,
  confirmarPagamentoParcela,
  ajustarPagamentoParcela,
} from "@/lib/actions/agenda-tarefas";
import type { TipoEventoAgenda } from "@/types/prisma";

export type TarefaAgendaSerializada = {
  id: string;
  chave: string;
  referenciaTipo: "parcela" | "evento" | "agenda";
  referenciaId: string;
  titulo: string;
  descricao?: string | null;
  dataInicio: string;
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
  };
};

type DialogMode = "reagendar" | "ajustar" | "confirmar" | null;

export function AgendaTarefasDia({
  tarefas,
  diaLabel,
}: {
  tarefas: TarefaAgendaSerializada[];
  diaLabel: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogMode>(null);
  const [tarefaAtiva, setTarefaAtiva] = useState<TarefaAgendaSerializada | null>(
    null
  );

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

  if (tarefas.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma tarefa neste dia.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{diaLabel}</p>
      {erro && !dialog && (
        <p className="text-sm text-red-600 dark:text-red-400">{erro}</p>
      )}

      {tarefas.map((t) => {
        const concluido = t.meta?.concluido;
        const isPagamento = t.tipo === "PAGAMENTO_CLIENTE";

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
                      {t.meta.valorJuros != null && t.meta.valorJuros > 0 && (
                        <span className="ml-1 font-normal text-amber-700 dark:text-amber-300">
                          (base {formatCurrency(t.meta.valorBase ?? 0)} + juros{" "}
                          {formatCurrency(t.meta.valorJuros)})
                        </span>
                      )}
                    </p>
                    {t.meta.atrasado && (
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        {t.meta.diasAtraso} dia(s) de atraso — 5% do valor
                        semanal por dia
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
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={pending}
                    onClick={() => abrirDialog("ajustar", t)}
                  >
                    <Settings2 className="size-3.5" />
                    Ajustar check
                  </Button>
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

              {!isPagamento && !concluido && (
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

              {!isPagamento && concluido && (
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
                run(() =>
                  confirmarPagamentoParcela(tarefaAtiva.referenciaId, fd)
                );
              }}
            >
              <p className="text-sm text-muted-foreground">
                Valor a receber:{" "}
                <strong>{formatCurrency(tarefaAtiva.meta?.valor ?? 0)}</strong>
              </p>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="registrarFinanceiro"
                  defaultChecked
                  className="size-4 rounded"
                />
                Registrar entrada no financeiro
              </label>
              <p className="text-xs text-muted-foreground">
                A próxima parcela semanal já está na agenda conforme o contrato.
              </p>
              <Button type="submit" disabled={pending} className="w-full">
                {pending ? "Salvando..." : "Confirmar pagamento"}
              </Button>
            </form>
          )}

          {dialog === "reagendar" && tarefaAtiva && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const novaData = fd.get("novaData") as string;
                run(() =>
                  reagendarTarefaAgenda(
                    tarefaAtiva.chave,
                    tarefaAtiva.tipo,
                    tarefaAtiva.referenciaId,
                    novaData
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
              {tarefaAtiva.tipo === "PAGAMENTO_CLIENTE" && (
                <p className="text-xs text-muted-foreground">
                  Juros zerados até a nova data; após o vencimento, voltam a
                  acumular 5% ao dia.
                </p>
              )}
              <Button type="submit" disabled={pending} className="w-full">
                Reagendar
              </Button>
            </form>
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
