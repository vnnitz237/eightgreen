"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { exigirPermissao } from "@/lib/autorizacao";
import type { EstadoCadastro, TipoCadastro } from "./tipos";

const textoObrigatorio = (rotulo: string) => z.string().trim().min(1, `${rotulo} é obrigatório.`).max(180);
const opcional = z.preprocess((v) => typeof v === "string" && v.trim() === "" ? null : v, z.string().trim().max(240).nullable());
const emailOpcional = z.preprocess((v) => typeof v === "string" && v.trim() === "" ? null : v, z.string().trim().email("E-mail inválido.").nullable());
const ufOpcional = z.preprocess((v) => typeof v === "string" && v.trim() === "" ? null : v, z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/, "UF deve ter duas letras.").nullable());
const idOpcional = z.preprocess((v) => typeof v === "string" && v.trim() === "" ? null : v, z.string().min(1).nullable());
const situacao = z.enum(["ATIVO", "INATIVO"]).default("ATIVO");
const decimal = z.string().trim().regex(/^\d+(?:[.,]\d{1,3})?$/, "Informe um número não negativo com até 3 casas decimais.").transform((v) => v.replace(",", "."));
const moedaOpcional = z.preprocess((v) => typeof v === "string" && v.trim() === "" ? null : v, z.string().trim().regex(/^\d+(?:[.,]\d{1,2})?$/, "Use um valor não negativo com até 2 casas decimais.").transform((valor) => valor.replace(",", ".")).nullable());

function documento(valor: unknown, tipo: "cpf" | "cnpj" | "ambos") {
  const normalizado = String(valor ?? "").replace(/\D/g, "");
  if (!normalizado) return null;
  const tamanhos = tipo === "cpf" ? [11] : tipo === "cnpj" ? [14] : [11, 14];
  if (!tamanhos.includes(normalizado.length)) throw new Error(tipo === "ambos" ? "CPF/CNPJ deve ter 11 ou 14 dígitos." : `${tipo.toUpperCase()} deve ter ${tamanhos[0]} dígitos.`);
  return normalizado;
}

const schemas = {
  canal: z.object({ nome: textoObrigatorio("Nome"), situacao }),
  banco: z.object({ nome: textoObrigatorio("Nome"), codigo: opcional, situacao }),
  estabelecimento: z.object({ razaoSocial: textoObrigatorio("Razão social"), nomeFantasia: opcional, cnpjCpf: opcional, ieRg: opcional, canalId: idOpcional, distribuidoraId: idOpcional, endereco: opcional, numero: opcional, complemento: opcional, bairro: opcional, cidade: opcional, uf: ufOpcional, cep: opcional, telefone: opcional, email: emailOpcional, contato: opcional, situacao }),
  degustadora: z.object({ nome: textoObrigatorio("Nome"), cpf: opcional, rg: opcional, telefone: opcional, email: emailOpcional, cidade: opcional, uf: ufOpcional, bancoDadosId: idOpcional, agencia: opcional, conta: opcional, usuarioId: idOpcional, situacao }),
  fornecedor: z.object({ razaoSocial: textoObrigatorio("Razão social"), nomeFantasia: opcional, cnpj: opcional, ie: opcional, endereco: opcional, numero: opcional, complemento: opcional, bairro: opcional, cidade: opcional, uf: ufOpcional, cep: opcional, telefone: opcional, email: emailOpcional, contato: opcional, situacao }),
  grupoProduto: z.object({ nome: textoObrigatorio("Nome"), situacao }),
  produto: z.object({ codigo: opcional, nome: textoObrigatorio("Nome"), grupoProdutoId: z.string().min(1, "Grupo é obrigatório."), unidade: z.enum(["UN", "CX", "KG", "LT", "FD", "PCT"]), estoqueMinimo: decimal, custo: moedaOpcional, valorVenda: moedaOpcional, situacao }),
} as const;

const caminhos: Record<TipoCadastro, string> = { canal: "/cadastros/canais", banco: "/cadastros/bancos", estabelecimento: "/cadastros/estabelecimentos", degustadora: "/cadastros/degustadoras", fornecedor: "/cadastros/fornecedores", grupoProduto: "/cadastros/grupos-produto", produto: "/cadastros/produtos" };
function falhaZod(erro: z.ZodError): EstadoCadastro { const erros = erro.flatten().fieldErrors as Record<string, string[] | undefined>; return { sucesso: false, mensagem: "Revise os campos destacados.", erros: Object.fromEntries(Object.entries(erros).map(([campo, mensagens]) => [campo, mensagens?.[0] ?? "Valor inválido."])) }; }
function erroEsperado(erro: unknown): EstadoCadastro { if (erro instanceof z.ZodError) return falhaZod(erro); if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === "P2002") return { sucesso: false, mensagem: "Já existe um registro com esse nome ou código." }; if (erro instanceof Error && !erro.message.startsWith("Prisma")) return { sucesso: false, mensagem: erro.message }; return { sucesso: false, mensagem: "Não foi possível salvar. Tente novamente." }; }

