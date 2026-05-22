"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { STATUS_VEICULO_LABEL } from "@/lib/constants/enums";
import type { StatusVeiculo } from "@/types/prisma";
import type { FormAction, FormState } from "@/types/form";

const selectClass =
  "flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type VeiculoFormProps = {
  action: FormAction;
  initial?: {
    placa: string;
    marca: string;
    modelo: string;
    ano: number;
    cor?: string | null;
    kmAtual: number;
    kmProximaRevisao: number;
    status: StatusVeiculo;
    observacoes?: string | null;
  };
  submitLabel: string;
  cancelHref: string;
};

export function VeiculoForm({
  action,
  initial,
  submitLabel,
  cancelHref,
}: VeiculoFormProps) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    { success: true }
  );

  return (
    <form action={formAction} className="max-w-xl space-y-4">
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
        <div className="space-y-2">
          <Label htmlFor="cor">Cor</Label>
          <Input id="cor" name="cor" defaultValue={initial?.cor ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="kmAtual">Km atual *</Label>
          <Input
            id="kmAtual"
            name="kmAtual"
            type="number"
            defaultValue={initial?.kmAtual ?? 0}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="kmProximaRevisao">Km próxima revisão *</Label>
          <Input
            id="kmProximaRevisao"
            name="kmProximaRevisao"
            type="number"
            defaultValue={initial?.kmProximaRevisao}
            required
          />
        </div>
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

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : submitLabel}
        </Button>
        <Button variant="outline" render={<Link href={cancelHref} />}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
