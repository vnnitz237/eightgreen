import { prisma } from "@/lib/prisma";
import type { AcaoPromocional } from "@/funcionalidades/acoes/tipos";

export type ItemSaldoEstoque = {
  id: string;
  produto: string;
  quantidade: number;
  minimo: number;
};

export async function buscarDadosDashboard(): Promise<{
  acoes: AcaoPromocional[];
  saldoEstoque: ItemSaldoEstoque[];
}> {
  const [acoesDb, produtosDb] = await Promise.all([
    prisma.acao.findMany({
      include: {
        distribuidora: true,
        estabelecimento: true,
        profissionais: { include: { degustadora: true } },
        produtos: { include: { produto: true } },
      },
      orderBy: { data: "desc" },
    }),
    prisma.produto.findMany({
      include: { movimentacoes: true },
      orderBy: { nome: "asc" },
    }),
  ]);

  const acoes: AcaoPromocional[] = acoesDb.map((acao) => ({
    id: acao.id,
    titulo: acao.titulo,
    data: acao.data.toISOString().slice(0, 10),
    horario: acao.horario as `${number}:${number}`,
    status: acao.status,
    distribuidora: acao.distribuidora ? { id: acao.distribuidora.id, nome: acao.distribuidora.nome } : null,
    estabelecimento: acao.estabelecimentoId && acao.estabelecimento
      ? { modo: "cadastrado", id: acao.estabelecimento.id, nome: acao.estabelecimento.nome }
      : { modo: "avulso", nome: acao.estabelecimentoAvulso ?? "Não informado" },
    profissionais: acao.profissionais.map((p) =>
      p.degustadora
        ? { id: p.degustadora.id, nome: p.degustadora.nome, modo: "cadastrada" as const }
        : { id: p.id, nome: p.nomeAvulso ?? "Avulsa", modo: "avulsa" as const }
    ),
    produtos: acao.produtos.map((p) => ({
      id: p.produto.id,
      nome: p.produto.nome,
      quantidadePlanejada: p.quantidadePlanejada,
    })),
  }));

  const saldoEstoque: ItemSaldoEstoque[] = produtosDb.map((produto) => {
    const quantidade = produto.movimentacoes.reduce((total, m) => {
      if (m.tipo === "entrada") return total + m.quantidade;
      if (m.tipo === "saida") return total - m.quantidade;
      return total + m.quantidade;
    }, 0);
    return { id: produto.id, produto: produto.nome, quantidade, minimo: produto.estoqueMinimo };
  });

  return { acoes, saldoEstoque };
}
