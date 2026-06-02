import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { montarDadosContrato } from "@/lib/contratos/dados-contrato";
import { renderContratoPdfBuffer } from "@/lib/contratos/pdf/render-contrato";
import { friendlyErrorMessage } from "@/lib/errors/friendly-message";
import type { DadosContratoSnapshot } from "@/lib/contratos/types";

function contratoErroHtml(mensagem: string, status: number) {
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Não foi possível gerar o contrato</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 28rem; margin: 4rem auto; padding: 0 1.5rem; color: #1a1a1a; }
    h1 { font-size: 1.125rem; color: #b91c1c; }
    p { line-height: 1.5; color: #525252; }
    a { color: #2563eb; }
  </style>
</head>
<body>
  <h1>Não foi possível gerar o contrato</h1>
  <p>${mensagem.replace(/</g, "&lt;")}</p>
  <p><a href="javascript:history.back()">Voltar</a></p>
</body>
</html>`;
  return new NextResponse(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return contratoErroHtml("Faça login para baixar o contrato.", 401);
    }

    const { id } = await params;
    const locacao = await prisma.locacao.findUnique({
      where: { id },
      select: {
        numeroContrato: true,
        contrato: { select: { numero: true, dadosSnapshot: true } },
      },
    });

    if (!locacao) {
      return contratoErroHtml("Locação não encontrada.", 404);
    }

    const numero =
      locacao.contrato?.numero ??
      locacao.numeroContrato ??
      `TMP-${id.slice(0, 8)}`;
    const dados =
      locacao.contrato?.dadosSnapshot != null
        ? (locacao.contrato.dadosSnapshot as DadosContratoSnapshot)
        : await montarDadosContrato(id, numero);
    const buffer = await renderContratoPdfBuffer(dados);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="contrato-${numero}.pdf"`,
      },
    });
  } catch (e) {
    console.error(e);
    return contratoErroHtml(
      friendlyErrorMessage(
        e,
        "Não foi possível gerar o PDF do contrato. Tente regenerar o contrato na página da locação."
      ),
      500
    );
  }
}
