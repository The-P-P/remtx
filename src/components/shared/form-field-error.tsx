import { friendlyErrorMessage } from "@/lib/errors/friendly-message";

export function FormErrorInline({
  error,
  className,
}: {
  error?: string;
  className?: string;
}) {
  if (!error) return null;
  return (
    <p
      className={
        className ??
        "rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
      }
      role="alert"
    >
      {friendlyErrorMessage(error)}
    </p>
  );
}

export function FormFieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs font-medium text-red-600 dark:text-red-400" role="alert">
      {message}
    </p>
  );
}

export function FormErrorBanner({
  error,
  fieldErrors,
}: {
  error?: string;
  fieldErrors?: Record<string, string>;
}) {
  if (!error) return null;
  const texto = friendlyErrorMessage(error);
  const extras = fieldErrors
    ? Object.entries(fieldErrors).filter(([k]) => k !== "_form")
    : [];

  return (
    <div
      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
      role="alert"
    >
      <p>{texto}</p>
      {extras.length > 1 && (
        <ul className="mt-2 list-inside list-disc text-xs">
          {extras.map(([field, msg]) => (
            <li key={field}>
              <span className="font-medium">{labelCampo(field)}:</span> {msg}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function labelCampo(field: string) {
  const labels: Record<string, string> = {
    nome: "Nome",
    cpf: "CPF",
    telefone: "Telefone",
    placa: "Placa",
    marca: "Marca",
    modelo: "Modelo",
    clienteId: "Cliente",
    veiculoId: "Veículo",
    dataInicio: "Data de retirada",
    dataFimPrevista: "Devolução prevista",
    kmInicio: "Km retirada",
    valorDiaria: "Valor",
    planoConquistaMeses: "Duração do plano",
    planoConquistaValorAdesao: "Adesão",
  };
  return labels[field] ?? field;
}
