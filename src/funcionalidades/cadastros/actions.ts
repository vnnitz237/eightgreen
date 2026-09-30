"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// ─── Distribuidoras ───────────────────────────────────────────────────────────

const distribuidoraSchema = z.object({ nome: z.string().min(1, "Nome obrigatório") });

export async function criarDistribuidora(formData: FormData) {
  const dados = distribuidoraSchema.parse({ nome: formData.get("nome") });
  await prisma.distribuidora.create({ data: dados });
  revalidatePath("/cadastros/clientes");
}

export async function atualizarDistribuidora(id: string, formData: FormData) {
  const dados = distribuidoraSchema.parse({ nome: formData.get("nome") });
  await prisma.distribuidora.update({ where: { id }, data: dados });
  revalidatePath("/cadastros/clientes");
}

export async function toggleAtivoDistribuidora(id: string, ativo: boolean) {
  await prisma.distribuidora.update({ where: { id }, data: { ativo } });
  revalidatePath("/cadastros/clientes");
}

// ─── Degustadoras ─────────────────────────────────────────────────────────────

const degustadoraSchema = z.object({ nome: z.string().min(1, "Nome obrigatório") });

export async function criarDegustadora(formData: FormData) {
  const dados = degustadoraSchema.parse({ nome: formData.get("nome") });
  await prisma.degustadora.create({ data: dados });
  revalidatePath("/cadastros/degustadoras");
}

export async function atualizarDegustadora(id: string, formData: FormData) {
  const dados = degustadoraSchema.parse({ nome: formData.get("nome") });
  await prisma.degustadora.update({ where: { id }, data: dados });
  revalidatePath("/cadastros/degustadoras");
}

export async function toggleAtivoDegustadora(id: string, ativo: boolean) {
  await prisma.degustadora.update({ where: { id }, data: { ativo } });
  revalidatePath("/cadastros/degustadoras");
}

// ─── Fornecedores ─────────────────────────────────────────────────────────────

const fornecedorSchema = z.object({ nome: z.string().min(1, "Nome obrigatório") });

export async function criarFornecedor(formData: FormData) {
  const dados = fornecedorSchema.parse({ nome: formData.get("nome") });
  await prisma.fornecedor.create({ data: dados });
  revalidatePath("/cadastros/fornecedores");
}

export async function atualizarFornecedor(id: string, formData: FormData) {
  const dados = fornecedorSchema.parse({ nome: formData.get("nome") });
  await prisma.fornecedor.update({ where: { id }, data: dados });
  revalidatePath("/cadastros/fornecedores");
}

export async function toggleAtivoFornecedor(id: string, ativo: boolean) {
  await prisma.fornecedor.update({ where: { id }, data: { ativo } });
  revalidatePath("/cadastros/fornecedores");
}

// ─── Produtos ─────────────────────────────────────────────────────────────────

const produtoSchema = z.object({
  nome: z.string().min(1, "Nome obrigatório"),
  unidade: z.string().default("un"),
  estoqueMinimo: z.coerce.number().int().min(0).default(0),
  grupoId: z.string().nullable().optional(),
});

export async function criarProduto(formData: FormData) {
  const dados = produtoSchema.parse({
    nome: formData.get("nome"),
    unidade: formData.get("unidade") || "un",
    estoqueMinimo: formData.get("estoqueMinimo"),
    grupoId: formData.get("grupoId") || null,
  });
  await prisma.produto.create({ data: dados });
  revalidatePath("/cadastros/produtos");
}

export async function atualizarProduto(id: string, formData: FormData) {
  const dados = produtoSchema.parse({
    nome: formData.get("nome"),
    unidade: formData.get("unidade") || "un",
    estoqueMinimo: formData.get("estoqueMinimo"),
    grupoId: formData.get("grupoId") || null,
  });
  await prisma.produto.update({ where: { id }, data: dados });
  revalidatePath("/cadastros/produtos");
}

export async function toggleAtivoProduto(id: string, ativo: boolean) {
  await prisma.produto.update({ where: { id }, data: { ativo } });
  revalidatePath("/cadastros/produtos");
}

// ─── Grupos de produto ────────────────────────────────────────────────────────

const grupoSchema = z.object({ nome: z.string().min(1, "Nome obrigatório") });

export async function criarGrupoProduto(formData: FormData) {
  const dados = grupoSchema.parse({ nome: formData.get("nome") });
  await prisma.grupoProduto.create({ data: dados });
  revalidatePath("/cadastros/grupos");
}

// ─── Canais ───────────────────────────────────────────────────────────────────

export async function criarCanal(formData: FormData) {
  const nome = z.string().min(1).parse(formData.get("nome"));
  await prisma.canal.create({ data: { nome } });
  revalidatePath("/cadastros/canais");
}

// ─── Bancos ───────────────────────────────────────────────────────────────────

const bancoSchema = z.object({
  nome: z.string().min(1, "Nome obrigatório"),
  codigo: z.string().optional(),
});

export async function criarBanco(formData: FormData) {
  const dados = bancoSchema.parse({ nome: formData.get("nome"), codigo: formData.get("codigo") || undefined });
  await prisma.banco.create({ data: dados });
  revalidatePath("/cadastros/bancos");
}
