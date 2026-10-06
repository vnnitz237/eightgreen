"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { exigirPermissao } from "@/lib/autorizacao";
import { acaoMutacaoSchema } from "./schemas";

async function validarReferenciasElegiveis(tx: Prisma.TransactionClient, dados: { distribuidoraId?: string | null; estabelecimentoId?: string | null }) {
  if (dados.distribuidoraId) {
    const distribuidora = await tx.distribuidora.findFirst({ where: { id: dados.distribuidoraId, ativo: true }, select: { id: true } });
    if (!distribuidora) throw new Error("A distribuidora selecionada não está disponível.");
  }
  if (dados.estabelecimentoId) {
    const estabelecimento = await tx.estabelecimento.findFirst({ where: { id: dados.estabelecimentoId, ativo: true }, select: { id: true } });
    if (!estabelecimento) throw new Error("O estabelecimento selecionado não está disponível.");
  }
}

export async function criarAcao(formData: FormData) {
  const usuario = await exigirPermissao("MUTAR_ACOES");
  const dados = acaoMutacaoSchema.parse({
    titulo: formData.get("titulo"),
    data: formData.get("data"),
    horario: formData.get("horario"),
    distribuidoraId: formData.get("distribuidoraId") || null,
    estabelecimentoId: formData.get("estabelecimentoId") || null,
    estabelecimentoAvulso: formData.get("estabelecimentoAvulso") || null,
  });

  await prisma.$transaction(async (tx) => {
    await validarReferenciasElegiveis(tx, dados);
    const acao = await tx.acao.create({ data: { ...dados, data: new Date(dados.data), status: "aberta" } });
    await tx.auditoria.create({ data: { autorId: usuario.id, operacao: "CRIAR", entidade: "Acao", registroId: acao.id, estadoPosterior: { titulo: acao.titulo, data: acao.data.toISOString(), horario: acao.horario, status: acao.status, distribuidoraId: acao.distribuidoraId, estabelecimentoId: acao.estabelecimentoId, estabelecimentoAvulso: acao.estabelecimentoAvulso } } });
  });

  revalidatePath("/acoes");
  revalidatePath("/");
  redirect("/acoes");
}

export async function atualizarAcao(id: string, formData: FormData) {
  const usuario = await exigirPermissao("MUTAR_ACOES");
  const dados = acaoMutacaoSchema.parse({
    titulo: formData.get("titulo"),
    data: formData.get("data"),
    horario: formData.get("horario"),
    distribuidoraId: formData.get("distribuidoraId") || null,
    estabelecimentoId: formData.get("estabelecimentoId") || null,
    estabelecimentoAvulso: formData.get("estabelecimentoAvulso") || null,
  });
  await prisma.$transaction(async (tx) => {
    const existente = await tx.acao.findUnique({ where: { id } });
    if (!existente) throw new Error("AÇÃO_NÃO_ENCONTRADA");
    if (existente.status !== "aberta") throw new Error("Somente ações abertas podem ser editadas nesta etapa.");
    await validarReferenciasElegiveis(tx, dados);
    const posterior = await tx.acao.update({ where: { id }, data: { ...dados, data: new Date(dados.data) } });
    await tx.auditoria.create({ data: { autorId: usuario.id, operacao: "ATUALIZAR", entidade: "Acao", registroId: id, estadoAnterior: { titulo: existente.titulo, data: existente.data.toISOString(), horario: existente.horario, status: existente.status, distribuidoraId: existente.distribuidoraId, estabelecimentoId: existente.estabelecimentoId, estabelecimentoAvulso: existente.estabelecimentoAvulso }, estadoPosterior: { titulo: posterior.titulo, data: posterior.data.toISOString(), horario: posterior.horario, status: posterior.status, distribuidoraId: posterior.distribuidoraId, estabelecimentoId: posterior.estabelecimentoId, estabelecimentoAvulso: posterior.estabelecimentoAvulso } } });
  });
  revalidatePath("/acoes");
  revalidatePath(`/acoes/${id}`);
  revalidatePath("/");
  redirect(`/acoes/${id}`);
}
