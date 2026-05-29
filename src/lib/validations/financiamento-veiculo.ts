import { z } from "zod";
import {
  currencyMinZeroDefault,
  currencyPositive,
} from "@/lib/validations/currency";

const money = currencyMinZeroDefault();

export const financiamentoVeiculoSchema = z
  .object({
    instituicao: z.string().optional(),
    valorFinanciado: currencyPositive("Informe o valor financiado"),
    valorEntrada: money,
    saldoDevedor: currencyPositive("Informe o saldo devedor"),
    valorParcela: currencyPositive("Informe o valor da parcela"),
    totalParcelas: z.coerce.number().int().min(1, "Mínimo 1 parcela").max(360),
    diaVencimento: z.coerce.number().int().min(1).max(31),
    dataPrimeiraParcela: z
      .string()
      .min(1, "Data da primeira parcela obrigatória")
      .transform((v) => new Date(v + "T12:00:00")),
    observacoes: z.string().optional(),
  })
  .refine((d) => d.saldoDevedor <= d.valorFinanciado + 0.01, {
    message: "Saldo devedor não pode ser maior que o valor financiado",
    path: ["saldoDevedor"],
  });

export type FinanciamentoVeiculoFormData = z.infer<typeof financiamentoVeiculoSchema>;

export function parseFinanciamentoFromFormData(formData: FormData) {
  const emFinanciamento = formData.get("emFinanciamento") === "on";
  if (!emFinanciamento) return { emFinanciamento: false as const };

  const parsed = financiamentoVeiculoSchema.safeParse({
    instituicao: formData.get("financiamentoInstituicao") || undefined,
    valorFinanciado: formData.get("financiamentoValorFinanciado"),
    valorEntrada: formData.get("financiamentoValorEntrada") || 0,
    saldoDevedor: formData.get("financiamentoSaldoDevedor"),
    valorParcela: formData.get("financiamentoValorParcela"),
    totalParcelas: formData.get("financiamentoTotalParcelas"),
    diaVencimento: formData.get("financiamentoDiaVencimento"),
    dataPrimeiraParcela: formData.get("financiamentoDataPrimeiraParcela"),
    observacoes: formData.get("financiamentoObservacoes") || undefined,
  });

  if (!parsed.success) {
    return {
      emFinanciamento: true as const,
      error: parsed.error.issues[0]?.message ?? "Dados de financiamento inválidos",
    };
  }

  return { emFinanciamento: true as const, data: parsed.data };
}