async function garantirNomeUnico(tipo: "canal" | "banco" | "grupoProduto", nome: string, id?: string) {
  const where = { nome: { equals: nome, mode: "insensitive" as const }, ...(id ? { id: { not: id } } : {}) };
  const existente = tipo === "canal" ? await prisma.canal.findFirst({ where }) : tipo === "banco" ? await prisma.banco.findFirst({ where }) : await prisma.grupoProduto.findFirst({ where });
  if (existente) throw new Error("Já existe um registro com este nome.");
}
async function auditar(tx: Prisma.TransactionClient, autorId: string, operacao: string, entidade: string, registroId: string, posterior: object) { await tx.auditoria.create({ data: { autorId, operacao, entidade, registroId, estadoPosterior: posterior } }); }

export async function salvarCadastro(_: EstadoCadastro, formData: FormData): Promise<EstadoCadastro> {
  const usuario = await exigirPermissao("MUTAR_CADASTROS");
  const tipo = z.enum(["canal", "banco", "estabelecimento", "degustadora", "fornecedor", "grupoProduto", "produto"]).parse(formData.get("tipo")) as TipoCadastro;
  const id = z.string().optional().parse(formData.get("id") || undefined);
  try {
    const validado = schemas[tipo].parse(Object.fromEntries(formData.entries())) as Record<string, unknown> & { situacao: "ATIVO" | "INATIVO" };
    const ativo = validado.situacao === "ATIVO"; const dados: Record<string, unknown> = { ...validado }; Reflect.deleteProperty(dados, "situacao");
    if (tipo === "canal" || tipo === "banco" || tipo === "grupoProduto") await garantirNomeUnico(tipo, String(dados.nome), id);
    if (tipo === "estabelecimento") dados.cnpjCpf = documento(dados.cnpjCpf, "ambos");
    if (tipo === "degustadora") dados.cpf = documento(dados.cpf, "cpf");
    if (tipo === "fornecedor") dados.cnpj = documento(dados.cnpj, "cnpj");

    const registroId = await prisma.$transaction(async (tx) => {
      let salvo: { id: string };
      if (tipo === "canal") salvo = id ? await tx.canal.update({ where: { id }, data: { nome: String(dados.nome), ativo } }) : await tx.canal.create({ data: { nome: String(dados.nome), ativo } });
      else if (tipo === "banco") salvo = id ? await tx.banco.update({ where: { id }, data: { nome: String(dados.nome), codigo: dados.codigo as string | null, ativo } }) : await tx.banco.create({ data: { nome: String(dados.nome), codigo: dados.codigo as string | null, ativo } });
      else if (tipo === "estabelecimento") {
        if (dados.canalId && !await tx.canal.findFirst({ where: { id: String(dados.canalId), ativo: true } })) throw new Error("O canal selecionado não está ativo.");
        if (dados.distribuidoraId && !await tx.distribuidora.findFirst({ where: { id: String(dados.distribuidoraId), ativo: true } })) throw new Error("A distribuidora selecionada não está ativa.");
        salvo = id ? await tx.estabelecimento.update({ where: { id }, data: { ...dados, ativo } as never }) : await tx.estabelecimento.create({ data: { ...dados, ativo } as never });
      } else if (tipo === "degustadora") {
        const usuarioId = dados.usuarioId as string | null; delete dados.usuarioId;
        if (dados.bancoDadosId && !await tx.banco.findFirst({ where: { id: String(dados.bancoDadosId), ativo: true } })) throw new Error("O banco selecionado não está ativo.");
        if (usuarioId) { const vinculo = await tx.usuario.findFirst({ where: { id: usuarioId, ativo: true }, select: { degustadoraId: true } }); if (!vinculo || vinculo.degustadoraId && vinculo.degustadoraId !== id) throw new Error("O usuário selecionado já possui vínculo ou não está ativo."); }
        salvo = id ? await tx.degustadora.update({ where: { id }, data: { ...dados, ativo } as never }) : await tx.degustadora.create({ data: { ...dados, ativo } as never });
        await tx.usuario.updateMany({ where: { degustadoraId: salvo.id, ...(usuarioId ? { id: { not: usuarioId } } : {}) }, data: { degustadoraId: null } });
        if (usuarioId) await tx.usuario.update({ where: { id: usuarioId }, data: { degustadoraId: salvo.id } });
      } else if (tipo === "fornecedor") salvo = id ? await tx.fornecedor.update({ where: { id }, data: { ...dados, ativo } as never }) : await tx.fornecedor.create({ data: { ...dados, ativo } as never });
      else if (tipo === "grupoProduto") salvo = id ? await tx.grupoProduto.update({ where: { id }, data: { nome: String(dados.nome), ativo } }) : await tx.grupoProduto.create({ data: { nome: String(dados.nome), ativo } });
      else {
        if (!await tx.grupoProduto.findFirst({ where: { id: String(dados.grupoProdutoId), ativo: true } })) throw new Error("O grupo selecionado não está ativo.");
        const produto = { codigo: dados.codigo as string | null, nome: String(dados.nome), grupoId: String(dados.grupoProdutoId), unidade: String(dados.unidade), estoqueMinimo: String(dados.estoqueMinimo), custo: dados.custo as string | null, valorVenda: dados.valorVenda as string | null, ativo };
        salvo = id ? await tx.produto.update({ where: { id }, data: produto }) : await tx.produto.create({ data: produto });
      }
      await auditar(tx, usuario.id, id ? "ATUALIZAR" : "CRIAR", tipo, salvo.id, { ...dados, ativo }); return salvo.id;
    });
    revalidatePath(caminhos[tipo]); return { sucesso: true, mensagem: id ? "Alterações salvas." : "Registro criado.", registroId };
  } catch (erro) { return erroEsperado(erro); }
}

