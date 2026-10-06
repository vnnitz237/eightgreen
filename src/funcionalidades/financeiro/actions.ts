"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { exigirPermissao } from "@/lib/autorizacao";

const contaSchema = z.object({
  descricao: z.string().min(1, "Descrição obrigatória"),
  valor: z.coerce.number().positive("Valor deve ser positivo"),
  tipo: z.enum(["pagar", "receber", "despesa"]),
  vencimento: z.string().date("Data inválida"),
});

export async function criarConta(formData: FormData) {
  await exigirPermissao("MUTAR_FINANCEIRO");
  const dados = contaSchema.parse({
    descricao: formData.get("descricao"),
    valor: formData.get("valor"),
    tipo: formData.get("tipo"),
    vencimento: formData.get("vencimento"),
  });

  await prisma.contaFinanceira.create({
    data: { ...dados, vencimento: new Date(dados.vencimento) },
  });

  revalidatePath("/financeiro/conta-corrente");
  revalidatePath("/financeiro/a-pagar");
  revalidatePath("/financeiro/a-receber");
}

export async function marcarComoPago(id: string) {
  await exigirPermissao("MUTAR_FINANCEIRO");
  await prisma.contaFinanceira.update({ where: { id }, data: { pago: true } });
  revalidatePath("/financeiro/conta-corrente");
  revalidatePath("/financeiro/a-pagar");
  revalidatePath("/financeiro/a-receber");
}

const despesaSchema = z.object({
  descricao: z.string().min(1, "Descrição obrigatória"),
  valor: z.coerce.number().positive("Valor deve ser positivo"),
  data: z.string().date("Data inválida"),
});

export async function criarDespesa(formData: FormData) {
  await exigirPermissao("MUTAR_FINANCEIRO");
  const dados = despesaSchema.parse({
    descricao: formData.get("descricao"),
    valor: formData.get("valor"),
    data: formData.get("data"),
  });

  await prisma.despesaOperacional.create({
    data: { ...dados, data: new Date(dados.data) },
  });

  revalidatePath("/financeiro/despesas");
  revalidatePath("/financeiro/conta-corrente");
}
