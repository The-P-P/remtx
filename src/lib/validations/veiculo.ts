import { z } from "zod";
import { kmMinZero } from "@/lib/validations/km";
import { PORTE_VEICULO_VALUES } from "@/lib/porte-veiculo";

export const veiculoSchema = z.object({
  placa: z
    .string()
    .min(7, "Placa inválida")
    .max(8)
    .transform((v) => v.toUpperCase().replace(/[^A-Z0-9]/g, "")),
  apelido: z
    .string()
    .max(60, "Apelido muito longo")
    .optional()
    .transform((v) => {
      const t = v?.trim();
      return t && t.length > 0 ? t : null;
    }),
  marca: z.string().min(2, "Marca obrigatória"),
  modelo: z.string().min(1, "Modelo obrigatório"),
  ano: z.coerce.number().int().min(1990).max(new Date().getFullYear() + 1),
  cor: z.string().optional(),
  porte: z.enum(PORTE_VEICULO_VALUES),
  kmAtual: kmMinZero(),
  kmProximaRevisao: kmMinZero(),
  status: z.enum(["DISPONIVEL", "ALUGADO", "EM_MANUTENCAO", "INATIVO"]),
  observacoes: z.string().optional(),
  ipvaVencimento: z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? new Date(v + "T12:00:00") : null)),
});

export type VeiculoFormData = z.infer<typeof veiculoSchema>;

export const problemaCronicoSchema = z.object({
  veiculoId: z.string().min(1),
  descricao: z.string().min(3, "Descrição obrigatória"),
  gravidade: z.enum(["LEVE", "MEDIA", "GRAVE"]),
});

export type ProblemaCronicoFormData = z.infer<typeof problemaCronicoSchema>;
