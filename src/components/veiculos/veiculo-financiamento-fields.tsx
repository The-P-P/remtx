"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const selectClass =
  "flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export type FinanciamentoInitial = {
  instituicao?: string | null;
  valorFinanciado: number;
  valorEntrada: number;
  saldoDevedor: number;
  valorParcela: number;
  totalParcelas: number;
  diaVencimento: number;
  dataPrimeiraParcela: Date;
  observacoes?: string | null;
  temParcelasPagas?: boolean;
};

export function VeiculoFinanciamentoFields({
  initial,
}: {
  initial?: FinanciamentoInitial | null;
}) {
  const [emFinanciamento, setEmFinanciamento] = useState(!!initial);
  const somenteBasico = !!initial?.temParcelasPagas;

  const valorFinanciadoDefault = initial
    ? Number(initial.valorFinanciado)
    : undefined;
  const saldoDefault = initial ? Number(initial.saldoDevedor) : undefined;

  return (
    <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="emFinanciamento"
          checked={emFinanciamento}
          onChange={(e) => setEmFinanciamento(e.target.checked)}
          className="size-4 rounded"
        />
        Veículo em financiamento
      </label>

      {emFinanciamento && (
        <div className="space-y-4 border-t pt-4">
          {somenteBasico && (
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Já existem parcelas pagas. Só é possível alterar financeira e
              observações; valores e parcelas ficam bloqueados.
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="financiamentoInstituicao">Financeira / banco</Label>
              <Input
                id="financiamentoInstituicao"
                name="financiamentoInstituicao"
                defaultValue={initial?.instituicao ?? ""}
                placeholder="Ex.: Bradesco, BV, Santander..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="financiamentoValorFinanciado">Valor financiado *</Label>
              <CurrencyInput
                id="financiamentoValorFinanciado"
                name="financiamentoValorFinanciado"
                required={emFinanciamento}
                disabled={somenteBasico}
                defaultValue={valorFinanciadoDefault}
              />
              <p className="text-xs text-muted-foreground">
                Principal contratado (sem juros).
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="financiamentoValorEntrada">Entrada</Label>
              <CurrencyInput
                id="financiamentoValorEntrada"
                name="financiamentoValorEntrada"
                disabled={somenteBasico}
                defaultValue={initial ? Number(initial.valorEntrada) : 0}
                allowEmpty
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="financiamentoSaldoDevedor">Saldo devedor *</Label>
              <CurrencyInput
                id="financiamentoSaldoDevedor"
                name="financiamentoSaldoDevedor"
                required={emFinanciamento}
                disabled={somenteBasico}
                defaultValue={saldoDefault ?? valorFinanciadoDefault}
              />
              <p className="text-xs text-muted-foreground">
                Saldo atual a pagar — pode ser maior que o valor financiado por
                causa dos juros.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="financiamentoValorParcela">Valor da parcela *</Label>
              <CurrencyInput
                id="financiamentoValorParcela"
                name="financiamentoValorParcela"
                required={emFinanciamento}
                disabled={somenteBasico}
                defaultValue={initial ? Number(initial.valorParcela) : undefined}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="financiamentoTotalParcelas">Total de parcelas *</Label>
              <Input
                id="financiamentoTotalParcelas"
                name="financiamentoTotalParcelas"
                type="number"
                min="1"
                max="360"
                required={emFinanciamento}
                disabled={somenteBasico}
                defaultValue={initial?.totalParcelas}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="financiamentoDiaVencimento">Dia do vencimento *</Label>
              <select
                id="financiamentoDiaVencimento"
                name="financiamentoDiaVencimento"
                required={emFinanciamento}
                disabled={somenteBasico}
                defaultValue={initial?.diaVencimento ?? 10}
                className={selectClass}
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    Dia {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="financiamentoDataPrimeiraParcela">
                1ª parcela (vencimento) *
              </Label>
              <Input
                id="financiamentoDataPrimeiraParcela"
                name="financiamentoDataPrimeiraParcela"
                type="date"
                required={emFinanciamento}
                disabled={somenteBasico}
                defaultValue={
                  initial?.dataPrimeiraParcela
                    ? format(initial.dataPrimeiraParcela, "yyyy-MM-dd")
                    : ""
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="financiamentoObservacoes">Observações do financiamento</Label>
            <Textarea
              id="financiamentoObservacoes"
              name="financiamentoObservacoes"
              rows={2}
              defaultValue={initial?.observacoes ?? ""}
            />
          </div>
        </div>
      )}
    </div>
  );
}
