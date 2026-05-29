"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KmInput } from "@/components/ui/km-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormActionsRow } from "@/components/shared/form-actions-row";
import type { FormAction, FormState } from "@/types/form";

type TipoManutencaoInitial = {
  nome: string;
  descricao: string | null;
  intervaloKm: number;
  pecasPadrao: { nome: string; quantidade: number }[];
};

export function TipoManutencaoForm({
  action,
  initial,
  submitLabel = "Criar tipo",
  cancelHref = "/manutencoes/tipos",
}: {
  action: FormAction;
  initial?: TipoManutencaoInitial;
  submitLabel?: string;
  cancelHref?: string;
}) {
  const [pecas, setPecas] = useState(
    initial?.pecasPadrao.length
      ? initial.pecasPadrao.map((p) => ({
          nome: p.nome,
          quantidade: p.quantidade,
        }))
      : [{ nome: "", quantidade: 1 }]
  );
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    { success: true }
  );

  return (
    <form action={formAction} className="w-full max-w-xl space-y-4">
      <input
        type="hidden"
        name="pecas"
        value={JSON.stringify(
          pecas.filter((p) => p.nome.trim()).map((p) => ({
            nome: p.nome,
            quantidade: Number(p.quantidade) || 1,
          }))
        )}
      />

      {state.success === false && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="nome">Nome do tipo *</Label>
        <Input
          id="nome"
          name="nome"
          required
          defaultValue={initial?.nome}
          placeholder="Ex.: Revisão 10.000 km"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="intervaloKm">Intervalo (km) *</Label>
        <KmInput
          id="intervaloKm"
          name="intervaloKm"
          required
          defaultValue={initial?.intervaloKm}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          name="descricao"
          rows={2}
          defaultValue={initial?.descricao ?? ""}
        />
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Label>Peças padrão</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => setPecas([...pecas, { nome: "", quantidade: 1 }])}
          >
            <Plus className="size-3" />
            Adicionar peça
          </Button>
        </div>
        {pecas.map((peca, i) => (
          <div
            key={i}
            className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_4rem_auto] sm:items-center"
          >
            <Input
              placeholder="Nome da peça"
              value={peca.nome}
              onChange={(e) => {
                const next = [...pecas];
                next[i] = { ...next[i], nome: e.target.value };
                setPecas(next);
              }}
              className="min-w-0"
            />
            <Input
              type="number"
              min={1}
              className="w-full"
              title="Qtd"
              value={peca.quantidade}
              onChange={(e) => {
                const next = [...pecas];
                next[i] = { ...next[i], quantidade: Number(e.target.value) };
                setPecas(next);
              }}
            />
            {pecas.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setPecas(pecas.filter((_, j) => j !== i))}
              >
                <Trash2 className="size-4 text-muted-foreground" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <FormActionsRow>
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Salvando..." : submitLabel}
        </Button>
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          render={<Link href={cancelHref} />}
        >
          Cancelar
        </Button>
      </FormActionsRow>
    </form>
  );
}
