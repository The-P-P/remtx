import { z } from "zod";
import { parseDateInput } from "@/lib/utils";
import { currencyPositive } from "@/lib/validations/currency";

const formaPagamentoSchema = z
  .enum([
    "PIX",
    "DINHEIRO",
    "CARTAO_DEBITO",
    "CARTAO_CREDITO",
    "TRANSFERENCIA",
    "BOLETO",
    "OUTRO",
  ])
  .optional()
  .nullable();

export const transacaoSchema = z.object({
  tipo: z.enum(["ENTRADA", "SAIDA"]),
  categoriaId: z.string().min(1, "Selecione uma categoria"),
  valor: currencyPositive("Valor deve ser maior que zero"),
  descricao: z.string().min(2, "Descrição muito curta").max(500),
  data: z.union([z.string(), z.date()]).transform(parseDateInput),
  formaPagamento: z
    .union([formaPagamentoSchema, z.literal("")])
    .transform((v) => (v === "" || v == null ? null : v)),
});

export const categoriaSchema = z.object({
  nome: z.string().min(2, "Nome muito curto").max(80),
  tipo: z.enum(["ENTRADA", "SAIDA"]),
  ativo: z
    .union([z.literal("on"), z.literal("true"), z.literal("false"), z.boolean()])
    .optional()
    .transform((v) => v === "on" || v === "true" || v === true),
});
