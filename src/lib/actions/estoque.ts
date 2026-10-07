"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { exigirUsuario } from "@/lib/autorizacao";
import { incrementarSaldo, decrementarSaldo, ajustarSaldo } from "@/lib/estoque/saldo";
import type { TipoDocumentoEstoque, StatusDocumentoEstoque } from "@prisma/client";

const POR_PAGINA = 20;

const itemSchema = z.object({
  produtoId: z.string().min(1),
  quantidade: z.number().int().positive(),
  quantidadeAnterior: z.number().int().min(0).optional(),
  custo: z.number().positive().optional(),
});

type ItemInput = z.infer<typeof itemSchema>;

async function gerarNumero(tipo: TipoDocumentoEstoque): Promise<string> {
  const prefixo = tipo === "ENTRADA" ? "ENT" : tipo === "SAIDA" ? "SAI" : "INV";
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const prefixoMes = `${prefixo}-${ano}${mes}-`;

  const ultimo = await prisma.documentoEstoque.findFirst({
    where: { numero: { startsWith: prefixoMes } },
    orderBy: { numero: "desc" },
    select: { numero: true },
  });

  let seq = 1;
  if (ultimo?.numero) {
    const parte = ultimo.numero.slice(prefixoMes.length);
    const n = parseInt(parte, 10);
    if (!isNaN(n)) seq = n + 1;
  }
  return `${prefixoMes}${String(seq).padStart(3, "0")}`;
}

export async function listarDocumentos(params: {
  tipo?: TipoDocumentoEstoque;
  status?: StatusDocumentoEstoque;
  de?: string;
  ate?: string;
  busca?: string;
  pagina?: number;
}) {
  await exigirUsuario();
  const pagina = params.pagina ?? 1;
  const skip = (pagina - 1) * POR_PAGINA;

  const where = {
    ...(params.tipo ? { tipo: params.tipo } : {}),
    ...(params.status ? { status: params.status } : {}),
    ...(params.de ? { data: { gte: new Date(params.de) } } : {}),
    ...(params.ate ? { data: { lte: new Date(params.ate) } } : {}),
    ...(params.busca ? { numero: { contains: params.busca, mode: "insensitive" as const } } : {}),
  };

  const [documentos, total] = await prisma.$transaction([
    prisma.documentoEstoque.findMany({
      where,
      include: {
        fornecedor: { select: { razaoSocial: true } },
        responsavel: { select: { name: true } },
        _count: { select: { itens: true } },
      },
      orderBy: { criadoEm: "desc" },
      skip,
      take: POR_PAGINA,
    }),
    prisma.documentoEstoque.count({ where }),
  ]);

  return { documentos, total, paginas: Math.max(1, Math.ceil(total / POR_PAGINA)) };
}

export async function criarDocumento(
  data: FormData
): Promise<{ ok: true; id: string } | { ok: false; erro: string }> {
  try {
    await exigirUsuario();

    const tipoRaw = String(data.get("tipo") ?? "ENTRADA") as TipoDocumentoEstoque;
    const dataStr = String(data.get("data") ?? "");
    const fornecedorId = String(data.get("fornecedorId") ?? "") || null;
    const acaoId = String(data.get("acaoId") ?? "") || null;
    const responsavelId = String(data.get("responsavelId") ?? "") || null;
    const observacao = String(data.get("observacao") ?? "") || null;
    const itensJson = String(data.get("itens_json") ?? "[]");

    if (!dataStr) return { ok: false, erro: "Data obrigatória." };

    let itens: ItemInput[];
    try {
      const raw = JSON.parse(itensJson) as unknown[];
      itens = z.array(itemSchema).parse(raw);
    } catch {
      return { ok: false, erro: "Itens inválidos." };
    }

    if (itens.length === 0) return { ok: false, erro: "Adicione ao menos um item." };

    const numero = await gerarNumero(tipoRaw);

    const doc = await prisma.documentoEstoque.create({
      data: {
        numero,
        tipo: tipoRaw,
        status: "ABERTO",
        data: new Date(dataStr),
        fornecedorId,
        acaoId,
        responsavelId,
        observacao,
        itens: {
          create: itens.map((item) => ({
            produtoId: item.produtoId,
            quantidade: item.quantidade,
            valorUnitario: item.custo ?? null,
            saldoSistema: item.quantidadeAnterior ?? null,
          })),
        },
      },
    });

    revalidatePath("/estoque");
    return { ok: true, id: doc.id };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) return { ok: false, erro: err.issues[0]?.message ?? "Dados inválidos." };
    return { ok: false, erro: "Erro ao criar documento." };
  }
}

