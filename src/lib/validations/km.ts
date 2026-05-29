import { z } from "zod";
import { parseKmInput } from "@/lib/utils";

function preprocessKm(value: unknown): unknown {
  if (value === "" || value == null) return undefined;
  const parsed = parseKmInput(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export const kmMinZero = (message = "Km inválido") =>
  z.preprocess(
    preprocessKm,
    z.number({ error: message }).int(message).min(0, message)
  );

export const kmPositive = (message = "Km inválido") =>
  z.preprocess(
    preprocessKm,
    z.number({ error: message }).int(message).positive(message)
  );

export const kmMinZeroOptional = (message = "Km inválido") =>
  z.preprocess(
    preprocessKm,
    z.number({ error: message }).int(message).min(0, message).optional()
  );
