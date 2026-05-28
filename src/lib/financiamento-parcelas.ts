import { addMonths, getDaysInMonth, setDate, startOfDay } from "date-fns";

export type ParcelaFinanciamentoGerada = {
  numero: number;
  valor: number;
  dataVencimento: Date;
};

/** Gera parcelas mensais com vencimento no dia informado. */
export function gerarParcelasFinanciamento(input: {
  totalParcelas: number;
  valorParcela: number;
  saldoDevedor: number;
  dataPrimeiraParcela: Date;
  diaVencimento: number;
}): ParcelaFinanciamentoGerada[] {
  const parcelas: ParcelaFinanciamentoGerada[] = [];
  let saldoRestante = input.saldoDevedor;

  for (let n = 1; n <= input.totalParcelas; n++) {
    const base = addMonths(startOfDay(input.dataPrimeiraParcela), n - 1);
    const maxDia = getDaysInMonth(base);
    const dataVencimento = setDate(base, Math.min(input.diaVencimento, maxDia));

    const valor =
      n === input.totalParcelas
        ? Math.round(saldoRestante * 100) / 100
        : input.valorParcela;

    saldoRestante = Math.round((saldoRestante - valor) * 100) / 100;

    parcelas.push({ numero: n, valor, dataVencimento });
  }

  return parcelas;
}

export function resumoFinanciamento(parcelas: { dataPagamento: Date | null }[]) {
  const pagas = parcelas.filter((p) => p.dataPagamento).length;
  const total = parcelas.length;
  return {
    parcelasPagas: pagas,
    parcelasRestantes: total - pagas,
    quitado: total > 0 && pagas >= total,
  };
}
