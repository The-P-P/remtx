import Link from "next/link";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TIPO_TRANSACAO_LABEL,
  TIPO_TRANSACAO_STYLE,
} from "@/lib/constants/enums";
import { CategoriaDeleteButton } from "@/components/financeiro/categoria-delete-button";
import type { getCategoriasFinanceiras } from "@/lib/actions/financeiro";
import type { TipoTransacao } from "@/types/prisma";

type CategoriaItem = Awaited<ReturnType<typeof getCategoriasFinanceiras>>[number];

export function CategoriasList({ categorias }: { categorias: CategoriaItem[] }) {
  if (categorias.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhuma categoria cadastrada.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {categorias.map((c) => (
        <li
          key={c.id}
          className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5"
        >
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">{c.nome}</p>
              {!c.ativo && (
                <Badge variant="outline" className="text-muted-foreground">
                  Inativa
                </Badge>
              )}
            </div>
            <Badge className={TIPO_TRANSACAO_STYLE[c.tipo as TipoTransacao]}>
              {TIPO_TRANSACAO_LABEL[c.tipo as TipoTransacao]}
            </Badge>
            <p className="text-xs text-muted-foreground">
              {c._count.transacoes} lançamento(s)
            </p>
          </div>
          <div className="flex gap-0.5">
            <Button
              variant="ghost"
              size="icon-sm"
              render={<Link href={`/financeiro/categorias/${c.id}/editar`} />}
            >
              <Pencil className="size-4" />
            </Button>
            <CategoriaDeleteButton
              id={c.id}
              nome={c.nome}
              temTransacoes={c._count.transacoes > 0}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
