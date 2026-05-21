import { AlertOctagon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GravidadeProblema } from "@/types/prisma";

interface ProblemaItem {
  id: string;
  descricao: string;
  gravidade: GravidadeProblema;
  veiculo: { placa: string; marca: string; modelo: string };
}

const GRAVIDADE_STYLE: Record<
  GravidadeProblema,
  { label: string; className: string }
> = {
  LEVE: { label: "Leve", className: "bg-slate-100 text-slate-700" },
  MEDIA: { label: "Média", className: "bg-amber-100 text-amber-800" },
  GRAVE: { label: "Grave", className: "bg-red-100 text-red-800" },
};

export function ProblemasCronicos({ problemas }: { problemas: ProblemaItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertOctagon className="size-4 text-red-500" />
          Problemas crônicos ativos
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
                className="rounded-lg border border-red-100 bg-red-50/50 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-red-900">
                      {p.veiculo.placa} — {p.veiculo.marca} {p.veiculo.modelo}
                    </p>
                    <p className="mt-1 text-sm text-red-800">{p.descricao}</p>
                  </div>
                  <Badge className={GRAVIDADE_STYLE[p.gravidade].className}>
                    {GRAVIDADE_STYLE[p.gravidade].label}
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
