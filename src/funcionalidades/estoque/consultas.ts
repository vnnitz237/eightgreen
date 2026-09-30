import { prisma } from "@/lib/prisma";

export async function calcularSaldoEstoque() {
  const produtos = await prisma.produto.findMany({
    include: { movimentacoes: true },
    orderBy: { nome: "asc" },
  });

  return produtos.map((produto) => {
    const quantidade = produto.movimentacoes.reduce((total, m) => {
      if (m.tipo === "entrada") return total + m.quantidade;
      if (m.tipo === "saida") return total - m.quantidade;
      return total + m.quantidade; // ajuste pode ser positivo ou negativo
    }, 0);

    return {
      id: produto.id,
      produto: produto.nome,
      quantidade,
      minimo: produto.estoqueMinimo,
    };
  });
}

export async function listarMovimentacoes() {
  return prisma.movimentacaoEstoque.findMany({
    include: { produto: true },
    orderBy: { criadoEm: "desc" },
  });
}
