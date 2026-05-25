"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ativarLocacao,
  cancelarLocacao,
  finalizarLocacao,
  marcarParcelaPaga,
} from "@/lib/actions/locacoes";
import { deleteEventoAgenda, toggleEventoConcluido } from "@/lib/actions/eventos-agenda";
import type { StatusLocacao } from "@/types/prisma";

export function LocacaoAcoes({
  locacaoId,
  status,
  kmInicio,
  kmAtualVeiculo,
}: {
  locacaoId: string;
  status: StatusLocacao;
  kmInicio: number;
  kmAtualVeiculo: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const hoje = format(new Date(), "yyyy-MM-dd");

  function run(action: () => Promise<{ success: boolean; error?: string }>) {
    setErro(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setErro("error" in result && result.error ? result.error : "Erro");
        return;
      }
      router.refresh();
    });
  }

  if (status === "FINALIZADA" || status === "CANCELADA") {
    return null;
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="font-semibold">Ações do contrato</h3>
      {erro && (
        <p className="text-sm text-red-600 dark:text-red-400">{erro}</p>
      )}

      {status === "RESERVADA" && (
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={pending}
            onClick={() => run(() => ativarLocacao(locacaoId))}
          >
            Confirmar retirada
          </Button>
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => run(() => cancelarLocacao(locacaoId))}
          >
            Cancelar reserva
          </Button>
        </div>
      )}

      {status === "ATIVA" && (
        <form
          className="grid max-w-md gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            run(() => finalizarLocacao(locacaoId, fd));
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="dataFimReal">Data devolução *</Label>
            <Input
              id="dataFimReal"
              name="dataFimReal"
              type="date"
              defaultValue={hoje}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kmFim">Km devolução *</Label>
            <Input
              id="kmFim"
              name="kmFim"
              type="number"
              defaultValue={Math.max(kmInicio, kmAtualVeiculo)}
              required
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="registrarFinanceiro"
              className="size-4 rounded"
            />
            Registrar entrada no financeiro
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={pending}>
              Finalizar locação
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => run(() => cancelarLocacao(locacaoId))}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export function ParcelaPagarButton({ parcelaId }: { parcelaId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await marcarParcelaPaga(parcelaId);
          router.refresh();
        })
      }
    >
      Marcar pago
    </Button>
  );
}

export function EventoAgendaAcoes({
  eventoId,
  concluido,
}: {
  eventoId: string;
  concluido: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await toggleEventoConcluido(eventoId, !concluido);
            router.refresh();
          })
        }
      >
        {concluido ? "Reabrir" : "Concluir"}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await deleteEventoAgenda(eventoId);
            router.refresh();
          })
        }
      >
        Excluir
      </Button>
    </div>
  );
}
