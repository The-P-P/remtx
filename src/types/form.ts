export type FormState =
  | { success: true }
  | {
      success: false;
      error: string;
      /** Valores enviados — repopula o formulário após erro. */
      fields?: Record<string, string>;
      /** Erro por campo (nome do input). */
      fieldErrors?: Record<string, string>;
    };

export type FormAction = (
  state: FormState,
  formData: FormData
) => Promise<FormState>;
