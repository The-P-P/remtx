"use client";

import { useMemo } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KmInput } from "@/components/ui/km-input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormActionsRow } from "@/components/shared/form-actions-row";
import {
  FormErrorBanner,
  FormFieldError,
} from "@/components/shared/form-field-error";
import { formatCurrency } from "@/lib/utils";
import { useFormDraft } from "@/hooks/use-form-draft";
import type { FormAction, FormState } from "@/types/form";

const selectClass =
  "flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type VeiculoOption = {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  kmAtual: number;
  status: string;
};

type ClienteOption = {
  id: string;
  nome: string;
  cpf: string;
};

export function LocacaoForm({
  action,
  veiculos,
  clientes,
  veiculoIdPreselect,
  clienteIdPreselect,
  cancelHref = "/clientes/contratos",
  retornoCliente = false,
  clienteIdFixo,
}: {
  action: FormAction;
  veiculos: VeiculoOption[];
  clientes: ClienteOption[];
  veiculoIdPreselect?: string;
  clienteIdPreselect?: string;
  cancelHref?: string;
  retornoCliente?: boolean;
  clienteIdFixo?: string;
}) {
  const hoje = format(new Date(), "yyyy-MM-dd");
  const defaults = useMemo(
    () => ({
      clienteId: clienteIdFixo ?? clienteIdPreselect ?? "",
      veiculoId: veiculoIdPreselect ?? "",
      dataInicio: hoje,
      modeloContrato: "PADRAO",
      planoConquistaMeses: "24",
      cobrarCaucao: "on",
    }),
    [clienteIdFixo, clienteIdPreselect, veiculoIdPreselect, hoje]
  );

  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    { success: true }
  );

  const { val, num, isChecked, fieldError, fieldClass, capture, setDraft } =
    useFormDraft(state, defaults);

  const modeloContrato = (val("modeloContrato", "PADRAO") ||
    "PADRAO") as "PADRAO" | "PLANO_CONQUISTA";
  const isPlano = modeloContrato === "PLANO_CONQUISTA";
  const veiculoId = val("veiculoId");
  const valorSemanal = num("valorDiaria") ?? 0;
  const cobrarCaucao = isChecked("cobrarCaucao", true);
  const prazoIndeterminado = isChecked("prazoIndeterminado", false);
  const planoMeses = num("planoConquistaMeses", 24) ?? 24;

  const veiculoSel = useMemo(
    () => veiculos.find((v) => v.id === veiculoId),
    [veiculos, veiculoId]
  );

  const veiculosDisponiveis = veiculos.filter(
    (v) => v.status === "DISPONIVEL" || v.id === veiculoIdPreselect
  );

  const kmDefault =
    num("kmInicio") ??
    veiculoSel?.kmAtual ??
    veiculos.find((v) => v.id === veiculoId)?.kmAtual ??
    0;

  const syncForm = (form: HTMLFormElement | null) => {
    if (form) capture(form);
  };

  return (
    <form
      action={formAction}
      onSubmit={(e) => capture(e.currentTarget)}
      className="w-full max-w-xl space-y-4"
    >
      {retornoCliente && (
        <input type="hidden" name="retornoCliente" value="sim" />
      )}
      {state.success === false && (
        <FormErrorBanner
          error={state.error}
          fieldErrors={state.fieldErrors}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="clienteId">Cliente *</Label>
          {clienteIdFixo ? (
            <>
              <input type="hidden" name="clienteId" value={clienteIdFixo} />
              <p className="rounded-lg border bg-muted/40 px-3 py-2 text-sm font-medium">
                {clientes.find((c) => c.id === clienteIdFixo)?.nome ??
                  "Cliente selecionado"}
              </p>
            </>
          ) : (
            <>
              <select
                id="clienteId"
                name="clienteId"
                value={val("clienteId")}
                onChange={(e) => syncForm(e.currentTarget.form)}
                required
                className={fieldClass(!!fieldError("clienteId"), selectClass)}
              >
                <option value="">Selecione...</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
              <FormFieldError message={fieldError("clienteId")} />
              <p className="text-xs text-muted-foreground">
                <Link href="/clientes/novo" className="underline">
                  Cadastrar novo cliente
                </Link>
              </p>
            </>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="modeloContrato">Modelo de contrato *</Label>
          <select
            id="modeloContrato"
            name="modeloContrato"
            className={selectClass}
            value={modeloContrato}
            onChange={(e) => syncForm(e.currentTarget.form)}
          >
            <option value="PADRAO">Contrato Padrão (locação semanal)</option>
            <option value="PLANO_CONQUISTA">
              Contrato de Plano Conquista (mensal — transferência do veículo)
            </option>
          </select>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="veiculoId">Veículo *</Label>
          <select
            id="veiculoId"
            name="veiculoId"
            required
            value={veiculoId}
            onChange={(e) => syncForm(e.currentTarget.form)}
            className={fieldClass(!!fieldError("veiculoId"), selectClass)}
          >
            <option value="">Selecione...</option>
            {veiculosDisponiveis.map((v) => (
              <option key={v.id} value={v.id}>
                {v.placa} — {v.marca} {v.modelo} ({v.kmAtual} km)
              </option>
            ))}
          </select>
          <FormFieldError message={fieldError("veiculoId")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dataInicio">Data de retirada *</Label>
          <Input
            id="dataInicio"
            name="dataInicio"
            type="date"
            value={val("dataInicio", hoje)}
            onChange={(e) => syncForm(e.currentTarget.form)}
            required
            className={fieldClass(!!fieldError("dataInicio"))}
          />
          <FormFieldError message={fieldError("dataInicio")} />
          <p className="text-xs text-muted-foreground">
            {isPlano
              ? "Vencimento mensal no dia 5 de cada mês."
              : "O pagamento semanal será sempre neste dia da semana (ex.: toda quarta)."}
          </p>
        </div>
        {!isPlano && (
          <div className="space-y-2">
            <Label htmlFor="dataFimPrevista">Devolução prevista</Label>
            <Input
              id="dataFimPrevista"
              name="dataFimPrevista"
              type="date"
              value={val("dataFimPrevista")}
              onChange={(e) => syncForm(e.currentTarget.form)}
              disabled={prazoIndeterminado}
              className={fieldClass(
                !!fieldError("dataFimPrevista"),
                prazoIndeterminado ? "opacity-50" : undefined
              )}
            />
            <FormFieldError message={fieldError("dataFimPrevista")} />
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                name="prazoIndeterminado"
                className="size-4 rounded"
                checked={prazoIndeterminado}
                onChange={(e) => syncForm(e.currentTarget.form)}
              />
              Prazo indeterminado (sem data de devolução)
            </label>
          </div>
        )}
        {isPlano && (
          <div className="space-y-2">
            <Label htmlFor="planoConquistaMeses">Duração do plano (meses)</Label>
            <Input
              id="planoConquistaMeses"
              name="planoConquistaMeses"
              type="number"
              min={1}
              max={120}
              value={planoMeses}
              onChange={(e) => syncForm(e.currentTarget.form)}
              className={fieldClass(!!fieldError("planoConquistaMeses"))}
            />
            <FormFieldError message={fieldError("planoConquistaMeses")} />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="kmInicio">Km retirada *</Label>
          <KmInput
            id="kmInicio"
            name="kmInicio"
            value={kmDefault}
            onValueChange={(v) =>
              setDraft((prev) => ({ ...prev, kmInicio: String(v ?? "") }))
            }
            required
            className={fieldClass(!!fieldError("kmInicio"))}
          />
          <FormFieldError message={fieldError("kmInicio")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="valorDiaria">
            {isPlano ? "Valor mensal *" : "Valor semanal *"}
          </Label>
          <CurrencyInput
            id="valorDiaria"
            name="valorDiaria"
            required
            value={num("valorDiaria")}
            onValueChange={(v) =>
              setDraft((prev) => ({ ...prev, valorDiaria: String(v ?? "") }))
            }
            className={fieldClass(!!fieldError("valorDiaria"))}
          />
          <FormFieldError message={fieldError("valorDiaria")} />
        </div>
        {isPlano && (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="planoConquistaValorAdesao">Valor da adesão/caução</Label>
            <CurrencyInput
              id="planoConquistaValorAdesao"
              name="planoConquistaValorAdesao"
              value={num("planoConquistaValorAdesao")}
              onValueChange={(v) =>
                setDraft((prev) => ({
                  ...prev,
                  planoConquistaValorAdesao: String(v ?? ""),
                }))
              }
              className={fieldClass(!!fieldError("planoConquistaValorAdesao"))}
            />
            <FormFieldError message={fieldError("planoConquistaValorAdesao")} />
            <p className="text-xs text-muted-foreground">
              Valor de entrada do Plano Conquista (ex.: R$ 10.000 em parcelas).
            </p>
          </div>
        )}
      </div>

      {!isPlano && (
        <div className="rounded-lg border bg-sky-500/10 border-sky-500/30 p-4 space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="cobrarCaucao"
              className="size-4 rounded"
              checked={cobrarCaucao}
              onChange={(e) => syncForm(e.currentTarget.form)}
            />
            Cobrar caução na retirada (igual ao valor de 1 semana)
          </label>
          {!cobrarCaucao && (
            <input type="hidden" name="cobrarCaucao" value="off" />
          )}
          <p className="text-sm text-muted-foreground">
            Na retirada do veículo o cliente paga a <strong>1ª semana</strong>
            {cobrarCaucao && valorSemanal > 0 ? (
              <>
                {" "}
                + <strong>caução</strong> (depósito reembolsável):
              </>
            ) : (
              "."
            )}
          </p>
          {cobrarCaucao && valorSemanal > 0 && (
            <p className="text-lg font-bold tabular-nums text-sky-900 dark:text-sky-200">
              Total na retirada: {formatCurrency(valorSemanal * 2)}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({formatCurrency(valorSemanal)} semana +{" "}
                {formatCurrency(valorSemanal)} caução)
              </span>
            </p>
          )}
        </div>
      )}

      {isPlano && (
        <p className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm">
          O contrato <strong>Plano Conquista</strong> será gerado automaticamente em PDF.
          Após {planoMeses} meses de pagamentos em dia, o locatário pode receber a
          transferência do veículo (conforme cláusulas do modelo). Adesão sugerida em 3
          parcelas: 50% na retirada, 25% no 2º e 3º mês.
        </p>
      )}

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="iniciarAgora"
          className="size-4 rounded"
          checked={isChecked("iniciarAgora", false)}
          onChange={(e) => syncForm(e.currentTarget.form)}
        />
        Retirada imediata (ativa agora — veículo fica alugado)
      </label>

      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          name="observacoes"
          rows={3}
          value={val("observacoes")}
          onChange={(e) => syncForm(e.currentTarget.form)}
        />
      </div>

      <FormActionsRow>
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Salvando..." : "Criar locação"}
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
