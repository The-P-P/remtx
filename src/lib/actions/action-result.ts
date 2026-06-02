/** Resultado padronizado de actions com erros por campo. */
export type ActionResult<T = void> =
  | { success: true; data?: T }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string>;
    };
