"use client";

import { useState, useMemo } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KmInput } from "@/components/ui/km-input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormActionsRow } from "@/components/shared/form-actions-row";
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
  cancelHref,
  initial,
  mode = "create",
}: {
  action: FormAction;
  veiculos: VeiculoOption[];
  tipos: TipoOption[];
  veiculoIdPreselect?: string;
  cancelHref?: string;
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
    <form action={formAction} className="w-full max-w-2xl space-y-4">
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
          <KmInput
            id="kmRealizada"
            name="kmRealizada"
            defaultValue={initial?.kmRealizada}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="kmProxima">Km próxima revisão *</Label>
          <KmInput
            id="kmProxima"
            name="kmProxima"
            key={`kmProxima-${tipoSelecionado}`}
            defaultValue={isEdit ? initial?.kmProxima : kmProximaSugerida}
            required={isEdit}
            allowEmpty={!isEdit}
          />
          <p className="text-xs text-muted-foreground">
            {tipoAtual
              ? `Sugerido: ${(Number(initial?.kmRealizada ?? 0) + tipoAtual.intervaloKm).toLocaleString("pt-BR")} km (+${tipoAtual.intervaloKm.toLocaleString("pt-BR")} km)`
              : "Selecione o tipo para ver sugestão"}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="custo">Custo</Label>
          <CurrencyInput
            id="custo"
            name="custo"
            allowEmpty
            defaultValue={
              initial?.custo ? Number(initial.custo) : undefined
            }
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
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <Label>Peças utilizadas</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            {tipoAtual && tipoAtual.pecasPadrao.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={carregarPecasDoTipo}
              >
                Carregar peças do tipo
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => setPecas([...pecas, { nome: "", quantidade: 1 }])}
            >
              <Plus className="size-3" />
              Peça
            </Button>
          </div>
        </div>
        {pecas.map((peca, i) => (
          <div
            key={i}
            className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_4rem_5rem_auto] sm:items-center"
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
            <CurrencyInput
              allowEmpty
              className="w-full"
              value={peca.valorUnitario}
              onValueChange={(valorUnitario) => {
                const next = [...pecas];
                next[i] = { ...next[i], valorUnitario };
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

      <div className="space-y-3 rounded-lg border p-4">
        <p className="text-sm font-medium">Financeiro</p>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="registrarFinanceiro"
            defaultChecked={false}
            className="mt-0.5 size-4 rounded border-input"
          />
          <span className="text-sm">
            Registrar saída no financeiro (usa o custo informado)
          </span>
        </label>
        <div className="space-y-2">
          <Label htmlFor="formaPagamento">Forma de pagamento</Label>
          <select
            id="formaPagamento"
            name="formaPagamento"
            className="flex h-8 w-full max-w-xs rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30"
          >
            <option value="">Não informado</option>
            <option value="PIX">PIX</option>
            <option value="DINHEIRO">Dinheiro</option>
            <option value="CARTAO_DEBITO">Cartão débito</option>
            <option value="CARTAO_CREDITO">Cartão crédito</option>
            <option value="TRANSFERENCIA">Transferência</option>
            <option value="BOLETO">Boleto</option>
            <option value="OUTRO">Outro</option>
          </select>
        </div>
      </div>

      {!isEdit && (
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3">
          <input
            type="checkbox"
            name="colocarEmManutencao"
            className="mt-0.5 size-4 rounded border-input"
          />
          <span className="text-sm">
            <span className="font-medium">Colocar veículo em manutenção</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              O status passa para &quot;Em manutenção&quot; após salvar. Se
              desmarcado e o veículo já estava em manutenção, volta para
              disponível.
            </span>
          </span>
        </label>
      )}

      <FormActionsRow>
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending
            ? "Salvando..."
            : isEdit
              ? "Salvar alterações"
              : "Registrar manutenção"}
        </Button>
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          render={
            <Link
              href={
                cancelHref ??
                (veiculoIdPreselect
                  ? `/veiculos/${veiculoIdPreselect}`
                  : "/manutencoes")
              }
            />
          }
        >
          Cancelar
        </Button>
      </FormActionsRow>
    </form>
  );
}
