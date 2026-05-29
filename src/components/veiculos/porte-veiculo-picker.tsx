"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PorteVeiculoIcon } from "@/components/veiculos/porte-veiculo-icon";
import {
  CORES_VEICULO_PRESET,
  PORTE_VEICULO_OPTIONS,
  corParaHex,
  inferirPorte,
} from "@/lib/porte-veiculo";
import { cn } from "@/lib/utils";
import type { PorteVeiculo } from "@/types/prisma";

type PorteVeiculoPickerProps = {
  defaultPorte?: PorteVeiculo;
  defaultCor?: string | null;
  defaultModelo?: string;
};

export function PorteVeiculoPicker({
  defaultPorte,
  defaultCor,
  defaultModelo,
}: PorteVeiculoPickerProps) {
  const [porte, setPorte] = useState<PorteVeiculo>(
    defaultPorte ?? (defaultModelo ? inferirPorte(defaultModelo) : "SEDAN")
  );
  const [cor, setCor] = useState(defaultCor ?? "");
  const corHex = corParaHex(cor);

  return (
    <div className="space-y-4 rounded-xl border border-border/70 bg-muted/20 p-4">
      <input type="hidden" name="porte" value={porte} />

      <div className="space-y-2">
        <Label>Porte do veículo *</Label>
        <p className="text-xs text-muted-foreground">
          Escolha o formato do carro. A silhueta usa a cor informada abaixo.
        </p>
      </div>

      <div
        className="flex items-center justify-center rounded-xl border border-border/60 bg-background/80 px-6 py-8"
        style={{
          backgroundImage: `linear-gradient(180deg, ${corHex}22 0%, transparent 70%)`,
        }}
      >
        <PorteVeiculoIcon
          porte={porte}
          cor={corHex}
          className="h-24 w-full max-w-[280px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {PORTE_VEICULO_OPTIONS.map(({ value, label }) => {
          const selecionado = porte === value;

          return (
            <button
              key={value}
              type="button"
              onClick={() => setPorte(value)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-lg border px-3 py-3 transition-all",
                selecionado
                  ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                  : "border-border/70 bg-background hover:border-primary/40 hover:bg-muted/40"
              )}
            >
              <PorteVeiculoIcon
                porte={value}
                cor={selecionado ? corHex : "#94a3b8"}
                className="h-10 w-full max-w-[100px]"
              />
              <span
                className={cn(
                  "text-center text-[10px] leading-tight font-medium sm:text-xs",
                  selecionado ? "text-primary" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cor">Cor</Label>
        <Input
          id="cor"
          name="cor"
          value={cor}
          onChange={(e) => setCor(e.target.value)}
          placeholder="Ex.: Prata, Preto, Azul..."
        />
        <div className="flex flex-wrap gap-1.5">
          {CORES_VEICULO_PRESET.map((preset) => (
            <button
              key={preset.nome}
              type="button"
              title={preset.nome}
              onClick={() => setCor(preset.nome)}
              className={cn(
                "size-7 rounded-full border-2 transition-transform hover:scale-110",
                cor.toLowerCase() === preset.nome.toLowerCase()
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border/80"
              )}
              style={{
                backgroundColor: preset.hex,
                boxShadow:
                  preset.hex === "#f1f5f9"
                    ? "inset 0 0 0 1px rgba(15,23,42,0.12)"
                    : undefined,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
