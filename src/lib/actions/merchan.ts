"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { exigirPermissao } from "@/lib/autorizacao";

// ─── Merchan ────────────────────────────────────────────────────────────────

const schemaMerchan = z.object({
  estabelecimentoId: z.string().min(1, "Estabelecimento obrigatório"),
  promotorId: z.string().optional(),
  data: z.string().min(1, "Data obrigatória"),
  horaEntrada: z.string().optional(),
  horaSaida: z.string().optional(),
  latEntrada: z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().optional()),
  lngEntrada: z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().optional()),
  latSaida: z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().optional()),
  lngSaida: z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().optional()),
  checklistOk: z.preprocess((v) => v === "true" || v === "on", z.boolean()),
  observacoes: z.string().optional(),
});

function orNull<T>(v: T | undefined): T | null {
  return v ?? null;
}

export async function listarMerchan(opts?: { busca?: string; pagina?: number }) {
  await exigirPermissao("MUTAR_MERCHAN");
  const pagina = opts?.pagina ?? 1;
  const pageSize = 20;
  const where = opts?.busca
    ? {
        OR: [
          { estabelecimento: { razaoSocial: { contains: opts.busca, mode: "insensitive" as const } } },
          { promotor: { name: { contains: opts.busca, mode: "insensitive" as const } } },
        ],
      }
    : {};

  const [visitas, total] = await prisma.$transaction([
    prisma.merchan.findMany({
      where,
      include: {
        estabelecimento: { select: { id: true, razaoSocial: true } },
        promotor: { select: { id: true, name: true } },
      },
      orderBy: [{ data: "desc" }, { criadoEm: "desc" }],
      skip: (pagina - 1) * pageSize,
      take: pageSize,
    }),
    prisma.merchan.count({ where }),
  ]);

  return { visitas, total, paginas: Math.ceil(total / pageSize) };
}

export async function obterMerchan(id: string) {
  await exigirPermissao("MUTAR_MERCHAN");
  return prisma.merchan.findUnique({
    where: { id },
    include: {
      estabelecimento: true,
      promotor: { select: { id: true, name: true } },
      rotaParada: { include: { rota: { select: { id: true, nome: true, descricao: true } } } },
    },
  });
}

export async function criarMerchan(formData: FormData) {
  await exigirPermissao("MUTAR_MERCHAN");
  const raw = Object.fromEntries(formData);
  const parse = schemaMerchan.safeParse(raw);
  if (!parse.success) return { ok: false, erro: parse.error.issues[0]?.message ?? "Dados inválidos" };

  const d = parse.data;
  const fotos = formData.getAll("fotos").filter((v) => typeof v === "string" && v.startsWith("http")) as string[];
  const visita = await prisma.merchan.create({
    data: {
      data: new Date(d.data),
      estabelecimentoId: orNull(d.estabelecimentoId),
      promotorId: orNull(d.promotorId),
      horaEntrada: orNull(d.horaEntrada),
      horaSaida: orNull(d.horaSaida),
      latEntrada: d.latEntrada ?? null,
      lngEntrada: d.lngEntrada ?? null,
      latSaida: d.latSaida ?? null,
      lngSaida: d.lngSaida ?? null,
      checklistOk: d.checklistOk,
      observacoes: orNull(d.observacoes),
      fotos,
    },
  });

  revalidatePath("/merchan");
  return { ok: true, id: visita.id };
}

export async function editarMerchan(id: string, formData: FormData) {
  await exigirPermissao("MUTAR_MERCHAN");
  const raw = Object.fromEntries(formData);
  const parse = schemaMerchan.safeParse(raw);
  if (!parse.success) return { ok: false, erro: parse.error.issues[0]?.message ?? "Dados inválidos" };

  const d = parse.data;
  const fotos = formData.getAll("fotos").filter((v) => typeof v === "string" && v.startsWith("http")) as string[];
  await prisma.merchan.update({
    where: { id },
    data: {
      data: new Date(d.data),
      estabelecimentoId: orNull(d.estabelecimentoId),
      promotorId: orNull(d.promotorId),
      horaEntrada: orNull(d.horaEntrada),
      horaSaida: orNull(d.horaSaida),
      latEntrada: d.latEntrada ?? null,
      lngEntrada: d.lngEntrada ?? null,
      latSaida: d.latSaida ?? null,
      lngSaida: d.lngSaida ?? null,
      checklistOk: d.checklistOk,
      observacoes: orNull(d.observacoes),
      fotos,
    },
  });

  revalidatePath("/merchan");
  revalidatePath(`/merchan/${id}`);
  return { ok: true };
}

