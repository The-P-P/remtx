"use client";

import { FormErrorInline } from "@/components/shared/form-field-error";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/ui/currency-input";
import { updateConfiguracaoLocadora } from "@/lib/actions/contratos";
import type { FormState } from "@/types/form";

type Config = {
  razaoSocial: string;
  cpfCnpj: string;
  rg: string | null;
  rgOrgao: string | null;
  endereco: string;
  cidade: string;
  uf: string;
  cep: string | null;
  multaRescisao: unknown;
  kmSemanalMax: number;
  valorKmExtra: unknown;
};

export function ConfigLocadoraForm({ config }: { config: Config }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    updateConfiguracaoLocadora,
    { success: true }
  );

  return (
    <form action={action} className="max-w-xl space-y-6">
      {state.success === false && <FormErrorInline error={state.error} />}

      <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
        <p className="text-sm font-medium">Identificação do locador</p>
        <p className="text-xs text-muted-foreground">
          Estes dados aparecem no Contrato Padrão e no Contrato de Plano Conquista
          na qualificação das partes e nas cláusulas.
        </p>
        <div className="space-y-2">
          <Label htmlFor="razaoSocial">Nome completo / razão social *</Label>
          <Input
            id="razaoSocial"
            name="razaoSocial"
            defaultValue={config.razaoSocial}
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cpfCnpj">CPF/CNPJ *</Label>
            <Input
              id="cpfCnpj"
              name="cpfCnpj"
              defaultValue={config.cpfCnpj}
              placeholder="Somente números ou formatado"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rg">RG</Label>
            <Input id="rg" name="rg" defaultValue={config.rg ?? ""} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="rgOrgao">Órgão emissor do RG</Label>
          <Input
            id="rgOrgao"
            name="rgOrgao"
            defaultValue={config.rgOrgao ?? ""}
            placeholder="Ex.: SESP/MA, SSP/MA"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endereco">Endereço completo *</Label>
          <Input
            id="endereco"
            name="endereco"
            defaultValue={config.endereco}
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="cidade">Cidade *</Label>
            <Input id="cidade" name="cidade" defaultValue={config.cidade} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="uf">UF *</Label>
            <Input
              id="uf"
              name="uf"
              maxLength={2}
              defaultValue={config.uf}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cep">CEP</Label>
            <Input id="cep" name="cep" defaultValue={config.cep ?? ""} />
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
        <p className="text-sm font-medium">Cláusulas padrão do contrato</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="multaRescisao">Multa por rescisão (Cláusula 9ª)</Label>
            <CurrencyInput
              id="multaRescisao"
              name="multaRescisao"
              defaultValue={Number(config.multaRescisao)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kmSemanalMax">Km semanal máximo (Cláusula 4ª)</Label>
            <Input
              id="kmSemanalMax"
              name="kmSemanalMax"
              type="number"
              defaultValue={config.kmSemanalMax}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="valorKmExtra">Valor por km excedente — a cada 2 km</Label>
            <CurrencyInput
              id="valorKmExtra"
              name="valorKmExtra"
              defaultValue={Number(config.valorKmExtra ?? 1)}
            />
            <p className="text-xs text-muted-foreground">
              Ex.: R$ 1,00 a cada 2 km ultrapassados além do limite semanal.
            </p>
          </div>
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar perfil do locador"}
      </Button>
    </form>
  );
}
