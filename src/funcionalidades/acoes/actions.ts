"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const acaoSchema = z.object({
  titulo: z.string().min(1, "Título obrigatório"),
  data: z.string().date("Data inválida"),
  horario: z.string().regex(/^\d{2}:\d{2}$/, "Horário inválido"),
  status: z.enum(["aberta", "encerrada", "cancelada"]),
  distribuidoraId: z.string().nullable().optional(),
  estabelecimentoId: z.string().nullable().optional(),
  estabelecimentoAvulso: z.string().nullable().optional(),
});

export async function criarAcao(formData: FormData) {
  const dados = acaoSchema.parse({
    titulo: formData.get("titulo"),
    data: formData.get("data"),
    horario: formData.get("horario"),
    status: formData.get("status"),
    distribuidoraId: formData.get("distribuidoraId") || null,
    estabelecimentoId: formData.get("estabelecimentoId") || null,
    estabelecimentoAvulso: formData.get("estabelecimentoAvulso") || null,
  });

  await prisma.acao.create({
    data: {
      ...dados,
      data: new Date(dados.data),
    },
  });

  revalidatePath("/acoes");
  revalidatePath("/");
  redirect("/acoes");
}

export async function atualizarAcao(id: string, formData: FormData) {
  const dados = acaoSchema.parse({
    titulo: formData.get("titulo"),
    data: formData.get("data"),
    horario: formData.get("horario"),
    status: formData.get("status"),
    distribuidoraId: formData.get("distribuidoraId") || null,
    estabelecimentoId: formData.get("estabelecimentoId") || null,
    estabelecimentoAvulso: formData.get("estabelecimentoAvulso") || null,
  });
  await prisma.acao.update({ where: { id }, data: { ...dados, data: new Date(dados.data) } });
  revalidatePath("/acoes");
  revalidatePath(`/acoes/${id}`);
  revalidatePath("/");
  redirect(`/acoes/${id}`);
}

export async function atualizarStatusAcao(id: string, status: "aberta" | "encerrada" | "cancelada") {
  await prisma.acao.update({ where: { id }, data: { status } });
  revalidatePath("/acoes");
  revalidatePath(`/acoes/${id}`);
  revalidatePath("/");
}

export async function excluirAcao(id: string) {
  await prisma.acao.delete({ where: { id } });
  revalidatePath("/acoes");
  revalidatePath("/");
  redirect("/acoes");
}
