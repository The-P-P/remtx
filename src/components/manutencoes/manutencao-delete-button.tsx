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
import { deleteManutencaoAction } from "@/lib/actions/form-actions";

interface ManutencaoDeleteButtonProps {
  id: string;
  descricao: string;
  variant?: "icon" | "button";
}

export function ManutencaoDeleteButton({
  id,
  descricao,
  variant = "icon",
}: ManutencaoDeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      try {
        await deleteManutencaoAction(id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao excluir");
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={variant === "icon" ? "inline-flex" : undefined}
        render={
          variant === "icon" ? (
            <Button
              variant="ghost"
              size="icon-sm"
              type="button"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              aria-label="Excluir manutenção"
            />
          ) : (
            <Button variant="destructive" type="button" className="w-full sm:w-auto" />
          )
        }
      >
        {variant === "icon" ? (
          <Trash2 className="size-4" />
        ) : (
          <>
            <Trash2 className="size-4" />
            Excluir
          </>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85vh]">
        <SheetHeader>
          <SheetTitle>Excluir manutenção?</SheetTitle>
          <SheetDescription>
            Esta ação não pode ser desfeita. Será removida a ordem de serviço e
            todas as peças vinculadas.
          </SheetDescription>
        </SheetHeader>
        <p className="px-4 text-sm text-muted-foreground">{descricao}</p>
        {error && (
          <p className="px-4 text-sm text-red-600">{error}</p>
        )}
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
