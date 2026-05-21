"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 font-sans">
        <h1 className="text-xl font-semibold">Algo deu errado</h1>
        <p className="max-w-md text-center text-sm text-neutral-600">
          {error.message || "Erro inesperado ao carregar a página."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
        >
          Tentar novamente
        </button>
      </body>
    </html>
  );
}
