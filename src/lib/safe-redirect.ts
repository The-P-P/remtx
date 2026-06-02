/**
 * Aceita apenas caminhos internos (evita open redirect).
 * Clerk envia redirect_url como path (/locacoes) ou URL completa.
 */
export function safeRedirectPath(
  value: string | null | undefined,
  fallback = "/dashboard"
): string {
  if (!value?.trim()) return fallback;

  const raw = value.trim();

  try {
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      const url = new URL(raw);
      return safeRedirectPath(url.pathname + url.search + url.hash, fallback);
    }
  } catch {
    return fallback;
  }

  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;

  const pathOnly = raw.split("?")[0]?.split("#")[0] ?? raw;
  if (pathOnly === "/sign-in" || pathOnly.startsWith("/sign-in/")) {
    return fallback;
  }
  if (pathOnly === "/sign-up" || pathOnly.startsWith("/sign-up/")) {
    return fallback;
  }

  return raw;
}
