"use client";

import { useTransition } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { duplicateTransacaoAction } from "@/lib/actions/form-actions";

export function TransacaoDuplicarButton({
  id,
  ano,
  mes,
}: {
  id: string;
  ano: number;
  mes: number;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      type="button"
      disabled={pending}
      aria-label="Duplicar lançamento"
      onClick={() => {
        startTransition(async () => {
          await duplicateTransacaoAction(id, ano, mes);
        });
      }}
    >
      <Copy className="size-4" />
    </Button>
  );
}
