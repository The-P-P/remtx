import { z } from "zod";
import {
  currencyPositive,
} from "@/lib/validations/currency";
import { kmMinZero } from "@/lib/validations/km";
import { parseCurrencyInput, parseDateInput } from "@/lib/utils";

const dateField = z
  .union([z.string(), z.date()])
  .transform((v) => parseDateInput(v));

const prazoIndeterminadoField = z
  .string()
  .optional()
  .transform((v) => v === "on" || v === "true");

const dataFimPrevistaOpcional = z
  .string()
  .optional()
  .transform((v) =>
    v && v.length > 0 ? parseDateInput(v) : undefined
  );

export const locacaoCreateSchema = z
  .object({
    veiculoId: z.string().min(1, "Selecione o veículo"),
    clienteId: z.string().min(1, "Selecione o cliente"),
    dataInicio: dateField,
    dataFimPrevista: dataFimPrevistaOpcional,
    prazoIndeterminado: prazoIndeterminadoField,
    kmInicio: kmMinZero("Km inválido"),
    valorDiaria: currencyPositive("Valor semanal inválido"),
    status: z.enum(["RESERVADA", "ATIVA"]).default("RESERVADA"),
    observacoes: z.string().optional(),
    iniciarAgora: z
      .string()
      .optional()
      .transform((v) => v === "on" || v === "true"),
    cobrarCaucao: z
      .string()
      .optional()
      .transform((v) => v === "on" || v === "true"),
    modeloContrato: z
      .enum(["PADRAO", "PLANO_CONQUISTA"])
      .default("PADRAO"),
    planoConquistaMeses: z
      .string()
      .optional()
      .transform((v) => (v && v.length > 0 ? Number(v) : undefined)),
    planoConquistaValorAdesao: z
      .string()
      .optional()
      .transform((v) => {
        if (!v?.length) return undefined;
        const n = parseCurrencyInput(v);
        return n > 0 ? n : undefined;
      }),
  })
  .superRefine((d, ctx) => {
    if (d.modeloContrato === "PLANO_CONQUISTA") {
      const meses = d.planoConquistaMeses ?? 24;
      if (meses < 1 || meses > 120) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Prazo do plano deve ser entre 1 e 120 meses",
          path: ["planoConquistaMeses"],
        });
      }
    }
    if (
      d.modeloContrato !== "PLANO_CONQUISTA" &&
      !d.prazoIndeterminado &&
      !d.dataFimPrevista
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Informe a devolução prevista ou marque prazo indeterminado",
        path: ["dataFimPrevista"],
      });
    }
    if (
      !d.prazoIndeterminado &&
      d.dataFimPrevista &&
      d.dataFimPrevista < d.dataInicio
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Data de devolução deve ser igual ou posterior ao início",
        path: ["dataFimPrevista"],
      });
    }
  })
  .transform((d) => {
    const isPlano = d.modeloContrato === "PLANO_CONQUISTA";
    return {
      ...d,
      periodicidadePagamento: isPlano
        ? ("MENSAL" as const)
        : ("SEMANAL" as const),
      planoConquistaMeses: isPlano ? (d.planoConquistaMeses ?? 24) : null,
      planoConquistaValorAdesao: isPlano
        ? d.planoConquistaValorAdesao
        : null,
      dataFimPrevista: isPlano
        ? d.dataFimPrevista ?? null
        : d.prazoIndeterminado
          ? null
          : (d.dataFimPrevista ?? null),
    };
  });

export const locacaoUpdateSchema = z
  .object({
    dataFimPrevista: dataFimPrevistaOpcional,
    prazoIndeterminado: prazoIndeterminadoField,
    valorDiaria: currencyPositive("Valor semanal inválido"),
    observacoes: z.string().optional(),
  })
  .transform((d) => ({
    ...d,
    dataFimPrevista: d.prazoIndeterminado ? null : (d.dataFimPrevista ?? null),
  }));

export const locacaoFinalizarSchema = z.object({
  kmFim: kmMinZero("Km inválido"),
  dataFimReal: dateField,
  registrarFinanceiro: z
    .string()
    .optional()
    .transform((v) => v === "on" || v === "true"),
});

export const parcelaSchema = z.object({
  locacaoId: z.string().min(1),
  valor: currencyPositive("Valor inválido"),
  dataVencimento: dateField,
  observacoes: z.string().optional(),
});

export type LocacaoCreateFormData = z.infer<typeof locacaoCreateSchema>;
export type LocacaoFinalizarFormData = z.infer<typeof locacaoFinalizarSchema>;
