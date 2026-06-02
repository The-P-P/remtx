import { z } from "zod";
import { cpfSchema } from "@/lib/validations/common";
import { onlyDigits, telefoneParaArmazenamento } from "@/lib/format/br";

export const clienteSchema = z.object({
  nome: z.string().min(2, "Nome obrigatório"),
  cpf: cpfSchema,
  telefone: z
    .string()
    .min(8, "Telefone obrigatório")
    .transform((v) => telefoneParaArmazenamento(v))
    .refine((v) => {
      const d = onlyDigits(v);
      return d.length >= 12 && d.length <= 13;
    }, "Telefone incompleto (use DDD + número)"),
  email: z
    .string()
    .email("E-mail inválido")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  endereco: z.string().optional(),
  rg: z.string().optional(),
  rgOrgao: z.string().optional(),
  observacoes: z.string().optional(),
});

export type ClienteFormData = z.infer<typeof clienteSchema>;
