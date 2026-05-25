"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitNovaParcela } from "@/lib/actions/form-actions";
import type { FormState } from "@/types/form";

export function ParcelaForm({ locacaoId }: { locacaoId: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    submitNovaParcela,
    { success: true }
  );

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-4 sm:items-end">
      <input type="hidden" name="locacaoId" value={locacaoId} />
      {state.success === false && (
        <p className="text-sm text-red-600 sm:col-span-4">{state.error}</p>
      )}
      <div className="space-y-2">
        <Label htmlFor="valor">Valor (R$)</Label>
        <Input id="valor" name="valor" type="number" step="0.01" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dataVencimento">Vencimento</Label>
        <Input
          id="dataVencimento"
          name="dataVencimento"
          type="date"
          required
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="observacoes">Obs.</Label>
        <Input id="observacoes" name="observacoes" />
      </div>
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "..." : "Adicionar parcela"}
      </Button>
    </form>
  );
}
