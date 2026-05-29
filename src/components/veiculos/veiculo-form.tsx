"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KmInput } from "@/components/ui/km-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CurrencyInput } from "@/components/ui/currency-input";
import { format } from "date-fns";
import { STATUS_VEICULO_LABEL } from "@/lib/constants/enums";
import type { StatusVeiculo, PorteVeiculo } from "@/types/prisma";
import { FormActionsRow } from "@/components/shared/form-actions-row";
import { PorteVeiculoPicker } from "@/components/veiculos/porte-veiculo-picker";
import {
  VeiculoFinanciamentoFields,
  type FinanciamentoInitial,
} from "@/components/veiculos/veiculo-financiamento-fields";
import type { FormAction, FormState } from "@/types/form";

const selectClass =
  "flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type VeiculoFormProps = {
  action: FormAction;
  initial?: {
    placa: string;
    apelido?: string | null;
    marca: string;
    modelo: string;
    ano: number;
    cor?: string | null;
    porte?: PorteVeiculo;
    kmAtual: number;
    kmProximaRevisao: number;
    status: StatusVeiculo;
    observacoes?: string | null;
    ipvaVencimento?: Date | null;
    valorCompra?: unknown;
    dataCompra?: Date | null;
  };
  submitLabel: string;
  cancelHref: string;
  financiamentoInitial?: FinanciamentoInitial | null;
};

export function VeiculoForm({
  action,
  initial,
  submitLabel,
  cancelHref,
  financiamentoInitial,
}: VeiculoFormProps) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    { success: true }
  );

  return (
    <form action={formAction} className="w-full max-w-2xl space-y-4">
      {state.success === false && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="placa">Placa *</Label>
          <Input
            id="placa"
            name="placa"
            defaultValue={initial?.placa}
            placeholder="ABC1D23"
            required
            className="uppercase"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <select
            id="status"
            name="status"
            defaultValue={initial?.status ?? "DISPONIVEL"}
            className={selectClass}
          >
            {(Object.keys(STATUS_VEICULO_LABEL) as StatusVeiculo[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_VEICULO_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="apelido">Apelido</Label>
          <Input
            id="apelido"
            name="apelido"
            defaultValue={initial?.apelido ?? ""}
            placeholder="Ex.: Uno prata, Carro reserva..."
            maxLength={60}
          />
          <p className="text-xs text-muted-foreground">
            Nome interno para reconhecer o veículo na frota (opcional).
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="marca">Marca *</Label>
          <Input id="marca" name="marca" defaultValue={initial?.marca} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="modelo">Modelo *</Label>
          <Input id="modelo" name="modelo" defaultValue={initial?.modelo} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ano">Ano *</Label>
          <Input
            id="ano"
            name="ano"
            type="number"
            defaultValue={initial?.ano}
            required
          />
        </div>
      </div>

      <PorteVeiculoPicker
        defaultPorte={initial?.porte}
        defaultCor={initial?.cor}
        defaultModelo={initial?.modelo}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="kmAtual">Km atual *</Label>
          <KmInput
            id="kmAtual"
            name="kmAtual"
            defaultValue={initial?.kmAtual ?? 0}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="kmProximaRevisao">Km próxima revisão *</Label>
          <KmInput
            id="kmProximaRevisao"
            name="kmProximaRevisao"
            defaultValue={initial?.kmProximaRevisao}
            required
          />
        </div>
      </div>

      <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
        <p className="text-sm font-medium">Aquisição do veículo</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="valorCompra">Valor de compra</Label>
            <CurrencyInput
              id="valorCompra"
              name="valorCompra"
              defaultValue={
                initial?.valorCompra != null
                  ? Number(initial.valorCompra)
                  : undefined
              }
            />
            <p className="text-xs text-muted-foreground">
              Valor total pago na aquisição (à vista ou referência do veículo).
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dataCompra">Data da compra</Label>
            <Input
              id="dataCompra"
              name="dataCompra"
              type="date"
              defaultValue={
                initial?.dataCompra
                  ? format(initial.dataCompra, "yyyy-MM-dd")
                  : ""
              }
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ipvaVencimento">Vencimento IPVA (anual)</Label>
        <Input
          id="ipvaVencimento"
          name="ipvaVencimento"
          type="date"
          defaultValue={
            initial?.ipvaVencimento
              ? format(initial.ipvaVencimento, "yyyy-MM-dd")
              : ""
          }
        />
        <p className="text-xs text-muted-foreground">
          Aparece na agenda todo ano nesta data.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          name="observacoes"
          defaultValue={initial?.observacoes ?? ""}
          rows={3}
        />
      </div>

      <VeiculoFinanciamentoFields initial={financiamentoInitial} />

      <FormActionsRow>
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Salvando..." : submitLabel}
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
