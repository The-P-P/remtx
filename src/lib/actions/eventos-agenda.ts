"use server";

import { friendlyErrorMessage } from "@/lib/errors/friendly-message";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/auth";
import { requireTenant } from "@/lib/tenant";
import { eventoAgendaSchema } from "@/lib/validations/evento-agenda";

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

async function assertLocacaoAccess() {
  const tenant = await requireTenant();
  if (!hasPermission(tenant.role, "locacoes")) {
    throw new Error("Sem permissão para gerenciar a agenda");
  }
  return tenant;
}

export async function createEventoAgenda(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const tenant = await assertLocacaoAccess();
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
        locadoraId: tenant.locadoraId,
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
      error: friendlyErrorMessage(e, "Erro ao criar lembrete"),
    };
  }
}

export async function toggleEventoConcluido(
  id: string,
  concluido: boolean
): Promise<ActionResult> {
  try {
    const tenant = await assertLocacaoAccess();
    const existente = await prisma.eventoAgenda.findFirst({
      where: { id, locadoraId: tenant.locadoraId },
      select: { id: true },
    });
    if (!existente) {
      return { success: false, error: "Evento não encontrado" };
    }
    await prisma.eventoAgenda.update({
      where: { id },
      data: { concluido },
    });
    revalidatePath("/locacoes");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: friendlyErrorMessage(e, "Erro ao atualizar"),
    };
  }
}

export async function updateEventoAgenda(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const tenant = await assertLocacaoAccess();

    const existente = await prisma.eventoAgenda.findFirst({
      where: { id, locadoraId: tenant.locadoraId },
    });
    if (!existente) {
      return { success: false, error: "Tarefa não encontrada" };
    }

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

    await prisma.eventoAgenda.update({
      where: { id },
      data: {
        ...rest,
        valor: valor ?? null,
        veiculoId: veiculoId || null,
        clienteId: clienteId || null,
        locacaoId: locacaoId || null,
      },
    });

    revalidatePath("/locacoes");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: friendlyErrorMessage(e, "Erro ao atualizar tarefa"),
    };
  }
}

export async function deleteEventoAgenda(id: string): Promise<ActionResult> {
  try {
    const tenant = await assertLocacaoAccess();
    const existente = await prisma.eventoAgenda.findFirst({
      where: { id, locadoraId: tenant.locadoraId },
      select: { id: true },
    });
    if (!existente) {
      return { success: false, error: "Tarefa não encontrada" };
    }
    await prisma.eventoAgenda.delete({ where: { id } });
    revalidatePath("/locacoes");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: friendlyErrorMessage(e, "Erro ao excluir"),
    };
  }
}
