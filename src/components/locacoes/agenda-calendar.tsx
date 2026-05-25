"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  getDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TIPO_EVENTO_AGENDA_LABEL,
  TIPO_EVENTO_AGENDA_STYLE,
} from "@/lib/constants/enums";
import {
  AgendaTarefasDia,
  type TarefaAgendaSerializada,
} from "@/components/locacoes/agenda-tarefas-dia";
import type { TipoEventoAgenda } from "@/types/prisma";

export type AgendaEventoSerializado = TarefaAgendaSerializada;

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function eventosUrl(ano: number, mes: number, dia?: number) {
  const base = `/locacoes?ano=${ano}&mes=${mes}`;
  return dia ? `${base}&dia=${dia}` : base;
}

type VeiculoOption = { id: string; placa: string; marca: string; modelo: string };
type ClienteOption = { id: string; nome: string };

export function AgendaCalendar({
  eventos,
  ano,
  mes,
  diaSelecionado,
  veiculos,
  clientes,
}: {
  eventos: AgendaEventoSerializado[];
  ano: number;
  mes: number;
  diaSelecionado?: number;
  veiculos: VeiculoOption[];
  clientes: ClienteOption[];
}) {
  const referencia = new Date(ano, mes - 1, 1);
  const inicioMes = startOfMonth(referencia);
  const fimMes = endOfMonth(referencia);
  const dias = eachDayOfInterval({ start: inicioMes, end: fimMes });
  const offset = getDay(inicioMes);

  const eventosPorDia = useMemo(() => {
    const map = new Map<string, AgendaEventoSerializado[]>();
    for (const e of eventos) {
      const key = format(new Date(e.dataInicio), "yyyy-MM-dd");
      const list = map.get(key) ?? [];
      list.push(e);
      map.set(key, list);
    }
    return map;
  }, [eventos]);

  const diaAtivo =
    diaSelecionado && diaSelecionado >= 1 && diaSelecionado <= dias.length
      ? new Date(ano, mes - 1, diaSelecionado)
      : null;

  const eventosDiaSelecionado = diaAtivo
    ? (eventosPorDia.get(format(diaAtivo, "yyyy-MM-dd")) ?? [])
    : [];

  const mesAnterior = subMonths(referencia, 1);
  const mesProximo = addMonths(referencia, 1);

  const tiposPresentes = [...new Set(eventos.map((e) => e.tipo))];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            render={
              <Link
                href={eventosUrl(
                  mesAnterior.getFullYear(),
                  mesAnterior.getMonth() + 1
                )}
              />
            }
          >
            <ChevronLeft className="size-4" />
          </Button>
          <h2 className="min-w-[140px] text-center text-lg font-semibold capitalize">
            {format(referencia, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <Button
            variant="outline"
            size="icon-sm"
            render={
              <Link
                href={eventosUrl(
                  mesProximo.getFullYear(),
                  mesProximo.getMonth() + 1
                )}
              />
            }
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          render={
            <Link
              href={eventosUrl(
                new Date().getFullYear(),
                new Date().getMonth() + 1,
                new Date().getDate()
              )}
            />
          }
        >
          Hoje
        </Button>
      </div>

      {tiposPresentes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tiposPresentes.map((tipo) => (
            <Badge
              key={tipo}
              variant="outline"
              className={`text-xs ${TIPO_EVENTO_AGENDA_STYLE[tipo]}`}
            >
              {TIPO_EVENTO_AGENDA_LABEL[tipo]}
            </Badge>
          ))}
        </div>
      )}

      <Card>
        <CardContent className="p-2 sm:p-4">
          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
            {DIAS_SEMANA.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: offset }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[72px] sm:min-h-[88px]" />
            ))}
            {dias.map((dia) => {
              const key = format(dia, "yyyy-MM-dd");
              const evs = eventosPorDia.get(key) ?? [];
              const selecionado = diaAtivo && isSameDay(dia, diaAtivo);
              const foraMes = !isSameMonth(dia, referencia);

              return (
                <Link
                  key={key}
                  href={eventosUrl(ano, mes, dia.getDate())}
                  className={`min-h-[72px] rounded-lg border p-1 text-left transition-colors sm:min-h-[88px] sm:p-1.5 ${
                    selecionado
                      ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                      : "border-transparent hover:bg-muted/50"
                  } ${foraMes ? "opacity-40" : ""} ${
                    isToday(dia) ? "bg-muted/30" : ""
                  }`}
                >
                  <span
                    className={`text-xs font-medium sm:text-sm ${
                      isToday(dia) ? "text-primary" : ""
                    }`}
                  >
                    {format(dia, "d")}
                  </span>
                  <div className="mt-0.5 space-y-0.5">
                    {evs.slice(0, 2).map((e) => (
                      <div
                        key={e.id}
                        className={`truncate rounded px-0.5 text-[10px] leading-tight sm:text-xs border ${TIPO_EVENTO_AGENDA_STYLE[e.tipo]} ${
                          e.meta?.concluido ? "opacity-50 line-through" : ""
                        }`}
                        title={e.titulo}
                      >
                        {e.titulo}
                      </div>
                    ))}
                    {evs.length > 2 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{evs.length - 2}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {diaAtivo
              ? format(diaAtivo, "EEEE, d 'de' MMMM", { locale: ptBR })
              : "Selecione um dia no calendário"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {diaAtivo ? (
            <AgendaTarefasDia
              tarefas={eventosDiaSelecionado}
              diaLabel={`${eventosDiaSelecionado.length} tarefa(s) — marque como feito ou reagende`}
              dataPadrao={format(diaAtivo, "yyyy-MM-dd")}
              ano={ano}
              mes={mes}
              dia={diaAtivo.getDate()}
              veiculos={veiculos}
              clientes={clientes}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Clique em um dia no calendário para ver e gerenciar as tarefas.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
