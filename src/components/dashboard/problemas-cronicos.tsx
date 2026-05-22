import { AlertOctagon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GRAVIDADE_LABEL, GRAVIDADE_STYLE } from "@/lib/constants/enums";
import type { GravidadeProblema } from "@/types/prisma";

interface ProblemaItem {
  id: string;
  descricao: string;
  gravidade: GravidadeProblema;
  veiculo: { placa: string; marca: string; modelo: string };
}

export function ProblemasCronicos({ problemas }: { problemas: ProblemaItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertOctagon className="size-4 text-red-500 dark:text-red-500" />
          <span className="dark:text-red-500">Problemas crônicos ativos</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {problemas.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum problema crônico registrado.
          </p>
        ) : (
          <ul className="space-y-3">
            {problemas.map((p) => (
              <li
                key={p.id}
                className="rounded-lg border border-red-200/60 bg-red-50/50 p-3 dark:border-red-500/40 dark:bg-red-500/10"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-red-900 dark:text-red-500">
                      {p.veiculo.placa} — {p.veiculo.marca} {p.veiculo.modelo}
                    </p>
                    <p className="mt-1 text-sm text-red-800 dark:text-red-500/90">
                      {p.descricao}
                    </p>
                  </div>
                  <Badge
                    className={`shrink-0 ${GRAVIDADE_STYLE[p.gravidade]}`}
                  >
                    {GRAVIDADE_LABEL[p.gravidade]}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
