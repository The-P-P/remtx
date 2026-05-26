import { z } from "zod";

export const transacaoSchema = z.object({
  tipo: z.enum(["ENTRADA", "SAIDA"]),
  categoriaId: z.string().min(1, "Selecione uma categoria"),
  valor: z.coerce.number().positive("Valor deve ser maior que zero"),
  descricao: z.string().min(2, "Descrição muito curta").max(500),
  data: z.coerce.date(),
});

export const categoriaSchema = z.object({
  nome: z.string().min(2, "Nome muito curto").max(80),
  tipo: z.enum(["ENTRADA", "SAIDA"]),
  ativo: z
    .union([z.literal("on"), z.literal("true"), z.literal("false"), z.boolean()])
    .optional()
    .transform((v) => v === "on" || v === "true" || v === true),
});
