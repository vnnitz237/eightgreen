"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { exigirPermissao } from "@/lib/autorizacao";

// ── Schemas ──────────────────────────────────────────────────────────────────

const cpSchema = z.object({
  descricao: z.string().min(1, "Descrição obrigatória"),
  categoria: z.string().optional(),
  valor: z.coerce.number().positive("Valor deve ser positivo"),
  emissao: z.string().date("Data de emissão inválida"),
  vencimento: z.string().date("Data de vencimento inválida"),
  favorecido: z.string().optional(),
  formaPagamento: z.string().optional(),
  bancoId: z.string().optional(),
  fornecedorId: z.string().optional(),
  acaoId: z.string().optional(),
});

const crSchema = z.object({
  descricao: z.string().min(1, "Descrição obrigatória"),
  categoria: z.string().optional(),
  valor: z.coerce.number().positive("Valor deve ser positivo"),
  emissao: z.string().date("Data de emissão inválida"),
  vencimento: z.string().date("Data de vencimento inválida"),
  formaPagamento: z.string().optional(),
  bancoId: z.string().optional(),
  estabelecimentoId: z.string().optional(),
  acaoId: z.string().optional(),
});

const lancamentoSchema = z.object({
  data: z.string().date("Data inválida"),
  historico: z.string().min(1, "Histórico obrigatório"),
  tipo: z.enum(["DEBITO", "CREDITO"]),
  valor: z.coerce.number().positive("Valor deve ser positivo"),
  bancoId: z.string().min(1, "Banco obrigatório"),
  contaPagarId: z.string().optional(),
  contaReceberId: z.string().optional(),
});

const viagemSchema = z.object({
  descricao: z.string().min(1, "Descrição obrigatória"),
  data: z.string().date("Data inválida"),
  destino: z.string().optional(),
  tipoDespesa: z.string().optional(),
  valor: z.coerce.number().positive("Valor deve ser positivo"),
  colaboradorId: z.string().optional(),
});

// ── Helpers ──────────────────────────────────────────────────────────────────

async function gerarNumeroCP() {
  const ym = new Date().toISOString().slice(0, 7).replace("-", "");
  const prefixo = `CP-${ym}-`;
  const ultimo = await prisma.contaPagar.findFirst({
    where: { numero: { startsWith: prefixo } },
    orderBy: { numero: "desc" },
    select: { numero: true },
  });
  const seq = ultimo?.numero ? Number(ultimo.numero.split("-").pop()) + 1 : 1;
  return `${prefixo}${String(seq).padStart(3, "0")}`;
}

async function gerarNumeroCR() {
  const ym = new Date().toISOString().slice(0, 7).replace("-", "");
  const prefixo = `CR-${ym}-`;
  const ultimo = await prisma.contaReceber.findFirst({
    where: { numero: { startsWith: prefixo } },
    orderBy: { numero: "desc" },
    select: { numero: true },
  });
  const seq = ultimo?.numero ? Number(ultimo.numero.split("-").pop()) + 1 : 1;
  return `${prefixo}${String(seq).padStart(3, "0")}`;
}

function orNull(v: string | undefined): string | null {
  return v && v.trim() ? v : null;
}

// ── ContaPagar ────────────────────────────────────────────────────────────────

export type CPInput = z.infer<typeof cpSchema>;

export async function criarContaPagar(formData: FormData): Promise<{ ok: true; id: string } | { ok: false; erro: string }> {
  try {
    await exigirPermissao("MUTAR_FINANCEIRO");
    const dados = cpSchema.parse({
      descricao: formData.get("descricao"),
      categoria: formData.get("categoria") || undefined,
      valor: formData.get("valor"),
      emissao: formData.get("emissao"),
      vencimento: formData.get("vencimento"),
      favorecido: formData.get("favorecido") || undefined,
      formaPagamento: formData.get("formaPagamento") || undefined,
      bancoId: formData.get("bancoId") || undefined,
      fornecedorId: formData.get("fornecedorId") || undefined,
      acaoId: formData.get("acaoId") || undefined,
    });
    const numero = await gerarNumeroCP();
    const cp = await prisma.contaPagar.create({
      data: {
        numero,
        descricao: dados.descricao,
        categoria: orNull(dados.categoria),
        valor: dados.valor,
        emissao: new Date(dados.emissao),
        vencimento: new Date(dados.vencimento),
        favorecido: orNull(dados.favorecido),
        formaPagamento: orNull(dados.formaPagamento),
        bancoId: orNull(dados.bancoId),
        fornecedorId: orNull(dados.fornecedorId),
        acaoId: orNull(dados.acaoId),
      },
    });
    revalidatePath("/financeiro/contas-pagar");
    revalidatePath("/financeiro/titulos");
    revalidatePath("/financeiro");
    return { ok: true, id: cp.id };
  } catch (e: unknown) {
    if (e instanceof z.ZodError) return { ok: false, erro: e.issues[0]?.message ?? "Erro de validação" };
    return { ok: false, erro: String(e) };
  }
}

