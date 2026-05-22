export type FormState =
  | { success: true }
  | { success: false; error: string };

export type FormAction = (
  state: FormState,
  formData: FormData
) => Promise<FormState>;
