"use client";

import { FormErrorInline } from "@/components/shared/form-field-error";
import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormActionsRow } from "@/components/shared/form-actions-row";
import { TIPO_TRANSACAO_LABEL } from "@/lib/constants/enums";
import type { FormAction, FormState } from "@/types/form";
import type { TipoTransacao } from "@/types/prisma";

type CategoriaFormProps = {
  action: FormAction;
  initial?: {
    nome: string;
    tipo: TipoTransacao;
    ativo: boolean;
  };
  submitLabel: string;
  cancelHref: string;
};

export function CategoriaForm({
  action,
  initial,
  submitLabel,
  cancelHref,
}: CategoriaFormProps) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    { success: true }
  );

  return (
    <form action={formAction} className="w-full max-w-xl space-y-4">
      {state.success === false && <FormErrorInline error={state.error} />}

      <div className="space-y-2">
        <Label htmlFor="nome">Nome *</Label>
        <Input
          id="nome"
          name="nome"
          required
          maxLength={80}
          defaultValue={initial?.nome}
          placeholder="Ex.: Seguro, Multas, Salários"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tipo">Tipo *</Label>
        <select
          id="tipo"
          name="tipo"
          required
          defaultValue={initial?.tipo ?? "SAIDA"}
          disabled={!!initial}
          className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60 dark:bg-input/30"
        >
          <option value="ENTRADA">{TIPO_TRANSACAO_LABEL.ENTRADA}</option>
          <option value="SAIDA">{TIPO_TRANSACAO_LABEL.SAIDA}</option>
        </select>
        {initial && (
          <p className="text-xs text-muted-foreground">
            O tipo não pode ser alterado após criar a categoria.
          </p>
        )}
      </div>

      {initial && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="ativo"
            defaultChecked={initial.ativo}
            className="size-4 rounded"
          />
          Categoria ativa (disponível em novos lançamentos)
        </label>
      )}

      <FormActionsRow>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : submitLabel}
        </Button>
        <Button variant="outline" render={<Link href={cancelHref} />}>
          Cancelar
        </Button>
      </FormActionsRow>
    </form>
  );
}
