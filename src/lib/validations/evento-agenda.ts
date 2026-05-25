import { z } from "zod";

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
  dataInicio: z.coerce.date({ message: "Data inválida" }),
  dataFim: z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? new Date(v + "T12:00:00") : undefined)),
  tipo: z.enum(tiposManuais),
  valor: z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? Number(v) : undefined)),
  veiculoId: z.string().optional(),
  clienteId: z.string().optional(),
  locacaoId: z.string().optional(),
});

export type EventoAgendaFormData = z.infer<typeof eventoAgendaSchema>;
