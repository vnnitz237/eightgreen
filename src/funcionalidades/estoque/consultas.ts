import { prisma } from "@/lib/prisma";

export async function calcularSaldoEstoque() {
  const produtos = await prisma.produto.findMany({
    include: { movimentacoes: true },
    orderBy: { nome: "asc" },
  });

  return produtos.map((produto) => {
    const quantidade = produto.movimentacoes.reduce((total, m) => {
      if (m.tipo === "entrada") return total + Number(m.quantidade);
      if (m.tipo === "saida") return total - Number(m.quantidade);
      return total + Number(m.quantidade); // ajuste pode ser positivo ou negativo
    }, 0);

    return {
      id: produto.id,
      produto: produto.nome,
      quantidade,
      minimo: Number(produto.estoqueMinimo),
    };
  });
}

export async function listarMovimentacoes() {
  const itens = await prisma.movimentacaoEstoque.findMany({
    include: { produto: true },
    orderBy: { criadoEm: "desc" },
  });
  return itens.map((item) => ({ ...item, quantidade: Number(item.quantidade) }));
}
