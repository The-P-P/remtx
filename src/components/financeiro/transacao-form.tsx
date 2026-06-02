"use client";

import { FormErrorInline } from "@/components/shared/form-field-error";
import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { FormActionsRow } from "@/components/shared/form-actions-row";
import {
  FORMAS_PAGAMENTO_OPTIONS,
  TIPO_TRANSACAO_LABEL,
} from "@/lib/constants/enums";
import type { FormaPagamento } from "@/types/prisma";
import type { FormAction, FormState } from "@/types/form";
import type { TipoTransacao } from "@/types/prisma";

type CategoriaOption = {
  id: string;
  nome: string;
  tipo: TipoTransacao;
  ativo: boolean;
};

type TransacaoFormProps = {
  action: FormAction;
  categorias: CategoriaOption[];
  initial?: {
    tipo: TipoTransacao;
    categoriaId: string;
    valor: number;
    descricao: string;
    data: Date;
    formaPagamento?: FormaPagamento | null;
  };
  submitLabel: string;
  cancelHref: string;
  redirectAno?: number;
  redirectMes?: number;
};

export function TransacaoForm({
  action,
  categorias,
  initial,
  submitLabel,
  cancelHref,
  redirectAno,
  redirectMes,
}: TransacaoFormProps) {
  const [tipo, setTipo] = useState<TipoTransacao>(initial?.tipo ?? "ENTRADA");
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    { success: true }
  );

  const categoriasFiltradas = useMemo(
    () => categorias.filter((c) => c.ativo && c.tipo === tipo),
    [categorias, tipo]
  );

  const dataDefault = initial?.data
    ? format(initial.data, "yyyy-MM-dd")
    : format(new Date(), "yyyy-MM-dd");

  return (
    <form action={formAction} className="w-full max-w-xl space-y-4">
      {redirectAno != null && redirectMes != null && (
        <>
          <input type="hidden" name="redirectAno" value={redirectAno} />
          <input type="hidden" name="redirectMes" value={redirectMes} />
        </>
      )}

      {state.success === false && <FormErrorInline error={state.error} />}

      <div className="space-y-2">
        <Label>Tipo *</Label>
        <div className="flex gap-2">
          {(["ENTRADA", "SAIDA"] as const).map((t) => (
            <label
              key={t}
              className={`flex flex-1 cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                tipo === t
                  ? t === "ENTRADA"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
                    : "border-red-500 bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-200"
                  : "border-input bg-muted/30 text-muted-foreground"
              }`}
            >
              <input
                type="radio"
                name="tipo"
                value={t}
                checked={tipo === t}
                onChange={() => setTipo(t)}
                className="sr-only"
              />
              {TIPO_TRANSACAO_LABEL[t]}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoriaId">Categoria *</Label>
        <select
          id="categoriaId"
          name="categoriaId"
          required
          defaultValue={initial?.categoriaId}
          className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        >
          <option value="">Selecione...</option>
          {categoriasFiltradas.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
        {categoriasFiltradas.length === 0 && (
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Nenhuma categoria ativa para {TIPO_TRANSACAO_LABEL[tipo].toLowerCase()}.{" "}
            <Link href="/financeiro/categorias/nova" className="underline">
              Cadastrar categoria
            </Link>
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="valor">Valor *</Label>
          <CurrencyInput
            id="valor"
            name="valor"
            required
            defaultValue={initial?.valor}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="data">Data *</Label>
          <Input
            id="data"
            name="data"
            type="date"
            required
            defaultValue={dataDefault}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="formaPagamento">Forma de pagamento</Label>
        <select
          id="formaPagamento"
          name="formaPagamento"
          defaultValue={initial?.formaPagamento ?? ""}
          className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        >
          <option value="">Não informado</option>
          {FORMAS_PAGAMENTO_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição *</Label>
        <Input
          id="descricao"
          name="descricao"
          required
          maxLength={500}
          defaultValue={initial?.descricao}
          placeholder="Ex.: Pagamento fornecedor, locação placa ABC1D23"
        />
      </div>

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
