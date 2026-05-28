"use client";

import Link from "next/link";
import { Filter } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type CategoriaOption = {
  id: string;
  nome: string;
  tipo: "ENTRADA" | "SAIDA";
};

export function FinanceiroFiltrosSheet({
  ano,
  mes,
  categorias,
  defaults,
  limparHref,
}: {
  ano: number;
  mes: number;
  categorias: CategoriaOption[];
  defaults: {
    periodoTipo?: string;
    dataRef?: string;
    de?: string;
    ate?: string;
    q?: string;
    tipo?: string;
    categoriaId?: string;
  };
  limparHref: string;
}) {
  const filtrosAtivos =
    !!defaults.de ||
    !!defaults.ate ||
    !!defaults.periodoTipo ||
    !!defaults.dataRef ||
    !!defaults.q ||
    !!defaults.tipo ||
    !!defaults.categoriaId;

  const dataRefDefault = defaults.dataRef ?? format(new Date(), "yyyy-MM-dd");

  const categoriaAtiva = defaults.categoriaId
    ? categorias.find((c) => c.id === defaults.categoriaId)
    : undefined;

  return (
    <div className="flex flex-col items-start gap-1">
      <Sheet>
        <SheetTrigger
          render={
            <Button
              variant={filtrosAtivos ? "secondary" : "outline"}
              type="button"
              className="w-auto"
            />
          }
        >
          <Filter className="size-4" />
          Filtros
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <form method="get" className="flex h-full flex-col">
            <SheetHeader>
              <SheetTitle>Configurar filtros</SheetTitle>
              <SheetDescription>
                Use período, tipo, categoria e texto para refinar os lançamentos.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-4 px-4 pb-2">
              <input type="hidden" name="ano" value={ano} />
              <input type="hidden" name="mes" value={mes} />

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="periodoTipo" className="text-xs text-muted-foreground">
                    Período rápido
                  </label>
                  <select
                    id="periodoTipo"
                    name="periodoTipo"
                    defaultValue={defaults.periodoTipo ?? ""}
                    className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30"
                  >
                    <option value="">Mês (ano/mês)</option>
                    <option value="semana">Semana</option>
                    <option value="dia">Dia</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label htmlFor="dataRef" className="text-xs text-muted-foreground">
                    Data referência
                  </label>
                  <Input
                    id="dataRef"
                    name="dataRef"
                    type="date"
                    defaultValue={dataRefDefault}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="de" className="text-xs text-muted-foreground">
                    De (sobrescreve período rápido)
                  </label>
                  <Input id="de" name="de" type="date" defaultValue={defaults.de ?? ""} />
                </div>
                <div className="space-y-1">
                  <label htmlFor="ate" className="text-xs text-muted-foreground">
                    Até
                  </label>
                  <Input id="ate" name="ate" type="date" defaultValue={defaults.ate ?? ""} />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="q" className="text-xs text-muted-foreground">
                  Buscar descrição
                </label>
                <Input
                  id="q"
                  name="q"
                  placeholder="Ex.: placa, cliente..."
                  defaultValue={defaults.q ?? ""}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="tipo" className="text-xs text-muted-foreground">
                  Tipo
                </label>
                <select
                  id="tipo"
                  name="tipo"
                  defaultValue={defaults.tipo ?? ""}
                  className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30"
                >
                  <option value="">Todos</option>
                  <option value="ENTRADA">Entradas</option>
                  <option value="SAIDA">Saídas</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="categoriaId" className="text-xs text-muted-foreground">
                  Categoria
                </label>
                <select
                  id="categoriaId"
                  name="categoriaId"
                  defaultValue={defaults.categoriaId ?? ""}
                  className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30"
                >
                  <option value="">Todas</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} ({c.tipo === "ENTRADA" ? "E" : "S"})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <SheetFooter className="border-t">
              <Button type="submit" variant="secondary">
                Aplicar filtros
              </Button>
              <Button variant="ghost" render={<Link href={limparHref} />}>
                Limpar
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
      {filtrosAtivos && (
        <p className="pl-0.5 text-xs text-muted-foreground">
          Filtros ativos
          {categoriaAtiva ? (
            <>
              {" "}
              · <span className="text-foreground/80">{categoriaAtiva.nome}</span>
            </>
          ) : null}
        </p>
      )}
    </div>
  );
}
