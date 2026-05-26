"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { deleteTransacaoAction } from "@/lib/actions/form-actions";

export function TransacaoDeleteButton({
  id,
  descricao,
  ano,
  mes,
}: {
  id: string;
  descricao: string;
  ano: number;
  mes: number;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      try {
        await deleteTransacaoAction(id, ano, mes);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao excluir");
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            type="button"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            aria-label="Excluir lançamento"
          />
        }
      >
        <Trash2 className="size-4" />
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85vh]">
        <SheetHeader>
          <SheetTitle>Excluir lançamento?</SheetTitle>
          <SheetDescription>
            Esta ação não pode ser desfeita. Lançamentos gerados pela agenda de
            locações também podem ser removidos aqui.
          </SheetDescription>
        </SheetHeader>
        <p className="px-4 text-sm text-muted-foreground">{descricao}</p>
        {error && <p className="px-4 text-sm text-red-600">{error}</p>}
        <SheetFooter className="flex-row gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={pending}
          >
            {pending ? "Excluindo..." : "Sim, excluir"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
