"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const merchanSchema = z.object({
  data: z.string().date("Data inválida"),
  distribuidoraId: z.string().nullable().optional(),
  estabelecimentoId: z.string().nullable().optional(),
  estabelecimentoAvulso: z.string().nullable().optional(),
  observacao: z.string().optional(),
});

export async function criarMerchan(formData: FormData) {
  const dados = merchanSchema.parse({
    data: formData.get("data"),
    distribuidoraId: formData.get("distribuidoraId") || null,
    estabelecimentoId: formData.get("estabelecimentoId") || null,
    estabelecimentoAvulso: formData.get("estabelecimentoAvulso") || null,
    observacao: formData.get("observacao") || undefined,
  });

  await prisma.merchan.create({ data: { ...dados, data: new Date(dados.data) } });
  revalidatePath("/merchan");
}

export async function listarMerchan() {
  return prisma.merchan.findMany({
    include: { distribuidora: true, estabelecimento: true },
    orderBy: { data: "desc" },
  });
}
