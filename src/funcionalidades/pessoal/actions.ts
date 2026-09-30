"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const compromissoSchema = z.object({
  titulo: z.string().min(1, "Título obrigatório"),
  data: z.string().date("Data inválida"),
  horario: z.string().optional(),
  privado: z.coerce.boolean().default(true),
});

export async function criarCompromisso(formData: FormData) {
  const dados = compromissoSchema.parse({
    titulo: formData.get("titulo"),
    data: formData.get("data"),
    horario: formData.get("horario") || undefined,
    privado: formData.get("privado") !== "false",
  });

  await prisma.compromisso.create({ data: { ...dados, data: new Date(dados.data) } });
  revalidatePath("/pessoal/agenda");
}

export async function listarCompromissos() {
  return prisma.compromisso.findMany({ orderBy: { data: "asc" } });
}

const rotaSchema = z.object({
  descricao: z.string().min(1, "Descrição obrigatória"),
  data: z.string().date("Data inválida"),
});

export async function criarRota(formData: FormData) {
  const dados = rotaSchema.parse({
    descricao: formData.get("descricao"),
    data: formData.get("data"),
  });

  await prisma.rota.create({ data: { ...dados, data: new Date(dados.data) } });
  revalidatePath("/pessoal/rotas");
}

export async function listarRotas() {
  return prisma.rota.findMany({ orderBy: { data: "desc" } });
}
