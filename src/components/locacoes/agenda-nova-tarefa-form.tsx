"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useActionState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TIPO_EVENTO_AGENDA_FORM } from "@/lib/constants/enums";
import type { FormAction, FormState } from "@/types/form";
import type { TipoEventoAgenda } from "@/types/prisma";

const selectClass =
  "flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type VeiculoOption = { id: string; placa: string; marca: string; modelo: string };
type ClienteOption = { id: string; nome: string };

export type EventoAgendaEdit = {
  id: string;
  tipo: TipoEventoAgenda;
  titulo: string;
  descricao?: string | null;
  dataInicio: string;
  dataFim?: string | null;
  veiculoId?: string;
  clienteId?: string;
  valor?: number;
};

export function AgendaNovaTarefaForm({
  action,
  veiculos,
  clientes,
  dataPadrao,
  redirectAno,
  redirectMes,
  redirectDia,
  eventoEdit,
  onSuccess,
  onCancel,
}: {
  action: FormAction;
  veiculos: VeiculoOption[];
  clientes: ClienteOption[];
  dataPadrao: string;
  redirectAno: number;
  redirectMes: number;
  redirectDia: number;
  eventoEdit?: EventoAgendaEdit | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const isEdit = Boolean(eventoEdit?.id);

  const [tipo, setTipo] = useState<TipoEventoAgenda>(
    eventoEdit?.tipo ?? "ENTREGA_VEICULO"
  );
  const [veiculoId, setVeiculoId] = useState(eventoEdit?.veiculoId ?? "");
  const [clienteId, setClienteId] = useState(eventoEdit?.clienteId ?? "");
  const [titulo, setTitulo] = useState(
    eventoEdit?.titulo ??
      TIPO_EVENTO_AGENDA_FORM.find((t) => t.value === "ENTREGA_VEICULO")
        ?.tituloPadrao ??
      "Tarefa"
  );
  const [tituloManual, setTituloManual] = useState(isEdit);

  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    { success: true }
  );
  const wasPending = useRef(false);

  const tipoConfig = useMemo(
    () => TIPO_EVENTO_AGENDA_FORM.find((t) => t.value === tipo),
    [tipo]
  );

  const veiculoSel = veiculos.find((v) => v.id === veiculoId);

  const dataInicioValue = eventoEdit?.dataInicio ?? dataPadrao;
  const dataFimValue = eventoEdit?.dataFim
    ? format(new Date(eventoEdit.dataFim), "yyyy-MM-dd")
    : "";

  useEffect(() => {
    if (wasPending.current && !pending && state.success) {
      onSuccess?.();
    }
    wasPending.current = pending;
  }, [pending, state.success, onSuccess]);

  useEffect(() => {
    if (tituloManual) return;
    const padrao = tipoConfig?.tituloPadrao ?? "Tarefa";
    if (veiculoSel) {
      setTitulo(`${padrao} — ${veiculoSel.placa}`);
    } else {
      setTitulo(padrao);
    }
  }, [tipo, veiculoSel?.placa, tipoConfig?.tituloPadrao, tituloManual]);

  const mostraValor = tipo === "FINANCEIRO";

  return (
    <form action={formAction} className="space-y-4" key={eventoEdit?.id ?? "novo"}>
      {isEdit && <input type="hidden" name="eventoId" value={eventoEdit!.id} />}
      <input type="hidden" name="semRedirect" value="sim" />
      <input type="hidden" name="redirectAno" value={String(redirectAno)} />
      <input type="hidden" name="redirectMes" value={String(redirectMes)} />
      <input type="hidden" name="redirectDia" value={String(redirectDia)} />

      {state.success === false && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
          {state.error}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="tipo">Tipo de tarefa *</Label>
        <select
          id="tipo"
          name="tipo"
          required
          className={selectClass}
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoEventoAgenda)}
        >
          {TIPO_EVENTO_AGENDA_FORM.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="titulo">Título *</Label>
        <Input
          id="titulo"
          name="titulo"
          required
          value={titulo}
          onChange={(e) => {
            setTituloManual(true);
            setTitulo(e.target.value);
          }}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dataInicio">Data *</Label>
          <Input
            id="dataInicio"
            name="dataInicio"
            type="date"
            required
            defaultValue={dataInicioValue}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dataFim">Até (opcional)</Label>
          <Input
            id="dataFim"
            name="dataFim"
            type="date"
            defaultValue={dataFimValue}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="veiculoId">Veículo</Label>
          <select
            id="veiculoId"
            name="veiculoId"
            className={selectClass}
            value={veiculoId}
            onChange={(e) => setVeiculoId(e.target.value)}
          >
            <option value="">Nenhum</option>
            {veiculos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.placa} — {v.modelo}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="clienteId">Cliente</Label>
          <select
            id="clienteId"
            name="clienteId"
            className={selectClass}
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
          >
            <option value="">Nenhum</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {mostraValor && (
        <div className="space-y-2">
          <Label htmlFor="valor">Valor (R$)</Label>
          <Input
            id="valor"
            name="valor"
            type="number"
            step="0.01"
            min="0"
            defaultValue={eventoEdit?.valor ?? ""}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="descricao">Detalhes (oficina, endereço, serviço…)</Label>
        <Textarea
          id="descricao"
          name="descricao"
          rows={3}
          placeholder="Ex.: Revisão 10.000 km — Oficina Centro"
          defaultValue={eventoEdit?.descricao ?? ""}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Salvando..."
            : isEdit
              ? "Salvar alterações"
              : "Adicionar à agenda"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
