import { prisma } from "@/lib/prisma";

export async function listarContasAPagar() {
  return prisma.contaFinanceira.findMany({
    where: { tipo: "pagar" },
    orderBy: { vencimento: "asc" },
  });
}

export async function listarContasAReceber() {
  return prisma.contaFinanceira.findMany({
    where: { tipo: "receber" },
    orderBy: { vencimento: "asc" },
  });
}

export async function listarDespesas() {
  return prisma.despesaOperacional.findMany({
    orderBy: { data: "desc" },
  });
}

export async function listarContaCorrente() {
  const [pagar, receber, despesas] = await Promise.all([
    prisma.contaFinanceira.findMany({ where: { tipo: "pagar" } }),
    prisma.contaFinanceira.findMany({ where: { tipo: "receber" } }),
    prisma.despesaOperacional.findMany(),
  ]);

  const totalPagar = pagar.reduce((s, c) => s + Number(c.valor), 0);
  const totalReceber = receber.reduce((s, c) => s + Number(c.valor), 0);
  const totalDespesas = despesas.reduce((s, d) => s + Number(d.valor), 0);

  return { totalPagar, totalReceber, totalDespesas, saldo: totalReceber - totalPagar - totalDespesas };
}
