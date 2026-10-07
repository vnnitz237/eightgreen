import { prisma } from "@/lib/prisma";

export type FiltrosAcao = {
  busca?: string;
  status?: string;
  de?: string;
  ate?: string;
  distribuidoraId?: string;
  estabelecimentoId?: string;
  pagina?: number;
};

const POR_PAGINA = 20;

export async function listarAcoesComFiltros(filtros: FiltrosAcao = {}) {
  const pagina = Math.max(1, filtros.pagina ?? 1);
  const skip = (pagina - 1) * POR_PAGINA;

  const where: Record<string, unknown> = {};

  if (filtros.busca) {
    where.OR = [
      { titulo: { contains: filtros.busca, mode: "insensitive" } },
      { numero: { contains: filtros.busca, mode: "insensitive" } },
      { observacoes: { contains: filtros.busca, mode: "insensitive" } },
    ];
  }

  if (filtros.status && ["aberta", "encerrada", "cancelada"].includes(filtros.status)) {
    where.status = filtros.status;
  }

  if (filtros.de) {
    where.data = { ...(where.data as object ?? {}), gte: new Date(filtros.de) };
  }

  if (filtros.ate) {
    where.data = { ...(where.data as object ?? {}), lte: new Date(filtros.ate) };
  }

  if (filtros.distribuidoraId) {
    where.distribuidoraId = filtros.distribuidoraId;
  }

  if (filtros.estabelecimentoId) {
    where.estabelecimentoId = filtros.estabelecimentoId;
  }

  const [acoes, total] = await Promise.all([
    prisma.acao.findMany({
      where,
      skip,
      take: POR_PAGINA,
      orderBy: { data: "desc" },
      include: {
        distribuidora: { select: { id: true, nome: true } },
        estabelecimento: {
          select: { id: true, razaoSocial: true, nomeFantasia: true },
        },
        produtos: { select: { id: true } },
        acaoDegustadoras: { select: { id: true } },
      },
    }),
    prisma.acao.count({ where }),
  ]);

  return {
    acoes,
    total,
    paginas: Math.ceil(total / POR_PAGINA),
    pagina,
  };
}
