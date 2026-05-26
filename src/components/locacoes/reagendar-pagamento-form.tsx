"use client";

import { useMemo, useState } from "react";
import { format, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  calcularJurosParcela,
  valorTotalParcela,
} from "@/lib/juros-parcela";
import { formatCurrency } from "@/lib/utils";

type Props = {
  valorBase: number;
  /** Dia fixo do contrato nesta semana (vencimento original). */
  vencimentoContrato: string;
  diaSemanaContrato?: string;
  /** Data exibida na agenda (pode já estar reagendada). */
  dataPagamentoAtual: string;
  defaultNovaData: string;
  disabled?: boolean;
  onSubmit: (formData: FormData) => void;
};

function parseDia(iso: string) {
  return startOfDay(new Date(iso));
}

export function ReagendarPagamentoForm({
  valorBase,
  vencimentoContrato,
  diaSemanaContrato,
  dataPagamentoAtual,
  defaultNovaData,
  disabled,
  onSubmit,
}: Props) {
  const [novaData, setNovaData] = useState(defaultNovaData);
  const [aplicarJuros, setAplicarJuros] = useState(true);

  const vencimentoOriginal = useMemo(
    () => parseDia(vencimentoContrato),
    [vencimentoContrato]
  );

  const preview = useMemo(() => {
    if (!novaData) {
      return { dias: 0, juros: 0, total: valorBase };
    }
    const dataPagamento = parseDia(novaData + "T12:00:00");
    if (!aplicarJuros) {
      return { dias: 0, juros: 0, total: valorBase };
    }
    const { diasAtraso, valorJuros } = calcularJurosParcela(
      valorBase,
      vencimentoOriginal,
      dataPagamento,
      false
    );
    return {
      dias: diasAtraso,
      juros: valorJuros,
      total: valorTotalParcela(valorBase, valorJuros),
    };
  }, [novaData, aplicarJuros, valorBase, vencimentoOriginal]);

  const labelDiaContrato =
    diaSemanaContrato ??
    format(vencimentoOriginal, "EEEE", { locale: ptBR });

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        if (aplicarJuros) fd.set("aplicarJuros", "true");
        else fd.delete("aplicarJuros");
        onSubmit(fd);
      }}
    >
      <div className="rounded-md border bg-muted/40 p-3 text-sm space-y-1">
        <p>
          <span className="text-muted-foreground">Contrato (demais semanas):</span>{" "}
          toda <strong className="capitalize">{labelDiaContrato}</strong>
        </p>
        <p>
          <span className="text-muted-foreground">Vencimento desta semana:</span>{" "}
          <strong>
            {format(vencimentoOriginal, "dd/MM/yyyy", { locale: ptBR })}
          </strong>
        </p>
        {dataPagamentoAtual !== vencimentoContrato && (
          <p className="text-amber-800 dark:text-amber-200">
            Pagamento combinado para{" "}
            {format(parseDia(dataPagamentoAtual), "dd/MM/yyyy", {
              locale: ptBR,
            })}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="novaData">Nova data de pagamento</Label>
        <Input
          id="novaData"
          name="novaData"
          type="date"
          required
          value={novaData}
          onChange={(e) => setNovaData(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Só esta parcela muda de dia. As próximas semanas continuam no dia do
          contrato ({labelDiaContrato}).
        </p>
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={aplicarJuros}
          onChange={(e) => setAplicarJuros(e.target.checked)}
          className="mt-0.5 size-4 rounded"
        />
        <span>
          Aplicar juros de atraso (5% do valor semanal por dia, do vencimento
          do contrato até a nova data escolhida)
        </span>
      </label>

      <div className="rounded-md border p-3 text-sm space-y-1">
        <p>
          Valor semanal: <strong>{formatCurrency(valorBase)}</strong>
        </p>
        {aplicarJuros && preview.dias > 0 && (
          <p className="text-amber-800 dark:text-amber-200">
            Juros ({preview.dias} dia(s)):{" "}
            <strong>{formatCurrency(preview.juros)}</strong>
          </p>
        )}
        <p className="text-base">
          Total a pagar: <strong>{formatCurrency(preview.total)}</strong>
        </p>
      </div>

      <Button type="submit" disabled={disabled} className="w-full">
        Reagendar pagamento
      </Button>
    </form>
  );
}
