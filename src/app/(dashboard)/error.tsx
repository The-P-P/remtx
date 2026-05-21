"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";

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
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Database className="size-5" />
          Erro ao carregar dados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Verifique se o PostgreSQL está rodando (
          <code className="text-xs">docker compose up -d</code>) e se as
          migrations foram aplicadas (
          <code className="text-xs">npm run db:migrate</code>).
        </p>
        <Button onClick={reset}>Tentar novamente</Button>
      </CardContent>
    </Card>
  );
}
