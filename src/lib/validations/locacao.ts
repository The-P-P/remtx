import { z } from "zod";

const dateField = z.coerce.date({ message: "Data inválida" });

export const locacaoCreateSchema = z
  .object({
    veiculoId: z.string().min(1, "Selecione o veículo"),
    clienteId: z.string().min(1, "Selecione o cliente"),
    dataInicio: dateField,
    dataFimPrevista: dateField,
    kmInicio: z.coerce.number().int().min(0, "Km inválido"),
    valorDiaria: z.coerce.number().positive("Valor semanal inválido"),
    status: z.enum(["RESERVADA", "ATIVA"]).default("RESERVADA"),
    observacoes: z.string().optional(),
    iniciarAgora: z
      .string()
      .optional()
      .transform((v) => v === "on" || v === "true"),
  })
  .refine((d) => d.dataFimPrevista >= d.dataInicio, {
    message: "Data de devolução deve ser igual ou posterior ao início",
    path: ["dataFimPrevista"],
  });

export const locacaoUpdateSchema = z.object({
  dataFimPrevista: dateField,
  valorDiaria: z.coerce.number().positive("Valor semanal inválido"),
  observacoes: z.string().optional(),
});

export const locacaoFinalizarSchema = z.object({
  kmFim: z.coerce.number().int().min(0, "Km inválido"),
  dataFimReal: dateField,
  registrarFinanceiro: z
    .string()
    .optional()
    .transform((v) => v === "on" || v === "true"),
});

export const parcelaSchema = z.object({
  locacaoId: z.string().min(1),
  valor: z.coerce.number().positive("Valor inválido"),
  dataVencimento: dateField,
  observacoes: z.string().optional(),
});

export type LocacaoCreateFormData = z.infer<typeof locacaoCreateSchema>;
export type LocacaoFinalizarFormData = z.infer<typeof locacaoFinalizarSchema>;
