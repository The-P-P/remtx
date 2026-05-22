import { z } from "zod";

export const tipoManutencaoSchema = z.object({
  nome: z.string().min(2, "Nome obrigatório"),
  descricao: z.string().optional(),
  intervaloKm: z.coerce.number().int().positive("Intervalo em km obrigatório"),
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
  dataRealizada: z.coerce.date(),
  kmRealizada: z.coerce.number().int().min(0),
  custo: z.coerce.number().min(0).optional(),
  observacoes: z.string().optional(),
  pecasExtras: z
    .array(
      z.object({
        nome: z.string().min(1),
        quantidade: z.coerce.number().int().positive().default(1),
        valorUnitario: z.coerce.number().min(0).optional(),
      })
    )
    .default([]),
});

export type ManutencaoFormData = z.infer<typeof manutencaoSchema>;
