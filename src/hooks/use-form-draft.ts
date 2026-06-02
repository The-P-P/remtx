"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormState } from "@/types/form";

/** Mantém valores do formulário após erro de validação (não apaga o que foi preenchido). */
export function useFormDraft(
  state: FormState,
  defaults: Record<string, string> = {}
) {
  const [draft, setDraft] = useState(defaults);

  useEffect(() => {
    if (state.success === false && state.fields) {
      setDraft((prev) => ({ ...defaults, ...prev, ...state.fields }));
    }
  }, [state, defaults]);

  const capture = useCallback((form: HTMLFormElement) => {
    const fd = new FormData(form);
    const next: Record<string, string> = {};
    fd.forEach((v, k) => {
      if (typeof v === "string") next[k] = v;
    });
    form
      .querySelectorAll<HTMLInputElement>('input[type="checkbox"][name]')
      .forEach((el) => {
        next[el.name] = el.checked ? "on" : "off";
      });
    setDraft((prev) => ({ ...prev, ...next }));
  }, []);

  function val(name: string, fallback = "") {
    return draft[name] ?? defaults[name] ?? fallback;
  }

  function num(name: string, fallback?: number) {
    const raw = draft[name] ?? defaults[name];
    if (raw == null || raw === "") return fallback;
    const n = Number(raw);
    return Number.isNaN(n) ? fallback : n;
  }

  function isChecked(name: string, defaultChecked = false) {
    const v = draft[name];
    if (v == null || v === "") return defaultChecked;
    return v === "on" || v === "true";
  }

  function fieldError(name: string): string | undefined {
    if (state.success === false) return state.fieldErrors?.[name];
    return undefined;
  }

  function fieldClass(hasError: boolean, base = "") {
    return hasError
      ? `${base} border-red-500 ring-1 ring-red-500/40`.trim()
      : base;
  }

  return {
    val,
    num,
    isChecked,
    fieldError,
    fieldClass,
    capture,
    draft,
    setDraft,
  };
}
