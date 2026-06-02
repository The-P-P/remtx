"use client";

import { FormErrorInline } from "@/components/shared/form-field-error";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
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
      {state.success === false && <FormErrorInline error={state.error} />}
      <div className="space-y-2">
        <Label htmlFor="valor">Valor</Label>
        <CurrencyInput id="valor" name="valor" required />
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
