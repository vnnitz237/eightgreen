"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { exigirPermissao } from "@/lib/autorizacao";

// ─── Schemas ─────────────────────────────────────────────────────────────────

const produtoItemSchema = z.object({
  produtoId: z.string().min(1),
  quantidade: z.number().int().positive("Quantidade deve ser positiva"),
  preco: z.number().nonnegative("Preço deve ser positivo"),
});

const degustadoraItemSchema = z.object({
  degustadoraId: z.string().min(1),
  dataTrabalho: z.string().date("Data inválida"),
  horaInicio: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida"),
  horaFim: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida"),
  observacoes: z.string().optional(),
});

const acaoBaseSchema = z.object({
  titulo: z.string().min(1, "Título obrigatório"),
  data: z.string().date("Data início inválida"),
  dataFim: z.string().date("Data fim inválida").optional().nullable(),
  horario: z.string().regex(/^\d{2}:\d{2}$/, "Horário inválido"),
  status: z.enum(["aberta", "encerrada", "cancelada"]),
  distribuidoraId: z.string().nullable().optional(),
  estabelecimentoId: z.string().nullable().optional(),
  estabelecimentoAvulso: z.string().nullable().optional(),
  observacoes: z.string().optional().nullable(),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function gerarNumero(): Promise<string> {
  const now = new Date();
  const ano = now.getFullYear();
  const mes = String(now.getMonth() + 1).padStart(2, "0");
  const prefixo = `ACO-${ano}${mes}`;
  const count = await prisma.acao.count({ where: { numero: { startsWith: prefixo } } });
  return `${prefixo}-${String(count + 1).padStart(3, "0")}`;
}

function parseProdutos(formData: FormData) {
  const raw = formData.get("produtos_json");
  if (!raw) return [];
  const items = JSON.parse(raw as string) as unknown[];
  return z.array(produtoItemSchema).parse(items);
}

function parseDegustadoras(formData: FormData) {
  const raw = formData.get("degustadoras_json");
  if (!raw || raw === "[]") return [];
  const items = JSON.parse(raw as string) as unknown[];
  return z.array(degustadoraItemSchema).parse(items);
}

// ─── Ações CRUD ──────────────────────────────────────────────────────────────

export async function criarAcao(
  formData: FormData
): Promise<{ ok: true; id: string } | { ok: false; erro: string }> {
  try {
    const dados = acaoBaseSchema.parse({
      titulo: formData.get("titulo"),
      data: formData.get("data"),
      dataFim: formData.get("dataFim") || null,
      horario: formData.get("horario"),
      status: formData.get("status") ?? "aberta",
      distribuidoraId: formData.get("distribuidoraId") || null,
      estabelecimentoId: formData.get("estabelecimentoId") || null,
      estabelecimentoAvulso: formData.get("estabelecimentoAvulso") || null,
      observacoes: formData.get("observacoes") || null,
    });

    const produtos = parseProdutos(formData);
    const degustadoras = parseDegustadoras(formData);

    if (produtos.length === 0) return { ok: false, erro: "Informe ao menos 1 produto." };

    const numero = await gerarNumero();

    const acao = await prisma.$transaction(async (tx) => {
      const nova = await tx.acao.create({
        data: {
          numero,
          titulo: dados.titulo,
          data: new Date(dados.data),
          dataFim: dados.dataFim ? new Date(dados.dataFim) : null,
          horario: dados.horario,
          status: dados.status,
          distribuidoraId: dados.distribuidoraId ?? null,
          estabelecimentoId: dados.estabelecimentoId ?? null,
          estabelecimentoAvulso: dados.estabelecimentoAvulso ?? null,
          observacoes: dados.observacoes ?? null,
        },
      });

      await tx.acaoProduto.createMany({
        data: produtos.map((p) => ({
          acaoId: nova.id,
          produtoId: p.produtoId,
          quantidadePlanejada: p.quantidade,
          preco: p.preco,
        })),
      });

      if (degustadoras.length > 0) {
        await tx.acaoDegustadora.createMany({
          data: degustadoras.map((d) => ({
            acaoId: nova.id,
            degustadoraId: d.degustadoraId,
            dataTrabalho: new Date(d.dataTrabalho),
            horaInicio: d.horaInicio,
            horaFim: d.horaFim,
            observacoes: d.observacoes ?? null,
          })),
        });
      }

      return nova;
    });

    revalidatePath("/acoes");
    revalidatePath("/");
    return { ok: true, id: acao.id };
  } catch (err) {
    if (err instanceof z.ZodError) return { ok: false, erro: err.issues[0]?.message ?? "Dados inválidos." };
    return { ok: false, erro: err instanceof Error ? err.message : "Erro ao criar ação." };
  }
}

export async function editarAcao(
  id: string,
  formData: FormData
): Promise<{ ok: true } | { ok: false; erro: string }> {
  try {
    const existente = await prisma.acao.findUnique({ where: { id } });
    if (!existente) return { ok: false, erro: "Ação não encontrada." };
    if (existente.status !== "aberta") return { ok: false, erro: "Só é possível editar ações abertas." };

    const dados = acaoBaseSchema.parse({
      titulo: formData.get("titulo"),
      data: formData.get("data"),
      dataFim: formData.get("dataFim") || null,
      horario: formData.get("horario"),
      status: "aberta",
      distribuidoraId: formData.get("distribuidoraId") || null,
      estabelecimentoId: formData.get("estabelecimentoId") || null,
      estabelecimentoAvulso: formData.get("estabelecimentoAvulso") || null,
      observacoes: formData.get("observacoes") || null,
    });

    const produtos = parseProdutos(formData);
    const degustadoras = parseDegustadoras(formData);

    if (produtos.length === 0) return { ok: false, erro: "Informe ao menos 1 produto." };

    await prisma.$transaction(async (tx) => {
      await tx.acao.update({
        where: { id },
        data: {
          titulo: dados.titulo,
          data: new Date(dados.data),
          dataFim: dados.dataFim ? new Date(dados.dataFim) : null,
          horario: dados.horario,
          distribuidoraId: dados.distribuidoraId ?? null,
          estabelecimentoId: dados.estabelecimentoId ?? null,
          estabelecimentoAvulso: dados.estabelecimentoAvulso ?? null,
          observacoes: dados.observacoes ?? null,
        },
      });

      await tx.acaoProduto.deleteMany({ where: { acaoId: id } });
      await tx.acaoProduto.createMany({
        data: produtos.map((p) => ({
          acaoId: id,
          produtoId: p.produtoId,
          quantidadePlanejada: p.quantidade,
          preco: p.preco,
        })),
      });

      await tx.acaoDegustadora.deleteMany({ where: { acaoId: id } });
      if (degustadoras.length > 0) {
        await tx.acaoDegustadora.createMany({
          data: degustadoras.map((d) => ({
            acaoId: id,
            degustadoraId: d.degustadoraId,
            dataTrabalho: new Date(d.dataTrabalho),
            horaInicio: d.horaInicio,
            horaFim: d.horaFim,
            observacoes: d.observacoes ?? null,
          })),
        });
      }
    });

    revalidatePath("/acoes");
    revalidatePath(`/acoes/${id}`);
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    if (err instanceof z.ZodError) return { ok: false, erro: err.issues[0]?.message ?? "Dados inválidos." };
    return { ok: false, erro: err instanceof Error ? err.message : "Erro ao editar ação." };
  }
}

export async function clonarAcao(id: string) {
  const original = await prisma.acao.findUnique({
    where: { id },
    include: {
      produtos: true,
      acaoDegustadoras: true,
    },
  });
  if (!original) throw new Error("Ação não encontrada.");

  const numero = await gerarNumero();

  const nova = await prisma.$transaction(async (tx) => {
    const criada = await tx.acao.create({
      data: {
        numero,
        titulo: `${original.titulo} (cópia)`,
        data: original.data,
        dataFim: original.dataFim,
        horario: original.horario,
        status: "aberta",
        distribuidoraId: original.distribuidoraId,
        estabelecimentoId: original.estabelecimentoId,
        estabelecimentoAvulso: original.estabelecimentoAvulso,
        observacoes: original.observacoes,
      },
    });

    if (original.produtos.length > 0) {
      await tx.acaoProduto.createMany({
        data: original.produtos.map((p) => ({
          acaoId: criada.id,
          produtoId: p.produtoId,
          quantidadePlanejada: p.quantidadePlanejada,
          preco: p.preco,
        })),
      });
    }

    if (original.acaoDegustadoras.length > 0) {
      await tx.acaoDegustadora.createMany({
        data: original.acaoDegustadoras.map((d) => ({
          acaoId: criada.id,
          degustadoraId: d.degustadoraId,
          dataTrabalho: d.dataTrabalho,
          horaInicio: d.horaInicio,
          horaFim: d.horaFim,
          observacoes: d.observacoes,
        })),
      });
    }

    return criada;
  });

  revalidatePath("/acoes");
  revalidatePath("/");
  redirect(`/acoes/${nova.id}`);
}

export async function cancelarAcao(id: string) {
  const acao = await prisma.acao.findUnique({ where: { id } });
  if (!acao) throw new Error("Ação não encontrada.");
  if (acao.status !== "aberta") throw new Error("Só é possível cancelar ações abertas.");

  await prisma.acao.update({ where: { id }, data: { status: "cancelada" } });
  revalidatePath("/acoes");
  revalidatePath(`/acoes/${id}`);
  revalidatePath("/");
}

export async function encerrarAcaoCheckout(
  id: string,
  produtosAtualizados: { produtoId: string; quantidade: number }[]
): Promise<{ ok: true } | { ok: false; erro: string }> {
  try {
    if (produtosAtualizados.length > 0) {
      await prisma.$transaction(
        produtosAtualizados.map((p) =>
          prisma.acaoProduto.updateMany({
            where: { acaoId: id, produtoId: p.produtoId },
            data: { quantidadePlanejada: p.quantidade },
          })
        )
      );
    }
    await atualizarStatusAcao(id, "encerrada");
    return { ok: true };
  } catch (err) {
    return { ok: false, erro: err instanceof Error ? err.message : "Erro ao encerrar ação." };
  }
}

export async function atualizarStatusAcao(id: string, status: "aberta" | "encerrada" | "cancelada") {
  const usuario = await exigirPermissao("MUTAR_ACOES");
  const acao = await prisma.acao.findUniqueOrThrow({
    where: { id },
    include: { produtos: true },
  });

  await prisma.acao.update({ where: { id }, data: { status } });

  // Automação: ao encerrar, baixar estoque e gerar Conta a Receber
  if (status === "encerrada" && acao.status !== "encerrada" && acao.produtos.length > 0) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    await prisma.$transaction(async (tx) => {
      const doc = await tx.documentoEstoque.create({
        data: {
          tipo: "SAIDA",
          data: hoje,
          acaoId: id,
          observacao: `Baixa automática — Ação encerrada: ${acao.titulo}`,
        },
      });

      for (const p of acao.produtos) {
        await tx.documentoEstoqueItem.create({
          data: {
            documentoId: doc.id,
            produtoId: p.produtoId,
            quantidade: p.quantidadePlanejada,
          },
        });

        await tx.saldoEstoque.upsert({
          where: { produtoId: p.produtoId },
          create: { produtoId: p.produtoId, quantidade: -p.quantidadePlanejada },
          update: { quantidade: { decrement: p.quantidadePlanejada } },
        });
      }

      const totalValor = acao.produtos.reduce(
        (soma, p) => soma + p.quantidadePlanejada * Number(p.preco),
        0
      );

      const vencimento = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);

      await tx.contaReceber.create({
        data: {
          descricao: totalValor > 0
            ? `Ação encerrada: ${acao.titulo}`
            : `Ação encerrada: ${acao.titulo} — valor a preencher`,
          valor: totalValor > 0 ? totalValor : 0.01,
          emissao: hoje,
          vencimento,
          estabelecimentoId: acao.estabelecimentoId,
          acaoId: id,
        },
      });
    });

    revalidatePath("/estoque/saldo");
    revalidatePath("/financeiro/contas-receber");
    revalidatePath("/financeiro/titulos");
  }

  await prisma.auditoria.create({
    data: {
      operacao: "MUDAR_STATUS",
      entidade: "Acao",
      registroId: id,
      estadoAnterior: { status: acao.status },
      estadoPosterior: { status },
      autorId: usuario.id,
    },
  });

  revalidatePath("/acoes");
  revalidatePath(`/acoes/${id}`);
  revalidatePath("/");
}

export async function excluirAcao(id: string) {
  await prisma.acao.delete({ where: { id } });
  revalidatePath("/acoes");
  revalidatePath("/");
  redirect("/acoes");
}
