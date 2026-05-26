import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TIPO_TRANSACAO_LABEL,
  TIPO_TRANSACAO_STYLE,
} from "@/lib/constants/enums";
import { formatCurrency } from "@/lib/utils";
import { TransacaoDeleteButton } from "@/components/financeiro/transacao-delete-button";
import type { getTransacoes } from "@/lib/actions/financeiro";
import type { TipoTransacao } from "@/types/prisma";

type TransacaoItem = Awaited<ReturnType<typeof getTransacoes>>[number];

export function TransacoesList({
  transacoes,
  ano,
  mes,
}: {
  transacoes: TransacaoItem[];
  ano: number;
  mes: number;
}) {
  if (transacoes.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Nenhum lançamento neste período.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {transacoes.map((t) => (
        <li
          key={t.id}
          className="flex flex-wrap items-start justify-between gap-3 p-4 sm:p-5"
        >
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={TIPO_TRANSACAO_STYLE[t.tipo as TipoTransacao]}>
                {TIPO_TRANSACAO_LABEL[t.tipo as TipoTransacao]}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {format(t.data, "dd/MM/yyyy", { locale: ptBR })}
              </span>
            </div>
            <p className="font-medium">{t.descricao}</p>
            <p className="text-sm text-muted-foreground">{t.categoria.nome}</p>
          </div>
          <div className="flex items-center gap-2">
            <p
              className={`text-lg font-bold tabular-nums ${
                t.tipo === "ENTRADA"
                  ? "text-emerald-700 dark:text-emerald-500"
                  : "text-red-700 dark:text-red-500"
              }`}
            >
              {t.tipo === "ENTRADA" ? "+" : "−"}
              {formatCurrency(Number(t.valor))}
            </p>
            <Button
              variant="ghost"
              size="icon-sm"
              render={
                <Link
                  href={`/financeiro/${t.id}/editar?ano=${ano}&mes=${mes}`}
                />
              }
            >
              <Pencil className="size-4" />
            </Button>
            <TransacaoDeleteButton
              id={t.id}
              descricao={t.descricao}
              ano={ano}
              mes={mes}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