export async function pagarContaPagar(id: string, dataPagamento: string): Promise<{ ok: true } | { ok: false; erro: string }> {
  try {
    await exigirPermissao("MUTAR_FINANCEIRO");
    await prisma.contaPagar.update({
      where: { id },
      data: { status: "PAGA", dataPagamento: new Date(dataPagamento) },
    });
    revalidatePath("/financeiro/contas-pagar");
    revalidatePath("/financeiro/titulos");
    revalidatePath("/financeiro");
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, erro: String(e) };
  }
}

export async function cancelarContaPagar(id: string): Promise<{ ok: true } | { ok: false; erro: string }> {
  try {
    await exigirPermissao("MUTAR_FINANCEIRO");
    await prisma.contaPagar.update({ where: { id }, data: { status: "CANCELADA" } });
    revalidatePath("/financeiro/contas-pagar");
    revalidatePath("/financeiro/titulos");
    revalidatePath("/financeiro");
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, erro: String(e) };
  }
}

export async function listarContasPagar(params: {
  status?: string;
  de?: string;
  ate?: string;
  busca?: string;
  pagina?: number;
}) {
  const { status, de, ate, busca, pagina = 1 } = params;
  const take = 20;
  const skip = (pagina - 1) * take;
  const where = {
    ...(status ? { status: status as "ABERTA" | "PAGA" | "CANCELADA" } : {}),
    ...(de || ate ? { vencimento: { ...(de ? { gte: new Date(de) } : {}), ...(ate ? { lte: new Date(ate) } : {}) } } : {}),
    ...(busca ? { OR: [{ descricao: { contains: busca, mode: "insensitive" as const } }, { numero: { contains: busca, mode: "insensitive" as const } }] } : {}),
  };
  const [contas, total] = await prisma.$transaction([
    prisma.contaPagar.findMany({
      where,
      include: { banco: { select: { nome: true } }, fornecedor: { select: { razaoSocial: true } } },
      orderBy: { vencimento: "asc" },
      take,
      skip,
    }),
    prisma.contaPagar.count({ where }),
  ]);
  return { contas, total, paginas: Math.ceil(total / take) };
}

// ── ContaReceber ──────────────────────────────────────────────────────────────

export async function criarContaReceber(formData: FormData): Promise<{ ok: true; id: string } | { ok: false; erro: string }> {
  try {
    await exigirPermissao("MUTAR_FINANCEIRO");
    const dados = crSchema.parse({
      descricao: formData.get("descricao"),
      categoria: formData.get("categoria") || undefined,
      valor: formData.get("valor"),
      emissao: formData.get("emissao"),
      vencimento: formData.get("vencimento"),
      formaPagamento: formData.get("formaPagamento") || undefined,
      bancoId: formData.get("bancoId") || undefined,
      estabelecimentoId: formData.get("estabelecimentoId") || undefined,
      acaoId: formData.get("acaoId") || undefined,
    });
    const numero = await gerarNumeroCR();
    const cr = await prisma.contaReceber.create({
      data: {
        numero,
        descricao: dados.descricao,
        categoria: orNull(dados.categoria),
        valor: dados.valor,
        emissao: new Date(dados.emissao),
        vencimento: new Date(dados.vencimento),
        formaPagamento: orNull(dados.formaPagamento),
        bancoId: orNull(dados.bancoId),
        estabelecimentoId: orNull(dados.estabelecimentoId),
        acaoId: orNull(dados.acaoId),
      },
    });
    revalidatePath("/financeiro/contas-receber");
    revalidatePath("/financeiro/titulos");
    revalidatePath("/financeiro");
    return { ok: true, id: cr.id };
  } catch (e: unknown) {
    if (e instanceof z.ZodError) return { ok: false, erro: e.issues[0]?.message ?? "Erro de validação" };
    return { ok: false, erro: String(e) };
  }
}

export async function receberContaReceber(id: string, dataRecebimento: string): Promise<{ ok: true } | { ok: false; erro: string }> {
  try {
    await exigirPermissao("MUTAR_FINANCEIRO");
    await prisma.contaReceber.update({
      where: { id },
      data: { status: "RECEBIDA", dataRecebimento: new Date(dataRecebimento) },
    });
    revalidatePath("/financeiro/contas-receber");
    revalidatePath("/financeiro/titulos");
    revalidatePath("/financeiro");
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, erro: String(e) };
  }
}

export async function cancelarContaReceber(id: string): Promise<{ ok: true } | { ok: false; erro: string }> {
  try {
    await exigirPermissao("MUTAR_FINANCEIRO");
    await prisma.contaReceber.update({ where: { id }, data: { status: "CANCELADA" } });
    revalidatePath("/financeiro/contas-receber");
    revalidatePath("/financeiro/titulos");
    revalidatePath("/financeiro");
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, erro: String(e) };
  }
}

