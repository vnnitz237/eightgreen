"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { exigirUsuario } from "@/lib/autorizacao";
import type { CalendarEvent } from "@/types/agenda";

const CORES_TIPO: Record<string, string> = {
  REUNIAO: "#4f46e5",
  VISITA: "#0891b2",
  ENTREGA: "#16a34a",
  DEGUSTACAO: "#d97706",
  OUTRO: "#6b7280",
};

const compromissoSchema = z.object({
  titulo: z.string().min(1, "Título obrigatório"),
  tipo: z.enum(["REUNIAO", "VISITA", "ENTREGA", "DEGUSTACAO", "OUTRO"]),
  inicio: z.string().min(1, "Data início obrigatória"),
  fim: z.string().min(1, "Data fim obrigatória"),
  diaInteiro: z.coerce.boolean().default(false),
  observacoes: z.string().optional(),
  estabelecimentoId: z.string().optional(),
  acaoId: z.string().optional(),
  responsavelId: z.string().optional(),
});

export async function listarEventosCalendario(de: string, ate: string): Promise<CalendarEvent[]> {
  await exigirUsuario();
  const eventos = await prisma.compromisso.findMany({
    where: {
      inicio: { gte: new Date(de) },
      fim: { lte: new Date(ate) },
    },
    include: {
      estabelecimento: { select: { id: true, razaoSocial: true } },
      acao: { select: { id: true, numero: true } },
      responsavel: { select: { id: true, name: true } },
    },
    orderBy: { inicio: "asc" },
  });

  return eventos.map((e) => ({
    id: e.id,
    title: e.titulo,
    start: e.inicio.toISOString(),
    end: e.fim.toISOString(),
    allDay: e.diaInteiro,
    color: CORES_TIPO[e.tipo] ?? CORES_TIPO.OUTRO,
    extendedProps: {
      tipo: e.tipo,
      observacoes: e.observacoes,
      estabelecimentoId: e.estabelecimentoId,
      estabelecimentoNome: e.estabelecimento?.razaoSocial ?? null,
      acaoId: e.acaoId,
      acaoNumero: e.acao?.numero ?? null,
      responsavelId: e.responsavelId,
      responsavelNome: e.responsavel?.name ?? null,
    },
  }));
}

export async function criarCompromisso(
  dados: z.infer<typeof compromissoSchema>
): Promise<{ ok: true; id: string } | { ok: false; erro: string }> {
  try {
    await exigirUsuario();
    const parsed = compromissoSchema.parse(dados);
    const criado = await prisma.compromisso.create({
      data: {
        titulo: parsed.titulo,
        tipo: parsed.tipo,
        inicio: new Date(parsed.inicio),
        fim: new Date(parsed.fim),
        diaInteiro: parsed.diaInteiro,
        observacoes: parsed.observacoes || null,
        estabelecimentoId: parsed.estabelecimentoId || null,
        acaoId: parsed.acaoId || null,
        responsavelId: parsed.responsavelId || null,
      },
    });
    revalidatePath("/agenda");
    revalidatePath("/pessoal/agenda");
    return { ok: true, id: criado.id };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) return { ok: false, erro: err.issues[0]?.message ?? "Dados inválidos." };
    return { ok: false, erro: "Erro ao criar compromisso." };
  }
}

export async function editarCompromisso(
  id: string,
  dados: z.infer<typeof compromissoSchema>
): Promise<{ ok: true } | { ok: false; erro: string }> {
  try {
    await exigirUsuario();
    const parsed = compromissoSchema.parse(dados);
    await prisma.compromisso.update({
      where: { id },
      data: {
        titulo: parsed.titulo,
        tipo: parsed.tipo,
        inicio: new Date(parsed.inicio),
        fim: new Date(parsed.fim),
        diaInteiro: parsed.diaInteiro,
        observacoes: parsed.observacoes || null,
        estabelecimentoId: parsed.estabelecimentoId || null,
        acaoId: parsed.acaoId || null,
        responsavelId: parsed.responsavelId || null,
      },
    });
    revalidatePath("/agenda");
    revalidatePath("/pessoal/agenda");
    return { ok: true };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) return { ok: false, erro: err.issues[0]?.message ?? "Dados inválidos." };
    return { ok: false, erro: "Erro ao editar compromisso." };
  }
}

export async function excluirCompromisso(id: string): Promise<{ ok: true } | { ok: false; erro: string }> {
  try {
    await exigirUsuario();
    await prisma.compromisso.delete({ where: { id } });
    revalidatePath("/agenda");
    revalidatePath("/pessoal/agenda");
    return { ok: true };
  } catch {
    return { ok: false, erro: "Erro ao excluir compromisso." };
  }
}

export async function buscarCompromisso(id: string) {
  await exigirUsuario();
  return prisma.compromisso.findUnique({
    where: { id },
    include: {
      estabelecimento: { select: { id: true, razaoSocial: true } },
      acao: { select: { id: true, numero: true } },
      responsavel: { select: { id: true, name: true } },
    },
  });
}
