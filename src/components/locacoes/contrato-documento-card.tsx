"use client";

import Link from "next/link";
import { FileDown, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MODELO_CONTRATO_LABEL } from "@/lib/constants/enums";
import { regenerarContratoLocacao } from "@/lib/actions/contratos";
import { useTransition } from "react";
import type { TipoModeloContrato } from "@/types/prisma";

type Props = {
  locacaoId: string;
  numero?: string | null;
  modelo: TipoModeloContrato;
  geradoEm?: Date | null;
};

export function ContratoDocumentoCard({
  locacaoId,
  numero,
  modelo,
  geradoEm,
}: Props) {
  const [pending, start] = useTransition();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Documento do contrato</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Nº:</span>{" "}
            {numero ?? "—"}
          </p>
          <p>
            <span className="font-medium text-foreground">Modelo:</span>{" "}
            {MODELO_CONTRATO_LABEL[modelo]}
          </p>
          {geradoEm && (
            <p>
              <span className="font-medium text-foreground">Gerado em:</span>{" "}
              {format(geradoEm, "dd/MM/yyyy HH:mm", { locale: ptBR })}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            render={
              <a
                href={`/api/locacoes/${locacaoId}/contrato`}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <FileDown className="size-4" />
            Baixar PDF
          </Button>
          <Button
            size="sm"
            variant="outline"
            render={
              <Link
                href={
                  modelo === "PLANO_CONQUISTA"
                    ? "/contratos/modelos/plano-conquista.pdf"
                    : "/contratos/modelos/padrao-ednaldo.docx"
                }
                target="_blank"
              />
            }
          >
            Modelo original
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() =>
              start(async () => {
                await regenerarContratoLocacao(locacaoId);
              })
            }
          >
            <RefreshCw className="size-4" />
            Atualizar documento
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
