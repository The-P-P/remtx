import { z } from "zod";
import { parseCurrencyInput } from "@/lib/utils";

function preprocessCurrency(value: unknown): unknown {
  if (value === "" || value == null) return undefined;
  const parsed = parseCurrencyInput(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export const currencyPositive = (message = "Valor deve ser maior que zero") =>
  z.preprocess(
    preprocessCurrency,
    z.number({ error: message }).positive(message)
  );

export const currencyMinZero = (message = "Valor inválido") =>
  z.preprocess((value) => {
    if (value === "" || value == null) return undefined;
    const parsed = parseCurrencyInput(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }, z.number({ error: message }).min(0, message).optional());

export const currencyMinZeroDefault = (message = "Valor inválido") =>
  z.preprocess((value) => {
    if (value === "" || value == null) return 0;
    const parsed = parseCurrencyInput(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }, z.number({ error: message }).min(0, message));
