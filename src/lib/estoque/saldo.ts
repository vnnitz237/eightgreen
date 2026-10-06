import { prisma } from "@/lib/prisma";
import type { PrismaClient } from "@prisma/client";

type Tx = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

export async function incrementarSaldo(tx: Tx, produtoId: string, quantidade: number) {
  await tx.saldoEstoque.upsert({
    where: { produtoId },
    create: { produtoId, quantidade },
    update: { quantidade: { increment: quantidade } },
  });
}

export async function decrementarSaldo(tx: Tx, produtoId: string, quantidade: number) {
  const saldo = await tx.saldoEstoque.findUnique({
    where: { produtoId },
    include: { produto: { select: { nome: true } } },
  });
  const atual = saldo?.quantidade ?? 0;
  if (atual - quantidade < 0) {
    throw new Error(`Saldo insuficiente para ${saldo?.produto?.nome ?? produtoId}`);
  }
  await tx.saldoEstoque.upsert({
    where: { produtoId },
    create: { produtoId, quantidade: 0 },
    update: { quantidade: { decrement: quantidade } },
  });
}

export async function ajustarSaldo(tx: Tx, produtoId: string, novaQuantidade: number) {
  await tx.saldoEstoque.upsert({
    where: { produtoId },
    create: { produtoId, quantidade: novaQuantidade },
    update: { quantidade: novaQuantidade },
  });
}

export async function buscarSaldos(produtoIds: string[]): Promise<Record<string, number>> {
  const saldos = await prisma.saldoEstoque.findMany({
    where: { produtoId: { in: produtoIds } },
  });
  return Object.fromEntries(saldos.map((s) => [s.produtoId, s.quantidade]));
}
