"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { exigirPermissao, exigirUsuario } from "@/lib/autorizacao";

const merchanSchema = z.object({
  data: z.string().date("Data inválida"),
  distribuidoraId: z.string().nullable().optional(),
  estabelecimentoId: z.string().nullable().optional(),
  estabelecimentoAvulso: z.string().nullable().optional(),
  observacao: z.string().optional(),
});

export async function criarMerchan(formData: FormData) {
  await exigirPermissao("MUTAR_MERCHAN");
  const dados = merchanSchema.parse({
    data: formData.get("data"),
    distribuidoraId: formData.get("distribuidoraId") || null,
    estabelecimentoId: formData.get("estabelecimentoId") || null,
    estabelecimentoAvulso: formData.get("estabelecimentoAvulso") || null,
    observacao: formData.get("observacao") || undefined,
  });

  await prisma.registroMerchan.create({ data: { ...dados, data: new Date(dados.data) } });
  revalidatePath("/merchan");
}

export async function listarMerchan() {
  await exigirUsuario();
  return prisma.registroMerchan.findMany({
    include: { distribuidora: true, estabelecimento: true },
    orderBy: { data: "desc" },
  });
}
