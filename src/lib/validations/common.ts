import { z } from "zod";

export const placaSchema = z
  .string()
  .min(7, "Placa inválida")
  .max(8)
  .transform((v) => v.toUpperCase().replace(/[^A-Z0-9]/g, ""));

export const cpfSchema = z
  .string()
  .min(11, "CPF inválido")
  .max(14)
  .transform((v) => v.replace(/\D/g, ""));
