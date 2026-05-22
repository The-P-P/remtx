"use client";

import { useState, useMemo } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FormAction, FormState } from "@/types/form";

const selectClass =
  "flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type VeiculoOption = {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  kmAtual: number;
};

type TipoOption = {
  id: string;
  nome: string;
  intervaloKm: number;
  pecasPadrao: { nome: string; quantidade: number }[];
};

type PecaForm = {
  nome: string;
  quantidade: number;
  valorUnitario?: number;
};

export type ManutencaoFormInitial = {
  veiculoId: string;
  tipoManutencaoId: string;
  dataRealizada: Date;
  kmRealizada: number;
  kmProxima: number;
  custo?: number | null;
  observacoes?: string | null;
  pecas: PecaForm[];
};

export function ManutencaoForm({
  action,
  veiculos,
  tipos,
  veiculoIdPreselect,
  initial,
  mode = "create",
}: {
  action: FormAction;
  veiculos: VeiculoOption[];
  tipos: TipoOption[];
  veiculoIdPreselect?: string;
  initial?: ManutencaoFormInitial;
  mode?: "create" | "edit";
}) {
  const isEdit = mode === "edit" && !!initial;

  const [pecas, setPecas] = useState<PecaForm[]>(
    initial?.pecas?.length
      ? initial.pecas.map((p) => ({
          nome: p.nome,
          quantidade: p.quantidade,
          valorUnitario: p.valorUnitario ? Number(p.valorUnitario) : undefined,
        }))
      : [{ nome: "", quantidade: 1 }]
  );

  const [tipoSelecionado, setTipoSelecionado] = useState(
    initial?.tipoManutencaoId ?? ""
  );

  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    { success: true }
  );

  const hoje = format(new Date(), "yyyy-MM-dd");
  const dataDefault = initial
    ? format(initial.dataRealizada, "yyyy-MM-dd")
    : hoje;

  const tipoAtual = tipos.find((t) => t.id === tipoSelecionado);
  const kmProximaSugerida = useMemo(() => {
    const km = initial?.kmRealizada ?? 0;
    if (tipoAtual) return km + tipoAtual.intervaloKm;
    return initial?.kmProxima ?? 0;
  }, [tipoAtual, initial]);

  function carregarPecasDoTipo() {
    if (!tipoAtual) return;
    setPecas(
      tipoAtual.pecasPadrao.map((p) => ({
        nome: p.nome,
        quantidade: p.quantidade,
      }))
    );
  }

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      <input
        type="hidden"
        name="pecas"
        value={JSON.stringify(
          pecas
            .filter((p) => p.nome.trim())
            .map((p) => ({
              nome: p.nome.trim(),
              quantidade: Number(p.quantidade) || 1,
              ...(p.valorUnitario != null && p.valorUnitario > 0
                ? { valorUnitario: p.valorUnitario }
                : {}),
            }))
        )}
      />

      {state.success === false && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="veiculoId">Veículo *</Label>
        <select
          id="veiculoId"
          name="veiculoId"
          defaultValue={initial?.veiculoId ?? veiculoIdPreselect ?? ""}
          required
          className={selectClass}
        >
          <option value="">Selecione...</option>
          {veiculos.map((v) => (
            <option key={v.id} value={v.id}>
              {v.placa} — {v.marca} {v.modelo} ({v.kmAtual.toLocaleString("pt-BR")} km)
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tipoManutencaoId">Tipo de manutenção *</Label>
        <select
          id="tipoManutencaoId"
          name="tipoManutencaoId"
          required
          className={selectClass}
          value={tipoSelecionado}
          onChange={(e) => setTipoSelecionado(e.target.value)}
        >
          <option value="">Selecione...</option>
          {tipos.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome} (a cada {t.intervaloKm.toLocaleString("pt-BR")} km)
            </option>
          ))}
        </select>
        {!isEdit && (
          <p className="text-xs text-muted-foreground">
            As peças padrão do tipo podem ser carregadas no bloco abaixo.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dataRealizada">Data realizada *</Label>
          <Input
            id="dataRealizada"
            name="dataRealizada"
            type="date"
            defaultValue={dataDefault}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="kmRealizada">Km na manutenção *</Label>
          <Input
            id="kmRealizada"
            name="kmRealizada"
            type="number"
            defaultValue={initial?.kmRealizada}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="kmProxima">Km próxima revisão *</Label>
          <Input
            id="kmProxima"
            name="kmProxima"
            type="number"
            key={`kmProxima-${tipoSelecionado}`}
            defaultValue={isEdit ? initial?.kmProxima : kmProximaSugerida}
            required={isEdit}
          />
          <p className="text-xs text-muted-foreground">
            {tipoAtual
              ? `Sugerido: ${(Number(initial?.kmRealizada ?? 0) + tipoAtual.intervaloKm).toLocaleString("pt-BR")} km (+${tipoAtual.intervaloKm.toLocaleString("pt-BR")} km)`
              : "Selecione o tipo para ver sugestão"}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="custo">Custo (R$)</Label>
          <Input
            id="custo"
            name="custo"
            type="number"
            step="0.01"
            min="0"
            defaultValue={initial?.custo ? Number(initial.custo) : undefined}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          name="observacoes"
          rows={3}
          defaultValue={initial?.observacoes ?? ""}
        />
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label>Peças utilizadas</Label>
          <div className="flex gap-2">
            {tipoAtual && tipoAtual.pecasPadrao.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={carregarPecasDoTipo}
              >
                Carregar peças do tipo
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPecas([...pecas, { nome: "", quantidade: 1 }])}
            >
              <Plus className="size-3" />
              Peça
            </Button>
          </div>
        </div>
        {pecas.map((peca, i) => (
          <div key={i} className="flex flex-wrap gap-2">
            <Input
              placeholder="Nome da peça"
              value={peca.nome}
              onChange={(e) => {
                const next = [...pecas];
                next[i] = { ...next[i], nome: e.target.value };
                setPecas(next);
              }}
              className="min-w-[200px] flex-1"
            />
            <Input
              type="number"
              min={1}
              className="w-16"
              value={peca.quantidade}
              onChange={(e) => {
                const next = [...pecas];
                next[i] = { ...next[i], quantidade: Number(e.target.value) };
                setPecas(next);
              }}
            />
            <Input
              type="number"
              step="0.01"
              min={0}
              placeholder="R$"
              className="w-24"
              value={peca.valorUnitario ?? ""}
              onChange={(e) => {
                const next = [...pecas];
                next[i] = {
                  ...next[i],
                  valorUnitario: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                };
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

      {!isEdit && <input type="hidden" name="pecasExtras" value="[]" />}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Salvando..."
            : isEdit
              ? "Salvar alterações"
              : "Registrar manutenção"}
        </Button>
        <Button variant="outline" render={<Link href="/manutencoes" />}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
