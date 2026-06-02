"use client";

import { useMemo } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormActionsRow } from "@/components/shared/form-actions-row";
import {
  FormErrorBanner,
  FormFieldError,
} from "@/components/shared/form-field-error";
import {
  formatCpfDisplay,
  formatCpfInput,
  formatTelefoneDisplay,
  formatTelefoneInput,
} from "@/lib/format/br";
import { useFormDraft } from "@/hooks/use-form-draft";
import type { FormAction, FormState } from "@/types/form";

type ClienteFormProps = {
  action: FormAction;
  initial?: {
    nome: string;
    cpf: string;
    telefone: string;
    email?: string | null;
    endereco?: string | null;
    rg?: string | null;
    rgOrgao?: string | null;
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
  const defaults = useMemo(
    () => ({
      nome: initial?.nome ?? "",
      cpf: initial?.cpf ? formatCpfDisplay(initial.cpf) : "",
      telefone: initial?.telefone ? formatTelefoneDisplay(initial.telefone) : "",
      email: initial?.email ?? "",
      endereco: initial?.endereco ?? "",
      rg: initial?.rg ?? "",
      rgOrgao: initial?.rgOrgao ?? "",
      observacoes: initial?.observacoes ?? "",
    }),
    [initial]
  );

  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    { success: true }
  );

  const { val, fieldError, fieldClass, capture, setDraft } = useFormDraft(
    state,
    defaults
  );

  const syncForm = (form: HTMLFormElement | null) => {
    if (form) capture(form);
  };

  return (
    <form
      action={formAction}
      onSubmit={(e) => capture(e.currentTarget)}
      className="w-full max-w-xl space-y-4"
    >
      {state.success === false && (
        <FormErrorBanner error={state.error} fieldErrors={state.fieldErrors} />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="nome">Nome *</Label>
          <Input
            id="nome"
            name="nome"
            value={val("nome")}
            onChange={(e) => syncForm(e.currentTarget.form)}
            required
            className={fieldClass(!!fieldError("nome"))}
          />
          <FormFieldError message={fieldError("nome")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF *</Label>
          <Input
            id="cpf"
            name="cpf"
            value={val("cpf")}
            onChange={(e) => {
              setDraft((prev) => ({
                ...prev,
                cpf: formatCpfInput(e.target.value),
              }));
            }}
            placeholder="000.000.000-00"
            inputMode="numeric"
            autoComplete="off"
            required
            className={fieldClass(!!fieldError("cpf"))}
          />
          <FormFieldError message={fieldError("cpf")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone *</Label>
          <Input
            id="telefone"
            name="telefone"
            value={val("telefone")}
            onChange={(e) => {
              setDraft((prev) => ({
                ...prev,
                telefone: formatTelefoneInput(e.target.value),
              }));
            }}
            placeholder="+55 (99) 9 9999-9999"
            inputMode="tel"
            autoComplete="tel"
            required
            className={fieldClass(!!fieldError("telefone"))}
          />
          <FormFieldError message={fieldError("telefone")} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={val("email")}
            onChange={(e) => syncForm(e.currentTarget.form)}
            className={fieldClass(!!fieldError("email"))}
          />
          <FormFieldError message={fieldError("email")} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="endereco">Endereço</Label>
          <Input
            id="endereco"
            name="endereco"
            value={val("endereco")}
            onChange={(e) => syncForm(e.currentTarget.form)}
            className={fieldClass(!!fieldError("endereco"))}
          />
          <FormFieldError message={fieldError("endereco")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rg">RG</Label>
          <Input
            id="rg"
            name="rg"
            value={val("rg")}
            onChange={(e) => syncForm(e.currentTarget.form)}
            className={fieldClass(!!fieldError("rg"))}
          />
          <FormFieldError message={fieldError("rg")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rgOrgao">Órgão emissor</Label>
          <Input
            id="rgOrgao"
            name="rgOrgao"
            value={val("rgOrgao")}
            onChange={(e) => syncForm(e.currentTarget.form)}
            className={fieldClass(!!fieldError("rgOrgao"))}
          />
          <FormFieldError message={fieldError("rgOrgao")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          name="observacoes"
          value={val("observacoes")}
          onChange={(e) => syncForm(e.currentTarget.form)}
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
