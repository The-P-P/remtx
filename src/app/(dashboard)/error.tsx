"use client";

import { useEffect } from "react";
import { ErrorFallback } from "@/components/shared/error-fallback";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorFallback
      error={error}
      onRetry={reset}
      fallbackMessage="Não foi possível carregar os dados desta página."
    />
  );
}
