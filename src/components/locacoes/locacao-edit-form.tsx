"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormActionsRow } from "@/components/shared/form-actions-row";
import type { FormAction, FormState } from "@/types/form";

export function LocacaoEditForm({
  action,
  initial,
  locacaoId,
}: {
  action: FormAction;
  initial: {
    dataFimPrevista: Date | null;
    valorDiaria: number;
    observacoes?: string | null;
  };
  locacaoId: string;
}) {
  const [prazoIndeterminado, setPrazoIndeterminado] = useState(
    !initial.dataFimPrevista
  );

  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    { success: true }
  );

  return (
    <form action={formAction} className="max-w-md space-y-4">
      {state.success === false && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="dataFimPrevista">Devolução prevista</Label>
        <Input
          id="dataFimPrevista"
          name="dataFimPrevista"
          type="date"
          disabled={prazoIndeterminado}
          className={prazoIndeterminado ? "opacity-50" : undefined}
          defaultValue={
            initial.dataFimPrevista
              ? format(initial.dataFimPrevista, "yyyy-MM-dd")
              : undefined
          }
        />
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            name="prazoIndeterminado"
            className="size-4 rounded"
            checked={prazoIndeterminado}
            onChange={(e) => setPrazoIndeterminado(e.target.checked)}
          />
          Prazo indeterminado
        </label>
      </div>
      <div className="space-y-2">
        <Label htmlFor="valorDiaria">Valor semanal (R$) *</Label>
        <Input
          id="valorDiaria"
          name="valorDiaria"
          type="number"
          step="0.01"
          defaultValue={Number(initial.valorDiaria)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          name="observacoes"
          defaultValue={initial.observacoes ?? ""}
          rows={3}
        />
      </div>

      <FormActionsRow>
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Salvando..." : "Salvar"}
        </Button>
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          render={<Link href={`/locacoes/${locacaoId}`} />}
        >
          Cancelar
        </Button>
      </FormActionsRow>
    </form>
  );
}
