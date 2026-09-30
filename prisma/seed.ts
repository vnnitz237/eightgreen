import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ─── Distribuidoras ───────────────────────────────────────────────────────
  const distribuidoras = await Promise.all([
    prisma.distribuidora.upsert({ where: { id: "D-01" }, update: {}, create: { id: "D-01", nome: "Distribuidora Horizonte" } }),
    prisma.distribuidora.upsert({ where: { id: "D-02" }, update: {}, create: { id: "D-02", nome: "Rede Litoral" } }),
    prisma.distribuidora.upsert({ where: { id: "D-03" }, update: {}, create: { id: "D-03", nome: "Comercial Veredas" } }),
  ]);

  // ─── Estabelecimentos ─────────────────────────────────────────────────────
  const estabelecimentos = await Promise.all([
    prisma.estabelecimento.upsert({ where: { id: "E-01" }, update: {}, create: { id: "E-01", nome: "Mercado Estação" } }),
    prisma.estabelecimento.upsert({ where: { id: "E-02" }, update: {}, create: { id: "E-02", nome: "Empório do Parque" } }),
    prisma.estabelecimento.upsert({ where: { id: "E-03" }, update: {}, create: { id: "E-03", nome: "Loja Movimento" } }),
    prisma.estabelecimento.upsert({ where: { id: "E-04" }, update: {}, create: { id: "E-04", nome: "Supermercado Alameda" } }),
    prisma.estabelecimento.upsert({ where: { id: "E-05" }, update: {}, create: { id: "E-05", nome: "Clube Bem Viver" } }),
  ]);

  // ─── Degustadoras ─────────────────────────────────────────────────────────
  const degustadoras = await Promise.all([
    prisma.degustadora.upsert({ where: { id: "P-01" }, update: {}, create: { id: "P-01", nome: "Ana Martins" } }),
    prisma.degustadora.upsert({ where: { id: "P-02" }, update: {}, create: { id: "P-02", nome: "Beatriz Costa" } }),
    prisma.degustadora.upsert({ where: { id: "P-03" }, update: {}, create: { id: "P-03", nome: "Carla Nunes" } }),
    prisma.degustadora.upsert({ where: { id: "P-04" }, update: {}, create: { id: "P-04", nome: "Diana Alves" } }),
  ]);

  // ─── Produtos ─────────────────────────────────────────────────────────────
  const produtos = await Promise.all([
    prisma.produto.upsert({ where: { id: "PR-01" }, update: {}, create: { id: "PR-01", nome: "Bebida Energia 250 ml", estoqueMinimo: 240 } }),
    prisma.produto.upsert({ where: { id: "PR-02" }, update: {}, create: { id: "PR-02", nome: "Mix Proteico 30 g", estoqueMinimo: 180 } }),
    prisma.produto.upsert({ where: { id: "PR-03" }, update: {}, create: { id: "PR-03", nome: "Snack Cacau 40 g", estoqueMinimo: 160 } }),
    prisma.produto.upsert({ where: { id: "PR-04" }, update: {}, create: { id: "PR-04", nome: "Gel Energia 30 g", estoqueMinimo: 120 } }),
  ]);

  // ─── Estoque (saldo inicial via movimentações de entrada) ─────────────────
  const saldosIniciais = [
    { produtoId: "PR-01", quantidade: 684 },
    { produtoId: "PR-02", quantidade: 428 },
    { produtoId: "PR-03", quantidade: 212 },
    { produtoId: "PR-04", quantidade: 96 },
  ];

  for (const { produtoId, quantidade } of saldosIniciais) {
    const existente = await prisma.movimentacaoEstoque.findFirst({ where: { produtoId, tipo: "entrada" } });
    if (!existente) {
      await prisma.movimentacaoEstoque.create({
        data: { produtoId, tipo: "entrada", quantidade, observacao: "Saldo inicial (seed)" },
      });
    }
  }

  // ─── Ações ────────────────────────────────────────────────────────────────
  const acoesData = [
    {
      id: "AC-1039", titulo: "Encontro Nutrição Prática", data: new Date("2026-08-21"), horario: "17:00",
      status: "encerrada" as const, distribuidoraId: "D-03", estabelecimentoId: "E-05",
      profissionais: [{ degustadoraId: "P-03" }],
      produtos: [{ produtoId: "PR-03", quantidadePlanejada: 64 }],
    },
    {
      id: "AC-1048", titulo: "Ativação Linha Energia", data: new Date("2026-09-03"), horario: "09:00",
      status: "encerrada" as const, distribuidoraId: "D-01", estabelecimentoId: "E-01",
      profissionais: [{ degustadoraId: "P-01" }],
      produtos: [{ produtoId: "PR-01", quantidadePlanejada: 72 }],
    },
    {
      id: "AC-1051", titulo: "Degustação Bem-estar", data: new Date("2026-09-08"), horario: "14:00",
      status: "encerrada" as const, distribuidoraId: "D-02", estabelecimentoId: "E-02",
      profissionais: [{ degustadoraId: "P-02" }],
      produtos: [{ produtoId: "PR-02", quantidadePlanejada: 96 }],
    },
    {
      id: "AC-1054", titulo: "Experiência Sabor & Movimento", data: new Date("2026-09-15"), horario: "10:30",
      status: "encerrada" as const, distribuidoraId: "D-01", estabelecimentoId: null, estabelecimentoAvulso: "Feira Vida Ativa",
      profissionais: [{ degustadoraId: "P-03" }, { nomeAvulso: "Profissional convidada" }],
      produtos: [{ produtoId: "PR-03", quantidadePlanejada: 120 }],
    },
    {
      id: "AC-1058", titulo: "Circuito Performance", data: new Date("2026-09-22"), horario: "16:00",
      status: "aberta" as const, distribuidoraId: "D-03", estabelecimentoId: "E-03",
      profissionais: [{ degustadoraId: "P-04" }],
      produtos: [{ produtoId: "PR-04", quantidadePlanejada: 80 }],
    },
    {
      id: "AC-1061", titulo: "Ação Comunidade Ativa", data: new Date("2026-09-29"), horario: "08:30",
      status: "aberta" as const, distribuidoraId: null, estabelecimentoId: null, estabelecimentoAvulso: "Praça das Palmeiras",
      profissionais: [{ degustadoraId: "P-02" }],
      produtos: [{ produtoId: "PR-01", quantidadePlanejada: 144 }],
    },
    {
      id: "AC-1065", titulo: "Semana do Movimento", data: new Date("2026-10-05"), horario: "13:00",
      status: "aberta" as const, distribuidoraId: "D-02", estabelecimentoId: "E-04",
      profissionais: [{ degustadoraId: "P-01" }],
      produtos: [{ produtoId: "PR-02", quantidadePlanejada: 160 }],
    },
  ];

  for (const { profissionais, produtos: prods, ...acao } of acoesData) {
    const existente = await prisma.acao.findUnique({ where: { id: acao.id } });
    if (!existente) {
      await prisma.acao.create({
        data: {
          ...acao,
          profissionais: { create: profissionais },
          produtos: { create: prods },
        },
      });
    }
  }

  console.log("Seed concluído.");
  void distribuidoras;
  void estabelecimentos;
  void degustadoras;
  void produtos;
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