export async function alterarSituacaoCadastro(_: EstadoCadastro, formData: FormData): Promise<EstadoCadastro> {
  const usuario = await exigirPermissao("MUTAR_CADASTROS");
  const tipo = z.enum(["canal", "banco", "estabelecimento", "degustadora", "fornecedor", "grupoProduto", "produto"]).parse(formData.get("tipo")) as TipoCadastro;
  const id = z.string().min(1).parse(formData.get("id")); const ativo = formData.get("ativo") === "true";
  try {
    if (!ativo && tipo === "canal" && await prisma.estabelecimento.count({ where: { canalId: id, ativo: true } }) > 0) throw new Error("Não é possível inativar: existem estabelecimentos ativos vinculados a este canal.");
    if (!ativo && tipo === "grupoProduto" && await prisma.produto.count({ where: { grupoId: id, ativo: true } }) > 0) throw new Error("Não é possível inativar: existem produtos ativos vinculados a este grupo.");
    await prisma.$transaction(async (tx) => {
      if (tipo === "canal") await tx.canal.update({ where: { id }, data: { ativo } }); else if (tipo === "banco") await tx.banco.update({ where: { id }, data: { ativo } }); else if (tipo === "estabelecimento") await tx.estabelecimento.update({ where: { id }, data: { ativo } }); else if (tipo === "degustadora") await tx.degustadora.update({ where: { id }, data: { ativo } }); else if (tipo === "fornecedor") await tx.fornecedor.update({ where: { id }, data: { ativo } }); else if (tipo === "grupoProduto") await tx.grupoProduto.update({ where: { id }, data: { ativo } }); else await tx.produto.update({ where: { id }, data: { ativo } });
      await auditar(tx, usuario.id, ativo ? "ATIVAR" : "INATIVAR", tipo, id, { ativo });
    });
    revalidatePath(caminhos[tipo]); return { sucesso: true, mensagem: ativo ? "Registro ativado." : "Registro inativado." };
  } catch (erro) { return erroEsperado(erro); }
}

const distribuidoraSchema = z.object({ nome: textoObrigatorio("Nome") });
export async function criarDistribuidora(formData: FormData) { await exigirPermissao("MUTAR_CADASTROS"); await prisma.distribuidora.create({ data: distribuidoraSchema.parse({ nome: formData.get("nome") }) }); revalidatePath("/cadastros/clientes"); }
export async function atualizarDistribuidora(id: string, formData: FormData) { await exigirPermissao("MUTAR_CADASTROS"); await prisma.distribuidora.update({ where: { id }, data: distribuidoraSchema.parse({ nome: formData.get("nome") }) }); revalidatePath("/cadastros/clientes"); }
export async function toggleAtivoDistribuidora(id: string, ativo: boolean) { await exigirPermissao("MUTAR_CADASTROS"); await prisma.distribuidora.update({ where: { id }, data: { ativo } }); revalidatePath("/cadastros/clientes"); }
