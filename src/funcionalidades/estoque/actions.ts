"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const movimentacaoSchema = z.object({
  produtoId: z.string().min(1, "Produto obrigatório"),
  tipo: z.enum(["entrada", "saida", "ajuste"]),
  quantidade: z.coerce.number().int().positive("Quantidade deve ser positiva"),
  observacao: z.string().optional(),
});

export async function registrarMovimentacao(formData: FormData) {
  const dados = movimentacaoSchema.parse({
    produtoId: formData.get("produtoId"),
    tipo: formData.get("tipo"),
    quantidade: formData.get("quantidade"),
    observacao: formData.get("observacao") || undefined,
  });

  await prisma.movimentacaoEstoque.create({ data: dados });
  revalidatePath("/estoque/saldo");
  revalidatePath("/estoque/entradas");
  revalidatePath("/estoque/saidas");
  revalidatePath("/");
}
