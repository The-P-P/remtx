import { z } from "zod";
import { parseCurrencyInput, parseDateInput } from "@/lib/utils";

const tiposManuais = [
  "ENTREGA_VEICULO",
  "RETIRADA_VEICULO",
  "OFICINA_SERVICO",
  "MANUTENCAO_AGENDADA",
  "LEMBRETE",
  "IPVA",
  "FINANCEIRO",
] as const;

export const eventoAgendaSchema = z.object({
  titulo: z.string().min(2, "Título obrigatório"),
  descricao: z.string().optional(),
  dataInicio: z.union([z.string(), z.date()]).transform((v) => parseDateInput(v)),
  dataFim: z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? parseDateInput(v) : undefined)),
  tipo: z.enum(tiposManuais),
  valor: z
    .string()
    .optional()
    .transform((v) => {
      if (!v || v.length === 0) return undefined;
      const parsed = parseCurrencyInput(v);
      return Number.isNaN(parsed) ? undefined : parsed;
    }),
  veiculoId: z.string().optional(),
  clienteId: z.string().optional(),
  locacaoId: z.string().optional(),
});

export type EventoAgendaFormData = z.infer<typeof eventoAgendaSchema>;
