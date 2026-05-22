"use server";

import { redirect } from "next/navigation";
import {
  createVeiculo,
  updateVeiculo,
  createProblemaCronico,
} from "@/lib/actions/veiculos";
import {
  createManutencao,
  createTipoManutencao,
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
