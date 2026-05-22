"use server";

import { redirect } from "next/navigation";
import {
  createVeiculo,
  updateVeiculo,
  deleteVeiculo,
  createProblemaCronico,
} from "@/lib/actions/veiculos";
import {
  createManutencao,
  updateManutencao,
  deleteManutencao,
  createTipoManutencao,
  updateTipoManutencao,
  deleteTipoManutencao,
} from "@/lib/actions/manutencoes";
import type { FormState } from "@/types/form";

export async function submitNovoVeiculo(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const result = await createVeiculo(formData);
  if (result.success && result.data) {
    redirect(`/veiculos/${result.data.id}`);
  }
  return {
    success: false,
    error: !result.success ? result.error : "Erro ao cadastrar",
  };
}

export async function submitEditarVeiculo(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const result = await updateVeiculo(id, formData);
  if (result.success) {
    redirect(`/veiculos/${id}`);
  }
  return {
    success: false,
    error: !result.success ? result.error : "Erro ao salvar",
  };
}

export async function submitProblemaCronico(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const result = await createProblemaCronico(formData);
  if (result.success) return { success: true };
  return {
    success: false,
    error: !result.success ? result.error : "Erro",
  };
}

export async function submitNovaManutencao(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const result = await createManutencao(formData);
  if (result.success) {
    redirect("/manutencoes");
  }
  return {
    success: false,
    error: !result.success ? result.error : "Erro ao registrar",
  };
}

export async function deleteVeiculoAction(id: string) {
  const result = await deleteVeiculo(id);
  if (result.success) {
    redirect("/veiculos");
  }
  throw new Error(!result.success ? result.error : "Erro ao excluir");
}

export async function deleteManutencaoAction(id: string) {
  const result = await deleteManutencao(id);
  if (result.success) {
    redirect("/manutencoes");
  }
  throw new Error(!result.success ? result.error : "Erro ao excluir");
}

export async function submitEditarManutencao(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const result = await updateManutencao(id, formData);
  if (result.success) {
    redirect("/manutencoes");
  }
  return {
    success: false,
    error: !result.success ? result.error : "Erro ao salvar",
  };
}

export async function submitNovoTipoManutencao(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const result = await createTipoManutencao(formData);
  if (result.success) {
    redirect("/manutencoes");
  }
  return {
    success: false,
    error: !result.success ? result.error : "Erro ao criar tipo",
  };
}

export async function submitEditarTipoManutencao(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const result = await updateTipoManutencao(id, formData);
  if (result.success) {
    redirect("/manutencoes");
  }
  return {
    success: false,
    error: !result.success ? result.error : "Erro ao atualizar tipo",
  };
}

export async function deleteTipoManutencaoAction(id: string) {
  const result = await deleteTipoManutencao(id);
  if (result.success) {
    redirect("/manutencoes");
  }
  throw new Error(!result.success ? result.error : "Erro ao excluir");
}
