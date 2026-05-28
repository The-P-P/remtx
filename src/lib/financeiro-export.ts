import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FORMA_PAGAMENTO_LABEL } from "@/lib/constants/enums";
import type { FormaPagamento, TipoTransacao } from "@/types/prisma";

export type TransacaoExportRow = {
  data: Date;
  tipo: TipoTransacao;
  categoria: string;
  descricao: string;
  valor: number;
  formaPagamento: FormaPagamento | null;
  origem: string;
};

function escapeCsv(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function transacoesParaCsv(rows: TransacaoExportRow[]) {
  const header = [
    "Data",
    "Tipo",
    "Categoria",
    "Descrição",
    "Valor",
    "Forma de pagamento",
    "Origem",
  ];
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        format(r.data, "dd/MM/yyyy", { locale: ptBR }),
        r.tipo === "ENTRADA" ? "Entrada" : "Saída",
        escapeCsv(r.categoria),
        escapeCsv(r.descricao),
        r.valor.toFixed(2).replace(".", ","),
        r.formaPagamento ? FORMA_PAGAMENTO_LABEL[r.formaPagamento] : "",
        escapeCsv(r.origem),
      ].join(",")
    ),
  ];
  return "\uFEFF" + lines.join("\r\n");
}

export function labelOrigemTransacao(t: {
  parcelaId: string | null;
  manutencaoId: string | null;
  locacaoId: string | null;
  parcelaFinanciamentoId?: string | null;
}) {
  if (t.parcelaId) return "Locação (parcela)";
  if (t.parcelaFinanciamentoId) return "Financiamento (parcela)";
  if (t.manutencaoId) return "Manutenção";
  if (t.locacaoId) return "Locação (contrato)";
  return "Manual";
}
