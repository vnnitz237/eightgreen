import { prisma } from "@/lib/prisma";
import type { AcaoPromocional } from "@/funcionalidades/acoes/tipos";

export type ItemSaldoEstoque = {
  id: string;
  produto: string;
  quantidade: number;
  minimo: number;
};

export type AlertasFinanceiros = {
  cpVencidas: number;
  crVencidas: number;
  saldoNegativo: number;
};

export async function buscarDadosDashboard(): Promise<{
  acoes: AcaoPromocional[];
  saldoEstoque: ItemSaldoEstoque[];
  alertas: AlertasFinanceiros;
}> {
  // O PostgreSQL embarcado usado no desenvolvimento local não aceita duas
  // instruções preparadas simultâneas na mesma conexão. As consultas são
  // independentes, mas executadas em sequência para manter compatibilidade.
  const acoesDb = await prisma.acao.findMany({
      include: {
        distribuidora: true,
        estabelecimento: true,
        profissionais: { include: { degustadora: true } },
        produtos: { include: { produto: true } },
      },
      orderBy: { data: "desc" },
    });
  const produtosDb = await prisma.produto.findMany({
      include: { movimentacoes: true },
      orderBy: { nome: "asc" },
    });

  const acoes: AcaoPromocional[] = acoesDb.map((acao) => ({
    id: acao.id,
    titulo: acao.titulo,
    data: acao.data.toISOString().slice(0, 10),
    horario: acao.horario as `${number}:${number}`,
    status: acao.status,
    distribuidora: acao.distribuidora ? { id: acao.distribuidora.id, nome: acao.distribuidora.nome } : null,
    estabelecimento: acao.estabelecimentoId && acao.estabelecimento
      ? { modo: "cadastrado", id: acao.estabelecimento.id, nome: acao.estabelecimento.nomeFantasia ?? acao.estabelecimento.razaoSocial }
      : { modo: "avulso", nome: acao.estabelecimentoAvulso ?? "Não informado" },
    profissionais: acao.profissionais.map((p) =>
      p.degustadora
        ? { id: p.degustadora.id, nome: p.degustadora.nome, modo: "cadastrada" as const }
        : { id: p.id, nome: p.nomeAvulso ?? "Avulsa", modo: "avulsa" as const }
    ),
    produtos: acao.produtos.map((p) => ({
      id: p.produto.id,
      nome: p.produto.nome,
      quantidadePlanejada: Number(p.quantidadePlanejada),
    })),
  }));

  const saldoEstoque: ItemSaldoEstoque[] = produtosDb.map((produto) => {
    const quantidade = produto.movimentacoes.reduce((total, m) => {
      if (m.tipo === "entrada") return total + Number(m.quantidade);
      if (m.tipo === "saida") return total - Number(m.quantidade);
      return total + Number(m.quantidade);
    }, 0);
    return { id: produto.id, produto: produto.nome, quantidade, minimo: Number(produto.estoqueMinimo) };
  });

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const cpVencidas = await prisma.contaPagar.count({
    where: { status: "ABERTA", vencimento: { lt: hoje } },
  });
  const crVencidas = await prisma.contaReceber.count({
    where: { status: "ABERTA", vencimento: { lt: hoje } },
  });
  const saldoNegativo = await prisma.saldoEstoque.count({
    where: { quantidade: { lt: 0 } },
  });

  return { acoes, saldoEstoque, alertas: { cpVencidas, crVencidas, saldoNegativo } };
}
