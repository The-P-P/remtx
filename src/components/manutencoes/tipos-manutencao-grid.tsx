import Link from "next/link";
import { Pencil } from "lucide-react";
import { TipoManutencaoDeleteButton } from "@/components/manutencoes/tipo-manutencao-delete-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { getTiposManutencao } from "@/lib/actions/manutencoes";

type TipoItem = Awaited<ReturnType<typeof getTiposManutencao>>[number];

export function TiposManutencaoGrid({ tipos }: { tipos: TipoItem[] }) {
  if (tipos.length === 0) {
    return (
      <p className="text-muted-foreground">
        Nenhum tipo cadastrado. Execute{" "}
        <code className="text-xs">npm run db:seed:tipos</code>.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {tipos.map((t) => (
        <Card key={t.id} className={!t.ativo ? "opacity-60" : undefined}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base leading-snug">{t.nome}</CardTitle>
                {!t.ativo && (
                  <Badge variant="secondary" className="mt-1">
                    Inativo
                  </Badge>
                )}
                {t.descricao && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t.descricao}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-0.5">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  render={
                    <Link href={`/manutencoes/tipos/${t.id}/editar`} />
                  }
                >
                  <Pencil className="size-4" />
                </Button>
                <TipoManutencaoDeleteButton
                  id={t.id}
                  nome={t.nome}
                  totalManutencoes={t._count.manutencoes}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <p className="text-sm">
              Intervalo:{" "}
              <strong>{t.intervaloKm.toLocaleString("pt-BR")} km</strong>
            </p>
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Peças padrão:
              </p>
              {t.pecasPadrao.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Nenhuma peça definida
                </p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {t.pecasPadrao.map((p) => (
                    <li key={p.id} className="flex justify-between gap-2">
                      <span className="min-w-0 truncate">{p.nome}</span>
                      <span className="shrink-0 text-muted-foreground">
                        x{p.quantidade}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
