import { z } from "zod";
import {
  currencyPositive,
} from "@/lib/validations/currency";
import { kmMinZero } from "@/lib/validations/km";

const dateField = z.coerce.date({ message: "Data inválida" });

const prazoIndeterminadoField = z
  .string()
  .optional()
  .transform((v) => v === "on" || v === "true");

const dataFimPrevistaOpcional = z
  .string()
  .optional()
  .transform((v) =>
    v && v.length > 0 ? new Date(v + "T12:00:00") : undefined
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
  })
  .superRefine((d, ctx) => {
    if (!d.prazoIndeterminado && !d.dataFimPrevista) {
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
  .transform((d) => ({
    ...d,
    dataFimPrevista: d.prazoIndeterminado ? null : (d.dataFimPrevista ?? null),
  }));

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
