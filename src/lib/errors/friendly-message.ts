const TECHNICAL_MARKERS = [
  "Invalid `prisma",
  "findUniqueOrThrow",
  "findFirstOrThrow",
  "invocation",
  "TURBOPACK",
  "node_modules",
  "An operation failed because it depends on",
  "No record was found for a query",
  "P2002",
  "P2003",
  "P2025",
  "ECONNREFUSED",
  "Can't reach database",
  "Server Components render",
  "Digest:",
];

/** Converte erros técnicos (Prisma, stack, etc.) em mensagem clara para o usuário. */
export function friendlyErrorMessage(
  error: unknown,
  fallback = "Não foi possível concluir. Tente novamente em instantes."
): string {
  if (error == null) return fallback;

  const raw =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : String(error);

  const msg = raw.trim();
  if (!msg) return fallback;

  if (msg.includes("Unique constraint") || msg.includes("P2002")) {
    return "Já existe um registro com estes dados (ex.: placa, CPF ou contrato duplicado).";
  }

  if (
    msg.includes("Foreign key constraint") ||
    msg.includes("P2003") ||
    msg.includes("P2025") ||
    msg.includes("No record was found") ||
    msg.includes("findUniqueOrThrow") ||
    msg.includes("findFirstOrThrow")
  ) {
    return "Algum dado não foi encontrado. Atualize a página e tente novamente.";
  }

  if (
    msg.includes("ECONNREFUSED") ||
    msg.includes("Can't reach database") ||
    msg.includes("Connection terminated") ||
    msg.includes("connect ETIMEDOUT")
  ) {
    return "Não foi possível conectar ao banco de dados. Verifique se o servidor está ativo.";
  }

  if (msg.includes("Não autenticado") || msg.includes("Unauthorized")) {
    return "Sua sessão expirou. Faça login novamente.";
  }

  if (msg.includes("Sem permissão") || msg.includes("Forbidden")) {
    return "Você não tem permissão para esta ação.";
  }

  if (isTechnicalMessage(msg)) {
    return fallback;
  }

  return msg.length > 280 ? fallback : msg;
}

function isTechnicalMessage(msg: string): boolean {
  return TECHNICAL_MARKERS.some((m) => msg.includes(m));
}

export function isDatabaseError(error: unknown): boolean {
  const msg =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : "";
  return (
    msg.includes("ECONNREFUSED") ||
    msg.includes("Can't reach database") ||
    msg.includes("Connection terminated") ||
    msg.includes("Invalid `prisma")
  );
}
