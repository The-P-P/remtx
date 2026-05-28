"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { estornarPagamentoParcelaFinanciamento } from "@/lib/actions/financiamento-veiculo";

export function ParcelaFinanciamentoEstornarButton({
  parcelaId,
}: {
  parcelaId: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (
          !confirm(
            "Estornar este pagamento? O saldo devedor será recalculado e o lançamento no financeiro (se houver) será removido."
          )
        ) {
          return;
        }
        startTransition(async () => {
          await estornarPagamentoParcelaFinanciamento(parcelaId);
        });
      }}
    >
      {pending ? "..." : "Estornar"}
    </Button>
  );
}