export async function editarDocumento(
  id: string,
  data: FormData
): Promise<{ ok: true } | { ok: false; erro: string }> {
  try {
    await exigirUsuario();

    const doc = await prisma.documentoEstoque.findUnique({ where: { id }, select: { status: true } });
    if (!doc) return { ok: false, erro: "Documento não encontrado." };
    if (doc.status !== "ABERTO") return { ok: false, erro: "Apenas documentos abertos podem ser editados." };

    const dataStr = String(data.get("data") ?? "");
    const fornecedorId = String(data.get("fornecedorId") ?? "") || null;
    const acaoId = String(data.get("acaoId") ?? "") || null;
    const responsavelId = String(data.get("responsavelId") ?? "") || null;
    const observacao = String(data.get("observacao") ?? "") || null;
    const itensJson = String(data.get("itens_json") ?? "[]");

    let itens: ItemInput[];
    try {
      const raw = JSON.parse(itensJson) as unknown[];
      itens = z.array(itemSchema).parse(raw);
    } catch {
      return { ok: false, erro: "Itens inválidos." };
    }

    if (itens.length === 0) return { ok: false, erro: "Adicione ao menos um item." };

    await prisma.$transaction(async (tx) => {
      await tx.documentoEstoque.update({
        where: { id },
        data: {
          data: new Date(dataStr),
          fornecedorId,
          acaoId,
          responsavelId,
          observacao,
        },
      });
      await tx.documentoEstoqueItem.deleteMany({ where: { documentoId: id } });
      await tx.documentoEstoqueItem.createMany({
        data: itens.map((item) => ({
          documentoId: id,
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          valorUnitario: item.custo ?? null,
          saldoSistema: item.quantidadeAnterior ?? null,
        })),
      });
    });

    revalidatePath("/estoque");
    return { ok: true };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) return { ok: false, erro: err.issues[0]?.message ?? "Dados inválidos." };
    return { ok: false, erro: "Erro ao editar documento." };
  }
}

export async function encerrarDocumento(id: string): Promise<{ ok: true } | { ok: false; erro: string }> {
  try {
    await exigirUsuario();

    const doc = await prisma.documentoEstoque.findUnique({
      where: { id },
      include: { itens: true },
    });
    if (!doc) return { ok: false, erro: "Documento não encontrado." };
    if (doc.status !== "ABERTO") return { ok: false, erro: "Documento já encerrado ou cancelado." };

    await prisma.$transaction(async (tx) => {
      for (const item of doc.itens) {
        const qty = Math.round(Number(item.quantidade));
        if (doc.tipo === "ENTRADA") {
          await incrementarSaldo(tx, item.produtoId, qty);
        } else if (doc.tipo === "SAIDA") {
          await decrementarSaldo(tx, item.produtoId, qty);
        } else {
          await ajustarSaldo(tx, item.produtoId, qty);
        }
      }
      await tx.documentoEstoque.update({ where: { id }, data: { status: "ENCERRADO" } });
    });

    revalidatePath("/estoque");
    revalidatePath("/estoque/saldo");
    return { ok: true };
  } catch (err: unknown) {
    if (err instanceof Error) return { ok: false, erro: err.message };
    return { ok: false, erro: "Erro ao encerrar documento." };
  }
}

export async function cancelarDocumento(id: string): Promise<{ ok: true } | { ok: false; erro: string }> {
  try {
    await exigirUsuario();

    const doc = await prisma.documentoEstoque.findUnique({ where: { id }, select: { status: true } });
    if (!doc) return { ok: false, erro: "Documento não encontrado." };
    if (doc.status !== "ABERTO") return { ok: false, erro: "Apenas documentos abertos podem ser cancelados." };

    await prisma.documentoEstoque.update({ where: { id }, data: { status: "CANCELADO" } });
    revalidatePath("/estoque");
    return { ok: true };
  } catch {
    return { ok: false, erro: "Erro ao cancelar documento." };
  }
}

export async function buscarSaldoAtual() {
  await exigirUsuario();
  return prisma.saldoEstoque.findMany({
    include: {
      produto: {
        select: {
          nome: true,
          unidade: true,
          grupoId: true,
          grupo: { select: { nome: true } },
        },
      },
    },
    orderBy: { produto: { nome: "asc" } },
  });
}
