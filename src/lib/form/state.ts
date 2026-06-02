import type { ZodError } from "zod";
import type { FormState } from "@/types/form";

export function serializeFormData(formData: FormData): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") fields[key] = value;
  }
  return fields;
}

export function zodFieldErrors(error: ZodError): Record<string, string> {
  const map: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_form");
    if (!map[key]) map[key] = issue.message;
  }
  return map;
}

export function failFormState(
  error: string,
  formData: FormData,
  fieldErrors?: Record<string, string>
): FormState {
  return {
    success: false,
    error,
    fields: serializeFormData(formData),
    fieldErrors,
  };
}