export async function listarContasReceber(params: {
  status?: string;
  de?: string;
  ate?: string;
  busca?: string;
  pagina?: number;
}) {
  const { status, de, ate, busca, pagina = 1 } = params;
  const take = 20;
  const skip = (pagina - 1) * take;
  const where = {
    ...(status ? { status: status as "ABERTA" | "RECEBIDA" | "CANCELADA" } : {}),
    ...(de || ate ? { vencimento: { ...(de ? { gte: new Date(de) } : {}), ...(ate ? { lte: new Date(ate) } : {}) } } : {}),
    ...(busca ? { OR: [{ descricao: { contains: busca, mode: "insensitive" as const } }, { numero: { contains: busca, mode: "insensitive" as const } }] } : {}),
  };
  const [contas, total] = await prisma.$transaction([
    prisma.contaReceber.findMany({
      where,
      include: { banco: { select: { nome: true } }, estabelecimento: { select: { razaoSocial: true } } },
      orderBy: { vencimento: "asc" },
      take,
      skip,
    }),
    prisma.contaReceber.count({ where }),
  ]);
  return { contas, total, paginas: Math.ceil(total / take) };
}

// ── LancamentoBanco ───────────────────────────────────────────────────────────

export async function criarLancamentoBanco(formData: FormData): Promise<{ ok: true } | { ok: false; erro: string }> {
  try {
    await exigirPermissao("MUTAR_FINANCEIRO");
    const dados = lancamentoSchema.parse({
      data: formData.get("data"),
      historico: formData.get("historico"),
      tipo: formData.get("tipo"),
      valor: formData.get("valor"),
      bancoId: formData.get("bancoId"),
      contaPagarId: formData.get("contaPagarId") || undefined,
      contaReceberId: formData.get("contaReceberId") || undefined,
    });
    await prisma.lancamentoBanco.create({
      data: {
        data: new Date(dados.data),
        historico: dados.historico,
        tipo: dados.tipo,
        valor: dados.valor,
        bancoId: dados.bancoId,
        contaPagarId: orNull(dados.contaPagarId),
        contaReceberId: orNull(dados.contaReceberId),
      },
    });
    revalidatePath("/financeiro/conta-corrente");
    return { ok: true };
  } catch (e: unknown) {
    if (e instanceof z.ZodError) return { ok: false, erro: e.issues[0]?.message ?? "Erro de validação" };
    return { ok: false, erro: String(e) };
  }
}

export async function listarLancamentosBanco(bancoId: string, mes?: string) {
  const filtroData = mes ? {
    data: {
      gte: new Date(`${mes}-01`),
      lte: new Date(new Date(`${mes}-01`).getFullYear(), new Date(`${mes}-01`).getMonth() + 1, 0),
    },
  } : {};
  return prisma.lancamentoBanco.findMany({
    where: { bancoId, ...filtroData },
    orderBy: { data: "desc" },
  });
}

// ── DespesaViagem ─────────────────────────────────────────────────────────────

export async function criarDespesaViagem(formData: FormData): Promise<{ ok: true } | { ok: false; erro: string }> {
  try {
    await exigirPermissao("MUTAR_FINANCEIRO");
    const dados = viagemSchema.parse({
      descricao: formData.get("descricao"),
      data: formData.get("data"),
      destino: formData.get("destino") || undefined,
      tipoDespesa: formData.get("tipoDespesa") || undefined,
      valor: formData.get("valor"),
      colaboradorId: formData.get("colaboradorId") || undefined,
    });
    await prisma.despesaViagem.create({
      data: {
        descricao: dados.descricao,
        data: new Date(dados.data),
        destino: orNull(dados.destino),
        tipoDespesa: orNull(dados.tipoDespesa),
        valor: dados.valor,
        colaboradorId: orNull(dados.colaboradorId),
      },
    });
    revalidatePath("/financeiro/viagens");
    return { ok: true };
  } catch (e: unknown) {
    if (e instanceof z.ZodError) return { ok: false, erro: e.issues[0]?.message ?? "Erro de validação" };
    return { ok: false, erro: String(e) };
  }
}

export async function listarDespesasViagem(params: { busca?: string; pagina?: number }) {
  const { busca, pagina = 1 } = params;
  const take = 20;
  const skip = (pagina - 1) * take;
  const where = busca
    ? { OR: [{ descricao: { contains: busca, mode: "insensitive" as const } }, { destino: { contains: busca, mode: "insensitive" as const } }] }
    : {};
  const [despesas, total] = await prisma.$transaction([
    prisma.despesaViagem.findMany({
      where,
      include: { colaborador: { select: { name: true } } },
      orderBy: { data: "desc" },
      take,
      skip,
    }),
    prisma.despesaViagem.count({ where }),
  ]);
  return { despesas, total, paginas: Math.ceil(total / take) };
}

// ── Títulos em aberto ─────────────────────────────────────────────────────────

export async function listarTitulosAberto() {
  const [pagar, receber] = await prisma.$transaction([
    prisma.contaPagar.findMany({
      where: { status: "ABERTA" },
      include: { banco: { select: { nome: true } }, fornecedor: { select: { razaoSocial: true } } },
      orderBy: { vencimento: "asc" },
    }),
    prisma.contaReceber.findMany({
      where: { status: "ABERTA" },
      include: { banco: { select: { nome: true } }, estabelecimento: { select: { razaoSocial: true } } },
      orderBy: { vencimento: "asc" },
    }),
  ]);
  return { pagar, receber };
}
