import { z } from "zod";

export const eventoAgendaSchema = z.object({
  titulo: z.string().min(2, "Título obrigatório"),
  descricao: z.string().optional(),
  dataInicio: z.coerce.date({ message: "Data inválida" }),
  dataFim: z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? new Date(v) : undefined)),
  tipo: z.enum([
    "PAGAMENTO_CLIENTE",
    "MANUTENCAO_AGENDADA",
    "IPVA",
    "LEMBRETE",
    "FINANCEIRO",
  ]),
  valor: z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? Number(v) : undefined)),
  veiculoId: z.string().optional(),
  clienteId: z.string().optional(),
  locacaoId: z.string().optional(),
});

export type EventoAgendaFormData = z.infer<typeof eventoAgendaSchema>;
