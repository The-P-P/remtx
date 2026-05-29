import { clsx, type ClassValue } from "clsx";
import { startOfDay } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function numberToCurrencyDigits(value: number): string {
  return String(Math.round(value * 100));
}

export function parseCurrencyInputFromDigits(digits: string): number {
  if (!digits) return 0;
  return parseInt(digits, 10) / 100;
}

export function formatCurrencyInputFromDigits(digits: string): string {
  if (!digits) return "";
  return formatCurrency(parseCurrencyInputFromDigits(digits));
}

export function formatCurrencyInput(value: number): string {
  return formatCurrency(value);
}

/** Aceita número, "1234.56" ou "R$ 1.234,56". */
export function parseCurrencyInput(value: unknown): number {
  if (typeof value === "number" && !Number.isNaN(value)) return value;

  const str = String(value ?? "").trim();
  if (!str) return NaN;

  if (/^\d+(\.\d+)?$/.test(str)) return Number(str);

  const digits = str.replace(/\D/g, "");
  if (!digits) return NaN;

  return parseInt(digits, 10) / 100;
}

export function formatKm(km: number): string {
  return `${km.toLocaleString("pt-BR")} km`;
}

export function formatKmInput(value: number): string {
  return formatKm(value);
}

export function formatKmInputFromDigits(digits: string): string {
  if (!digits) return "";
  return formatKm(parseKmInputFromDigits(digits));
}

export function parseKmInputFromDigits(digits: string): number {
  if (!digits) return 0;
  return parseInt(digits, 10);
}

/** Aceita número ou texto formatado como "48.500 km". */
export function parseKmInput(value: unknown): number {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return Math.trunc(value);
  }

  const str = String(value ?? "").trim();
  if (!str) return NaN;

  if (/^\d+$/.test(str)) return parseInt(str, 10);

  const digits = str.replace(/\D/g, "");
  if (!digits) return NaN;

  return parseInt(digits, 10);
}

/** Corrige backspace em campos mascarados (pontos, sufixo " km", etc.). */
export function resolveDigitsAfterMaskedInput(
  previousDigits: string,
  rawValue: string,
  previousDisplay: string
): string {
  const nextDigits = rawValue.replace(/\D/g, "");

  if (nextDigits.length < previousDigits.length) {
    return nextDigits;
  }

  if (
    nextDigits.length === previousDigits.length &&
    rawValue.length < previousDisplay.length
  ) {
    return previousDigits.slice(0, -1);
  }

  return nextDigits;
}

/** Interpreta yyyy-MM-dd (ou Date) como data local, sem deslocar um dia por UTC. */
export function parseDateInput(value: string | Date): Date {
  if (value instanceof Date) {
    return startOfDay(value);
  }

  const trimmed = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return startOfDay(new Date(`${trimmed}T12:00:00`));
  }

  return startOfDay(new Date(trimmed));
}
