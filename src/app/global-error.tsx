"use client";

import { ErrorFallback } from "@/components/shared/error-fallback";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen items-center justify-center bg-neutral-50 p-6 font-sans antialiased dark:bg-neutral-950">
        <ErrorFallback
          error={error}
          onRetry={reset}
          fallbackMessage="Ocorreu um erro inesperado. Tente recarregar a página."
        />
      </body>
    </html>
  );
}
