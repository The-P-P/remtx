"use client";

import Link from "next/link";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { friendlyErrorMessage, isDatabaseError } from "@/lib/errors/friendly-message";

type ErrorFallbackProps = {
  error?: Error & { digest?: string };
  title?: string;
  onRetry?: () => void;
  showHomeLink?: boolean;
  fallbackMessage?: string;
};

export function ErrorFallback({
  error,
  title,
  onRetry,
  showHomeLink = true,
  fallbackMessage = "Não foi possível carregar esta página. Tente novamente.",
}: ErrorFallbackProps) {
  const message = error
    ? friendlyErrorMessage(error, fallbackMessage)
    : fallbackMessage;
  const dbHint = error && isDatabaseError(error);

  return (
    <Card className="mx-auto max-w-lg border-destructive/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-destructive">
          <AlertCircle className="size-5 shrink-0" aria-hidden />
          {title ?? "Ops, algo deu errado"}
        </CardTitle>
        <CardDescription className="text-base text-foreground/90">
          {message}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {dbHint && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            Se o problema persistir, confira se o banco de dados está rodando e
            se as migrations foram aplicadas.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {onRetry && (
            <Button type="button" onClick={onRetry}>
              <RefreshCw className="size-4" />
              Tentar novamente
            </Button>
          )}
          {showHomeLink && (
            <Button variant="outline" render={<Link href="/" />}>
              <Home className="size-4" />
              Ir para início
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
