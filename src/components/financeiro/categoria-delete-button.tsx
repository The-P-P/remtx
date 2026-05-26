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
import { deleteCategoriaAction } from "@/lib/actions/form-actions";

export function CategoriaDeleteButton({
  id,
  nome,
  temTransacoes,
}: {
  id: string;
  nome: string;
  temTransacoes: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      try {
        await deleteCategoriaAction(id);
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
            disabled={temTransacoes}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
            aria-label="Excluir categoria"
          />
        }
      >
        <Trash2 className="size-4" />
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85vh]">
        <SheetHeader>
          <SheetTitle>Excluir categoria?</SheetTitle>
          <SheetDescription>
            {temTransacoes
              ? "Esta categoria possui lançamentos. Desative-a na edição em vez de excluir."
              : "Esta ação não pode ser desfeita."}
          </SheetDescription>
        </SheetHeader>
        <p className="px-4 text-sm text-muted-foreground">{nome}</p>
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
            disabled={pending || temTransacoes}
          >
            {pending ? "Excluindo..." : "Sim, excluir"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
