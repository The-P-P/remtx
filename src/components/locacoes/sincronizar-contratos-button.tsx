"use client";

import { useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sincronizarContratosLegadosAction } from "@/lib/actions/contratos";

export function SincronizarContratosButton() {
  const [pending, start] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await sincronizarContratosLegadosAction();
        })
      }
    >
      <RefreshCw className={`size-4 ${pending ? "animate-spin" : ""}`} />
      {pending ? "Sincronizando..." : "Sincronizar contratos antigos"}
    </Button>
  );
}
