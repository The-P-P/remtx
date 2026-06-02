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
import { deleteVeiculoAction } from "@/lib/actions/form-actions";
import { FormErrorInline } from "@/components/shared/form-field-error";
import { friendlyErrorMessage } from "@/lib/errors/friendly-message";

interface VeiculoDeleteButtonProps {
  id: string;
  descricao: string;
  modoExclusao: "permanente" | "inativar";
  bloqueado?: boolean;
  motivoBloqueio?: string;
  variant?: "icon" | "button";
}

export function VeiculoDeleteButton({
  id,
  descricao,
  modoExclusao,
  bloqueado = false,
  motivoBloqueio,
  variant = "icon",
}: VeiculoDeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      try {
        await deleteVeiculoAction(id);
      } catch (e) {
        setError(friendlyErrorMessage(e, "Erro ao excluir"));
      }
    });
  }

  if (bloqueado) {
    return (
      <Button
        variant="ghost"
        size="icon-sm"
        type="button"
        disabled
        title={motivoBloqueio}
        className="text-muted-foreground"
        aria-label="Exclusão bloqueada"
      >
        <Trash2 className="size-4" />
      </Button>
    );
  }

  const titulo =
    modoExclusao === "permanente" ? "Excluir veículo?" : "Inativar veículo?";

  const aviso =
    modoExclusao === "permanente"
      ? "O veículo será removido permanentemente do sistema, junto com manutenções e problemas crônicos registrados. Esta ação não pode ser desfeita."
      : "O veículo será marcado como inativo e não poderá ser locado. O histórico de locações, manutenções e problemas será preservado.";

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
              aria-label="Excluir veículo"
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
          <SheetTitle>{titulo}</SheetTitle>
          <SheetDescription>{aviso}</SheetDescription>
        </SheetHeader>
        <p className="px-4 text-sm font-medium">{descricao}</p>
        {error && (
          <div className="px-4">
            <FormErrorInline error={error} />
          </div>
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
            {pending
              ? "Processando..."
              : modoExclusao === "permanente"
                ? "Sim, excluir"
                : "Sim, inativar"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
