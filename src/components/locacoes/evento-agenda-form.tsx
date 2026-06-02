"use client";

import { FormErrorInline } from "@/components/shared/form-field-error";
import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TIPO_EVENTO_AGENDA_FORM } from "@/lib/constants/enums";
import { FormActionsRow } from "@/components/shared/form-actions-row";
import type { FormAction, FormState } from "@/types/form";

const selectClass =
  "flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type VeiculoOption = { id: string; placa: string; marca: string; modelo: string };
type ClienteOption = { id: string; nome: string };

export function EventoAgendaForm({
  action,
  veiculos,
  clientes,
}: {
  action: FormAction;
  veiculos: VeiculoOption[];
  clientes: ClienteOption[];
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    { success: true }
  );

  return (
    <form action={formAction} className="w-full max-w-xl space-y-4">
      {state.success === false && <FormErrorInline error={state.error} />}

      <div className="space-y-2">
        <Label htmlFor="titulo">Título *</Label>
        <Input
          id="titulo"
          name="titulo"
          required
          placeholder="Ex.: Entrega de veículo — ABC1D23"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo *</Label>
          <select id="tipo" name="tipo" required className={selectClass} defaultValue="LEMBRETE">
            {TIPO_EVENTO_AGENDA_FORM.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="valor">Valor</Label>
          <CurrencyInput id="valor" name="valor" allowEmpty />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dataInicio">Data *</Label>
          <Input id="dataInicio" name="dataInicio" type="date" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dataFim">Data fim (opcional)</Label>
          <Input id="dataFim" name="dataFim" type="date" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="veiculoId">Veículo</Label>
          <select id="veiculoId" name="veiculoId" className={selectClass} defaultValue="">
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
          <select id="clienteId" name="clienteId" className={selectClass} defaultValue="">
            <option value="">Nenhum</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea id="descricao" name="descricao" rows={3} />
      </div>

      <FormActionsRow>
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Salvando..." : "Salvar tarefa"}
        </Button>
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          render={<Link href="/locacoes" />}
        >
          Cancelar
        </Button>
      </FormActionsRow>
    </form>
  );
}
