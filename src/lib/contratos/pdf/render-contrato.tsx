import { renderToBuffer } from "@react-pdf/renderer";
import type { DadosContratoSnapshot } from "@/lib/contratos/types";
import { DocumentoContratoPadrao } from "@/lib/contratos/pdf/documento-padrao";
import { DocumentoContratoPlanoConquista } from "@/lib/contratos/pdf/documento-plano-conquista";

export async function renderContratoPdfBuffer(
  dados: DadosContratoSnapshot
): Promise<Buffer> {
  const doc =
    dados.modelo === "PLANO_CONQUISTA" ? (
      <DocumentoContratoPlanoConquista dados={dados} />
    ) : (
      <DocumentoContratoPadrao dados={dados} />
    );

  const buf = await renderToBuffer(doc);
  return Buffer.from(buf);
}
