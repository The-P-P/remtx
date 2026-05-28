"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FORMAS_PAGAMENTO_OPTIONS } from "@/lib/constants/enums";
import { formatCurrency } from "@/lib/utils";
import { confirmarPagamentoParcelaFinanciamento } from "@/lib/actions/financiamento-veiculo";

const selectClass =
  "flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function ParcelaFinanciamentoPagarDialog({
  parcelaId,
  numero,
  totalParcelas,
  valor,
  dataVencimento,
}: {
  parcelaId: string;
  numero: number;
  totalParcelas: number;
  valor: number;
  dataVencimento: Date;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await confirmarPagamentoParcelaFinanciamento(
        parcelaId,
        formData
      );
      if (result.success) {
        setOpen(false);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="secondary" type="button">
            <CheckCircle2 className="size-4" />
            Registrar pagamento
          </Button>
        }
      />
      <DialogContent>
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              Parcela {numero}/{totalParcelas}
            </DialogTitle>
            <DialogDescription>
              Vencimento {format(dataVencimento, "dd/MM/yyyy")} ·{" "}
              {formatCurrency(valor)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="dataPagamento">Data do pagamento</Label>
              <Input
                id="dataPagamento"
                name="dataPagamento"
                type="date"
                defaultValue={format(new Date(), "yyyy-MM-dd")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="formaPagamento">Forma de pagamento</Label>
              <select
                id="formaPagamento"
                name="formaPagamento"
                className={selectClass}
                defaultValue="PIX"
              >
                {FORMAS_PAGAMENTO_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="registrarFinanceiro"
                defaultChecked
                className="size-4 rounded"
              />
              Registrar saída no financeiro
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Confirmar pagamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
