/** Apenas dígitos. */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** Máscara CPF enquanto digita: 999.999.999-99 */
export function formatCpfInput(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/** Exibe CPF armazenado (11 dígitos ou já mascarado). */
export function formatCpfDisplay(cpf: string): string {
  const d = onlyDigits(cpf);
  if (d.length !== 11) return cpf;
  return formatCpfInput(d);
}

/** Máscara telefone BR: +55 (99) 9 9999-9999 */
export function formatTelefoneInput(value: string): string {
  let d = onlyDigits(value);
  if (d.startsWith("55")) d = d.slice(2);
  d = d.slice(0, 11);

  if (d.length === 0) return "";
  if (d.length <= 2) return `+55 (${d}`;
  if (d.length <= 3) return `+55 (${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 7) {
    return `+55 (${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3)}`;
  }
  return `+55 (${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3, 7)}-${d.slice(7)}`;
}

/** Exibe telefone (aceita dígitos com ou sem 55). */
export function formatTelefoneDisplay(telefone: string): string {
  const d = onlyDigits(telefone);
  if (d.length < 10) return telefone;
  return formatTelefoneInput(d.startsWith("55") ? d : `55${d}`);
}

/** Dígitos nacionais + DDI para busca/armazenamento consistente. */
export function telefoneParaArmazenamento(value: string): string {
  return formatTelefoneDisplay(value);
}
