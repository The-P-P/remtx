"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GRAVIDADE_LABEL } from "@/lib/constants/enums";
import type { GravidadeProblema } from "@/types/prisma";
import type { FormAction, FormState } from "@/types/form";

const selectClass =
  "flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function ProblemaCronicoForm({
  veiculoId,
  action,
}: {
  veiculoId: string;
  action: FormAction;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    { success: true }
  );

  return (
    <form action={formAction} className="space-y-3 rounded-lg border p-4">
      <input type="hidden" name="veiculoId" value={veiculoId} />
      {state.success === false && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição do problema *</Label>
        <Input id="descricao" name="descricao" required placeholder="Ex.: Ar-condicionado com vazamento" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="gravidade">Gravidade *</Label>
        <select id="gravidade" name="gravidade" defaultValue="MEDIA" className={selectClass}>
          {(Object.keys(GRAVIDADE_LABEL) as GravidadeProblema[]).map((g) => (
            <option key={g} value={g}>
              {GRAVIDADE_LABEL[g]}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Salvando..." : "Registrar problema"}
      </Button>
    </form>
  );
}
