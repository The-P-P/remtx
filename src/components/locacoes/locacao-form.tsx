"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormActionsRow } from "@/components/shared/form-actions-row";
import type { FormAction, FormState } from "@/types/form";

const selectClass =
  "flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type VeiculoOption = {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  kmAtual: number;
  status: string;
};

type ClienteOption = {
  id: string;
  nome: string;
  cpf: string;
};

export function LocacaoForm({
  action,
  veiculos,
  clientes,
  veiculoIdPreselect,
  clienteIdPreselect,
  cancelHref = "/locacoes/contratos",
}: {
  action: FormAction;
  veiculos: VeiculoOption[];
  clientes: ClienteOption[];
  veiculoIdPreselect?: string;
  clienteIdPreselect?: string;
  cancelHref?: string;
}) {
  const hoje = format(new Date(), "yyyy-MM-dd");
  const [veiculoId, setVeiculoId] = useState(veiculoIdPreselect ?? "");
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    { success: true }
  );

  const veiculoSel = useMemo(
    () => veiculos.find((v) => v.id === veiculoId),
    [veiculos, veiculoId]
  );

  const veiculosDisponiveis = veiculos.filter(
    (v) => v.status === "DISPONIVEL" || v.id === veiculoIdPreselect
  );

  return (
    <form action={formAction} className="w-full max-w-xl space-y-4">
      {state.success === false && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
          {state.error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="clienteId">Cliente *</Label>
          <select
            id="clienteId"
            name="clienteId"
            defaultValue={clienteIdPreselect ?? ""}
            required
            className={selectClass}
          >
            <option value="">Selecione...</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            <Link href="/clientes/novo" className="underline">
              Cadastrar novo cliente
            </Link>
          </p>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="veiculoId">Veículo *</Label>
          <select
            id="veiculoId"
            name="veiculoId"
            required
            className={selectClass}
            value={veiculoId}
            onChange={(e) => setVeiculoId(e.target.value)}
          >
            <option value="">Selecione...</option>
            {veiculosDisponiveis.map((v) => (
              <option key={v.id} value={v.id}>
                {v.placa} — {v.marca} {v.modelo} ({v.kmAtual} km)
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dataInicio">Data de retirada *</Label>
          <Input
            id="dataInicio"
            name="dataInicio"
            type="date"
            defaultValue={hoje}
            required
          />
          <p className="text-xs text-muted-foreground">
            O pagamento semanal será sempre neste dia da semana (ex.: toda quarta).
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dataFimPrevista">Devolução prevista *</Label>
          <Input
            id="dataFimPrevista"
            name="dataFimPrevista"
            type="date"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="kmInicio">Km retirada *</Label>
          <Input
            id="kmInicio"
            name="kmInicio"
            type="number"
            defaultValue={veiculoSel?.kmAtual ?? 0}
            key={veiculoSel?.id ?? "none"}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="valorDiaria">Valor semanal (R$) *</Label>
          <Input
            id="valorDiaria"
            name="valorDiaria"
            type="number"
            step="0.01"
            min="0.01"
            required
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="iniciarAgora" className="size-4 rounded" />
        Retirada imediata (ativa agora — veículo fica alugado)
      </label>

      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea id="observacoes" name="observacoes" rows={3} />
      </div>

      <FormActionsRow>
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Salvando..." : "Criar locação"}
        </Button>
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          render={<Link href={cancelHref} />}
        >
          Cancelar
        </Button>
      </FormActionsRow>
    </form>
  );
}
