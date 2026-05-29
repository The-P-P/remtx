import { z } from "zod";
import { parseDateInput } from "@/lib/utils";
import { currencyMinZero } from "@/lib/validations/currency";
import { kmMinZero, kmMinZeroOptional, kmPositive } from "@/lib/validations/km";

const dataRealizadaField = z
  .union([z.string(), z.date()])
  .transform(parseDateInput);

export const tipoManutencaoSchema = z.object({
  nome: z.string().min(2, "Nome obrigatório"),
  descricao: z.string().optional(),
  intervaloKm: kmPositive("Intervalo em km obrigatório"),
  pecas: z
    .array(
      z.object({
        nome: z.string().min(1),
        quantidade: z.coerce.number().int().positive().default(1),
      })
    )
    .default([]),
});

export type TipoManutencaoFormData = z.infer<typeof tipoManutencaoSchema>;

export const manutencaoSchema = z.object({
  veiculoId: z.string().min(1),
  tipoManutencaoId: z.string().min(1),
  dataRealizada: dataRealizadaField,
  kmRealizada: kmMinZero(),
  custo: currencyMinZero(),
  observacoes: z.string().optional(),
  pecasExtras: z
    .array(
      z.object({
        nome: z.string().min(1),
        quantidade: z.coerce.number().int().positive().default(1),
        valorUnitario: currencyMinZero(),
      })
    )
    .default([]),
});

export type ManutencaoFormData = z.infer<typeof manutencaoSchema>;

const pecaManutencaoSchema = z.object({
  nome: z.string().min(1, "Nome da peça obrigatório"),
  quantidade: z.coerce.number().int().positive().default(1),
  valorUnitario: currencyMinZero(),
});

export const manutencaoUpdateSchema = z.object({
  veiculoId: z.string().min(1),
  tipoManutencaoId: z.string().min(1),
  dataRealizada: dataRealizadaField,
  kmRealizada: kmMinZero(),
  kmProxima: kmMinZeroOptional(),
  custo: currencyMinZero(),
  observacoes: z.string().optional(),
  pecas: z.array(pecaManutencaoSchema).min(1, "Informe ao menos uma peça"),
});

export type ManutencaoUpdateFormData = z.infer<typeof manutencaoUpdateSchema>;
