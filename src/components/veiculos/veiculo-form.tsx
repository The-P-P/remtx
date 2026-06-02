"use client";

import { useMemo } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KmInput } from "@/components/ui/km-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CurrencyInput } from "@/components/ui/currency-input";
import { format } from "date-fns";
import { STATUS_VEICULO_LABEL } from "@/lib/constants/enums";
import type { StatusVeiculo, PorteVeiculo } from "@/types/prisma";
import { FormActionsRow } from "@/components/shared/form-actions-row";
import {
  FormErrorBanner,
  FormFieldError,
} from "@/components/shared/form-field-error";
import { PorteVeiculoPicker } from "@/components/veiculos/porte-veiculo-picker";
import {
  VeiculoFinanciamentoFields,
  type FinanciamentoInitial,
} from "@/components/veiculos/veiculo-financiamento-fields";
import { useFormDraft } from "@/hooks/use-form-draft";
import type { FormAction, FormState } from "@/types/form";

const selectClass =
  "flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type VeiculoFormProps = {
  action: FormAction;
  initial?: {
    placa: string;
    apelido?: string | null;
    marca: string;
    modelo: string;
    ano: number;
    cor?: string | null;
    renavam?: string | null;
    porte?: PorteVeiculo;
    kmAtual: number;
    kmProximaRevisao: number;
    status: StatusVeiculo;
    observacoes?: string | null;
    ipvaVencimento?: Date | null;
    valorCompra?: unknown;
    dataCompra?: Date | null;
  };
  submitLabel: string;
  cancelHref: string;
  financiamentoInitial?: FinanciamentoInitial | null;
};

export function VeiculoForm({
  action,
  initial,
  submitLabel,
  cancelHref,
  financiamentoInitial,
}: VeiculoFormProps) {
  const defaults = useMemo(
    () => ({
      placa: initial?.placa ?? "",
      status: initial?.status ?? "DISPONIVEL",
      apelido: initial?.apelido ?? "",
      marca: initial?.marca ?? "",
      modelo: initial?.modelo ?? "",
      ano: initial?.ano != null ? String(initial.ano) : "",
      renavam: initial?.renavam ?? "",
      kmAtual: initial?.kmAtual != null ? String(initial.kmAtual) : "0",
      kmProximaRevisao:
        initial?.kmProximaRevisao != null
          ? String(initial.kmProximaRevisao)
          : "",
      valorCompra:
        initial?.valorCompra != null ? String(Number(initial.valorCompra)) : "",
      dataCompra: initial?.dataCompra
        ? format(initial.dataCompra, "yyyy-MM-dd")
        : "",
      ipvaVencimento: initial?.ipvaVencimento
        ? format(initial.ipvaVencimento, "yyyy-MM-dd")
        : "",
      observacoes: initial?.observacoes ?? "",
    }),
    [initial]
  );

  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    { success: true }
  );

  const { val, num, fieldError, fieldClass, capture, setDraft } = useFormDraft(
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
      className="w-full max-w-2xl space-y-4"
    >
      {state.success === false && (
        <FormErrorBanner error={state.error} fieldErrors={state.fieldErrors} />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="placa">Placa *</Label>
          <Input
            id="placa"
            name="placa"
            value={val("placa")}
            onChange={(e) => syncForm(e.currentTarget.form)}
            placeholder="ABC1D23"
            required
            className={`uppercase ${fieldClass(!!fieldError("placa"))}`}
          />
          <FormFieldError message={fieldError("placa")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <select
            id="status"
            name="status"
            value={val("status", "DISPONIVEL")}
            onChange={(e) => syncForm(e.currentTarget.form)}
            className={fieldClass(!!fieldError("status"), selectClass)}
          >
            {(Object.keys(STATUS_VEICULO_LABEL) as StatusVeiculo[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_VEICULO_LABEL[s]}
              </option>
            ))}
          </select>
          <FormFieldError message={fieldError("status")} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="apelido">Apelido</Label>
          <Input
            id="apelido"
            name="apelido"
            value={val("apelido")}
            onChange={(e) => syncForm(e.currentTarget.form)}
            placeholder="Ex.: Uno prata, Carro reserva..."
            maxLength={60}
          />
          <p className="text-xs text-muted-foreground">
            Nome interno para reconhecer o veículo na frota (opcional).
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="marca">Marca *</Label>
          <Input
            id="marca"
            name="marca"
            value={val("marca")}
            onChange={(e) => syncForm(e.currentTarget.form)}
            required
            className={fieldClass(!!fieldError("marca"))}
          />
          <FormFieldError message={fieldError("marca")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="modelo">Modelo *</Label>
          <Input
            id="modelo"
            name="modelo"
            value={val("modelo")}
            onChange={(e) => syncForm(e.currentTarget.form)}
            required
            className={fieldClass(!!fieldError("modelo"))}
          />
          <FormFieldError message={fieldError("modelo")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ano">Ano *</Label>
          <Input
            id="ano"
            name="ano"
            type="number"
            value={val("ano")}
            onChange={(e) => syncForm(e.currentTarget.form)}
            required
            className={fieldClass(!!fieldError("ano"))}
          />
          <FormFieldError message={fieldError("ano")} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="renavam">RENAVAM</Label>
          <Input
            id="renavam"
            name="renavam"
            value={val("renavam")}
            onChange={(e) => syncForm(e.currentTarget.form)}
            placeholder="Opcional — usado no contrato Plano Conquista"
          />
        </div>
      </div>

      <PorteVeiculoPicker
        defaultPorte={initial?.porte}
        defaultCor={initial?.cor}
        defaultModelo={val("modelo") || initial?.modelo}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="kmAtual">Km atual *</Label>
          <KmInput
            id="kmAtual"
            name="kmAtual"
            value={num("kmAtual", 0)}
            onValueChange={(v) =>
              setDraft((prev) => ({ ...prev, kmAtual: String(v ?? "") }))
            }
            required
            className={fieldClass(!!fieldError("kmAtual"))}
          />
          <FormFieldError message={fieldError("kmAtual")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="kmProximaRevisao">Km próxima revisão *</Label>
          <KmInput
            id="kmProximaRevisao"
            name="kmProximaRevisao"
            value={num("kmProximaRevisao")}
            onValueChange={(v) =>
              setDraft((prev) => ({
                ...prev,
                kmProximaRevisao: String(v ?? ""),
              }))
            }
            required
            className={fieldClass(!!fieldError("kmProximaRevisao"))}
          />
          <FormFieldError message={fieldError("kmProximaRevisao")} />
        </div>
      </div>

      <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
        <p className="text-sm font-medium">Aquisição do veículo</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="valorCompra">Valor de compra</Label>
            <CurrencyInput
              id="valorCompra"
              name="valorCompra"
              value={num("valorCompra")}
              onValueChange={(v) =>
                setDraft((prev) => ({ ...prev, valorCompra: String(v ?? "") }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Valor total pago na aquisição (à vista ou referência do veículo).
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dataCompra">Data da compra</Label>
            <Input
              id="dataCompra"
              name="dataCompra"
              type="date"
              value={val("dataCompra")}
              onChange={(e) => syncForm(e.currentTarget.form)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ipvaVencimento">Vencimento IPVA (anual)</Label>
        <Input
          id="ipvaVencimento"
          name="ipvaVencimento"
          type="date"
          value={val("ipvaVencimento")}
          onChange={(e) => syncForm(e.currentTarget.form)}
        />
        <p className="text-xs text-muted-foreground">
          Aparece na agenda todo ano nesta data.
        </p>
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

      <VeiculoFinanciamentoFields initial={financiamentoInitial} />

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
