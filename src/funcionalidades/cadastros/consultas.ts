import { prisma } from "@/lib/prisma";

export async function listarDistribuidoras() {
  return prisma.distribuidora.findMany({ orderBy: { nome: "asc" } });
}

export async function listarEstabelecimentos() {
  return prisma.estabelecimento.findMany({ orderBy: { nome: "asc" } });
}

export async function listarDegustadoras() {
  return prisma.degustadora.findMany({ orderBy: { nome: "asc" } });
}

export async function listarFornecedores() {
  return prisma.fornecedor.findMany({ orderBy: { nome: "asc" } });
}

export async function listarProdutos() {
  return prisma.produto.findMany({
    include: { grupo: true },
    orderBy: { nome: "asc" },
  });
}

export async function listarGruposProduto() {
  return prisma.grupoProduto.findMany({ orderBy: { nome: "asc" } });
}

export async function listarCanais() {
  return prisma.canal.findMany({ orderBy: { nome: "asc" } });
}

export async function listarBancos() {
  return prisma.banco.findMany({ orderBy: { nome: "asc" } });
}
