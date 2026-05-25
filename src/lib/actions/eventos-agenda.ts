"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, hasPermission } from "@/lib/auth";
import { eventoAgendaSchema } from "@/lib/validations/evento-agenda";

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

async function assertLocacaoAccess() {
  const user = await requireAuth();
  if (!hasPermission(user.role, "locacoes")) {
    throw new Error("Sem permissão para gerenciar a agenda");
  }
  return user;
}

export async function createEventoAgenda(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    await assertLocacaoAccess();
    const parsed = eventoAgendaSchema.safeParse({
      titulo: formData.get("titulo"),
      descricao: formData.get("descricao") || undefined,
      dataInicio: formData.get("dataInicio"),
      dataFim: formData.get("dataFim") || undefined,
      tipo: formData.get("tipo"),
      valor: formData.get("valor") || undefined,
      veiculoId: formData.get("veiculoId") || undefined,
      clienteId: formData.get("clienteId") || undefined,
      locacaoId: formData.get("locacaoId") || undefined,
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Dados inválidos",
      };
    }

    const { valor, veiculoId, clienteId, locacaoId, ...rest } = parsed.data;

    const evento = await prisma.eventoAgenda.create({
      data: {
        ...rest,
        valor: valor ?? undefined,
        veiculoId: veiculoId || null,
        clienteId: clienteId || null,
        locacaoId: locacaoId || null,
      },
    });

    revalidatePath("/locacoes");
    return { success: true, data: { id: evento.id } };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao criar lembrete",
    };
  }
}

export async function toggleEventoConcluido(
  id: string,
  concluido: boolean
): Promise<ActionResult> {
  try {
    await assertLocacaoAccess();
    await prisma.eventoAgenda.update({
      where: { id },
      data: { concluido },
    });
    revalidatePath("/locacoes");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao atualizar",
    };
  }
}

export async function deleteEventoAgenda(id: string): Promise<ActionResult> {
  try {
    await assertLocacaoAccess();
    await prisma.eventoAgenda.delete({ where: { id } });
    revalidatePath("/locacoes");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erro ao excluir",
    };
  }
}
