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
import { deleteTipoManutencaoAction } from "@/lib/actions/form-actions";
import { FormErrorInline } from "@/components/shared/form-field-error";
import { friendlyErrorMessage } from "@/lib/errors/friendly-message";

interface TipoManutencaoDeleteButtonProps {
  id: string;
  nome: string;
  totalManutencoes: number;
  variant?: "icon" | "button";
}

export function TipoManutencaoDeleteButton({
  id,
  nome,
  totalManutencoes,
  variant = "icon",
}: TipoManutencaoDeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const modoExclusao = totalManutencoes === 0 ? "permanente" : "inativar";

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      try {
        await deleteTipoManutencaoAction(id);
      } catch (e) {
        setError(friendlyErrorMessage(e, "Erro ao excluir"));
      }
    });
  }

  const titulo =
    modoExclusao === "permanente"
      ? "Excluir tipo de manutenção?"
      : "Inativar tipo de manutenção?";

  const aviso =
    modoExclusao === "permanente"
      ? "O tipo será removido permanentemente, incluindo as peças padrão cadastradas. Esta ação não pode ser desfeita."
      : `Este tipo está vinculado a ${totalManutencoes} manutenção(ões) registrada(s). Ele será inativado e não aparecerá em novos registros, mas o histórico será preservado.`;

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
              aria-label="Excluir tipo"
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
        <p className="px-4 text-sm font-medium">{nome}</p>
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
