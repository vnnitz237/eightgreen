"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { exigirPermissao, exigirUsuario } from "@/lib/autorizacao";

const compromissoSchema = z.object({
  titulo: z.string().min(1, "Título obrigatório"),
  inicio: z.string().datetime({ offset: true }),
  fim: z.string().datetime({ offset: true }),
  diaInteiro: z.coerce.boolean().default(false),
});

export async function criarCompromisso(formData: FormData) {
  await exigirPermissao("MUTAR_PESSOAL");
  const dados = compromissoSchema.parse({
    titulo: formData.get("titulo"),
    inicio: formData.get("inicio"),
    fim: formData.get("fim"),
    diaInteiro: formData.get("diaInteiro") === "true",
  });

  await prisma.compromisso.create({
    data: {
      titulo: dados.titulo,
      inicio: new Date(dados.inicio),
      fim: new Date(dados.fim),
      diaInteiro: dados.diaInteiro,
    },
  });
  revalidatePath("/pessoal/agenda");
  revalidatePath("/agenda");
}

export async function listarCompromissos() {
  await exigirUsuario();
  return prisma.compromisso.findMany({ orderBy: { inicio: "asc" } });
}

const rotaSchema = z.object({
  descricao: z.string().min(1, "Descrição obrigatória"),
  data: z.string().date("Data inválida"),
});

export async function criarRota(formData: FormData) {
  await exigirPermissao("MUTAR_PESSOAL");
  const dados = rotaSchema.parse({
    descricao: formData.get("descricao"),
    data: formData.get("data"),
  });

  await prisma.rota.create({ data: { ...dados, data: new Date(dados.data) } });
  revalidatePath("/pessoal/rotas");
}

export async function listarRotas() {
  await exigirUsuario();
  return prisma.rota.findMany({ orderBy: { data: "desc" } });
}
