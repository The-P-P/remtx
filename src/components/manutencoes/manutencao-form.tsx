"use client";

import { useActionState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FormAction, FormState } from "@/types/form";

const selectClass =
  "flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type VeiculoOption = {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  kmAtual: number;
};

type TipoOption = {
  id: string;
  nome: string;
  intervaloKm: number;
  pecasPadrao: { nome: string; quantidade: number }[];
};

export function ManutencaoForm({
  action,
  veiculos,
  tipos,
  veiculoIdPreselect,
}: {
  action: FormAction;
  veiculos: VeiculoOption[];
  tipos: TipoOption[];
  veiculoIdPreselect?: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    { success: true }
  );

  const hoje = format(new Date(), "yyyy-MM-dd");

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      {state.success === false && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="veiculoId">Veículo *</Label>
        <select
          id="veiculoId"
          name="veiculoId"
          defaultValue={veiculoIdPreselect ?? ""}
          required
          className={selectClass}
        >
          <option value="">Selecione...</option>
          {veiculos.map((v) => (
            <option key={v.id} value={v.id}>
              {v.placa} — {v.marca} {v.modelo} ({v.kmAtual.toLocaleString("pt-BR")} km)
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tipoManutencaoId">Tipo de manutenção *</Label>
        <select id="tipoManutencaoId" name="tipoManutencaoId" required className={selectClass}>
          <option value="">Selecione...</option>
          {tipos.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome} (a cada {t.intervaloKm.toLocaleString("pt-BR")} km)
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          As peças padrão do tipo serão incluídas automaticamente na ordem de serviço.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dataRealizada">Data realizada *</Label>
          <Input
            id="dataRealizada"
            name="dataRealizada"
            type="date"
            defaultValue={hoje}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="kmRealizada">Km na manutenção *</Label>
          <Input id="kmRealizada" name="kmRealizada" type="number" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="custo">Custo (R$)</Label>
          <Input id="custo" name="custo" type="number" step="0.01" min="0" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea id="observacoes" name="observacoes" rows={3} />
      </div>

      <input type="hidden" name="pecasExtras" value="[]" />

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Registrando..." : "Registrar manutenção"}
        </Button>
        <Button variant="outline" render={<Link href="/manutencoes" />}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
