"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormActionsRow } from "@/components/shared/form-actions-row";
import {
  formatCpfDisplay,
  formatCpfInput,
  formatTelefoneDisplay,
  formatTelefoneInput,
} from "@/lib/format/br";
import type { FormAction, FormState } from "@/types/form";

type ClienteFormProps = {
  action: FormAction;
  initial?: {
    nome: string;
    cpf: string;
    telefone: string;
    email?: string | null;
    endereco?: string | null;
    observacoes?: string | null;
  };
  submitLabel: string;
  cancelHref: string;
};

export function ClienteForm({
  action,
  initial,
  submitLabel,
  cancelHref,
}: ClienteFormProps) {
  const [cpf, setCpf] = useState(() =>
    initial?.cpf ? formatCpfDisplay(initial.cpf) : ""
  );
  const [telefone, setTelefone] = useState(() =>
    initial?.telefone ? formatTelefoneDisplay(initial.telefone) : ""
  );

  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    { success: true }
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
          <Label htmlFor="nome">Nome *</Label>
          <Input id="nome" name="nome" defaultValue={initial?.nome} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF *</Label>
          <Input
            id="cpf"
            name="cpf"
            value={cpf}
            onChange={(e) => setCpf(formatCpfInput(e.target.value))}
            placeholder="000.000.000-00"
            inputMode="numeric"
            autoComplete="off"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone *</Label>
          <Input
            id="telefone"
            name="telefone"
            value={telefone}
            onChange={(e) => setTelefone(formatTelefoneInput(e.target.value))}
            placeholder="+55 (99) 9 9999-9999"
            inputMode="tel"
            autoComplete="tel"
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={initial?.email ?? ""}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="endereco">Endereço</Label>
          <Input
            id="endereco"
            name="endereco"
            defaultValue={initial?.endereco ?? ""}
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
