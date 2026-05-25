import { z } from "zod";
import { cpfSchema } from "@/lib/validations/common";

export const clienteSchema = z.object({
  nome: z.string().min(2, "Nome obrigatório"),
  cpf: cpfSchema,
  telefone: z.string().min(8, "Telefone obrigatório"),
  email: z
    .string()
    .email("E-mail inválido")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  endereco: z.string().optional(),
  observacoes: z.string().optional(),
});

export type ClienteFormData = z.infer<typeof clienteSchema>;
