import { prisma } from "@/lib/prisma";
import type { AcaoPromocional, RepositorioAcoes } from "./tipos";

function mapearAcao(acao: Awaited<ReturnType<typeof buscarAcoes>>[number]): AcaoPromocional {
  const estabelecimento = acao.estabelecimentoId && acao.estabelecimento
    ? { modo: "cadastrado" as const, id: acao.estabelecimento.id, nome: acao.estabelecimento.nomeFantasia ?? acao.estabelecimento.razaoSocial }
    : { modo: "avulso" as const, nome: acao.estabelecimentoAvulso ?? "Não informado" };

  return {
    id: acao.id,
    titulo: acao.titulo,
    data: acao.data.toISOString().slice(0, 10),
    horario: acao.horario as `${number}:${number}`,
    status: acao.status,
    distribuidora: acao.distribuidora ? { id: acao.distribuidora.id, nome: acao.distribuidora.nome } : null,
    estabelecimento,
    profissionais: acao.profissionais.map((p) =>
      p.degustadora
        ? { id: p.degustadora.id, nome: p.degustadora.nome, modo: "cadastrada" as const }
        : { id: p.id, nome: p.nomeAvulso ?? "Profissional avulsa", modo: "avulsa" as const }
    ),
    produtos: acao.produtos.map((p) => ({
      id: p.produto.id,
      nome: p.produto.nome,
      quantidadePlanejada: Number(p.quantidadePlanejada),
    })),
  };
}

async function buscarAcoes() {
  return prisma.acao.findMany({
    include: {
      distribuidora: true,
      estabelecimento: true,
      profissionais: { include: { degustadora: true } },
      produtos: { include: { produto: true } },
    },
    orderBy: { data: "desc" },
  });
}

export const repositorioAcoesPrisma: RepositorioAcoes = {
  async listar() {
    const acoes = await buscarAcoes();
    return acoes.map(mapearAcao);
  },
};