// ─── Rotas ──────────────────────────────────────────────────────────────────

const schemaRota = z.object({
  nome: z.string().min(1, "Nome obrigatório"),
  descricao: z.string().optional(),
  data: z.string().min(1, "Data obrigatória"),
  promotorId: z.string().optional(),
  observacoes: z.string().optional(),
});

export async function listarRotas(opts?: { busca?: string; pagina?: number }) {
  await exigirPermissao("MUTAR_PESSOAL");
  const pagina = opts?.pagina ?? 1;
  const pageSize = 20;
  const where = opts?.busca
    ? {
        OR: [
          { nome: { contains: opts.busca, mode: "insensitive" as const } },
          { descricao: { contains: opts.busca, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [rotas, total] = await prisma.$transaction([
    prisma.rota.findMany({
      where,
      include: {
        promotor: { select: { id: true, name: true } },
        paradas: {
          include: { estabelecimento: { select: { id: true, razaoSocial: true } } },
          orderBy: { ordem: "asc" },
        },
      },
      orderBy: [{ data: "desc" }, { criadoEm: "desc" }],
      skip: (pagina - 1) * pageSize,
      take: pageSize,
    }),
    prisma.rota.count({ where }),
  ]);

  return { rotas, total, paginas: Math.ceil(total / pageSize) };
}

export async function obterRota(id: string) {
  await exigirPermissao("MUTAR_PESSOAL");
  return prisma.rota.findUnique({
    where: { id },
    include: {
      promotor: { select: { id: true, name: true } },
      responsavel: { select: { id: true, name: true } },
      paradas: {
        include: {
          estabelecimento: true,
          merchan: { select: { id: true, horaEntrada: true, horaSaida: true, checklistOk: true } },
        },
        orderBy: { ordem: "asc" },
      },
    },
  });
}

export async function criarRota(formData: FormData) {
  await exigirPermissao("MUTAR_PESSOAL");
  const raw = Object.fromEntries(formData);
  const parse = schemaRota.safeParse(raw);
  if (!parse.success) return { ok: false, erro: parse.error.issues[0]?.message ?? "Dados inválidos" };

  const d = parse.data;
  const paradas = JSON.parse((raw.paradas as string) || "[]") as { estabelecimentoId: string; ordem: number }[];

  const rota = await prisma.rota.create({
    data: {
      nome: d.nome,
      descricao: d.descricao ?? "",
      data: new Date(d.data),
      promotorId: orNull(d.promotorId),
      observacoes: orNull(d.observacoes),
      paradas: {
        create: paradas.map((p) => ({
          ordem: p.ordem,
          estabelecimentoId: p.estabelecimentoId,
        })),
      },
    },
  });

  revalidatePath("/rotas");
  return { ok: true, id: rota.id };
}

export async function editarRota(id: string, formData: FormData) {
  await exigirPermissao("MUTAR_PESSOAL");
  const raw = Object.fromEntries(formData);
  const parse = schemaRota.safeParse(raw);
  if (!parse.success) return { ok: false, erro: parse.error.issues[0]?.message ?? "Dados inválidos" };

  const d = parse.data;
  const paradas = JSON.parse((raw.paradas as string) || "[]") as { estabelecimentoId: string; ordem: number }[];

  await prisma.$transaction([
    prisma.rotaParada.deleteMany({ where: { rotaId: id } }),
    prisma.rota.update({
      where: { id },
      data: {
        nome: d.nome,
        descricao: d.descricao ?? "",
        data: new Date(d.data),
        promotorId: orNull(d.promotorId),
        observacoes: orNull(d.observacoes),
        paradas: {
          create: paradas.map((p) => ({
            ordem: p.ordem,
            estabelecimentoId: p.estabelecimentoId,
          })),
        },
      },
    }),
  ]);

  revalidatePath("/rotas");
  revalidatePath(`/rotas/${id}`);
  return { ok: true };
}

export async function atualizarStatusRota(id: string, status: "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDA" | "CANCELADA") {
  await exigirPermissao("MUTAR_PESSOAL");
  await prisma.rota.update({ where: { id }, data: { status } });
  revalidatePath("/rotas");
  revalidatePath(`/rotas/${id}`);
  return { ok: true };
}

export async function marcarParadaVisitada(paradaId: string, visitado: boolean) {
  await exigirPermissao("MUTAR_PESSOAL");
  const parada = await prisma.rotaParada.update({ where: { id: paradaId }, data: { visitado } });
  revalidatePath(`/rotas/${parada.rotaId}`);
  return { ok: true };
}
