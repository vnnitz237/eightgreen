import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

function variavel(nome: string, alternativa?: string) {
  const valor = process.env[nome]?.trim() || alternativa;
  if (!valor) throw new Error(`Variável obrigatória ausente para o seed: ${nome}`);
  return valor;
}

async function main() {
  const canal = await prisma.canal.upsert({ where: { id: "CAN-01" }, update: { ativo: true }, create: { id: "CAN-01", nome: "Varejo", ativo: true } });
  const banco = await prisma.banco.upsert({ where: { id: "BAN-01" }, update: { ativo: true }, create: { id: "BAN-01", nome: "Banco de desenvolvimento", codigo: "000", ativo: true } });
  const fornecedor = await prisma.fornecedor.upsert({ where: { id: "FOR-01" }, update: { ativo: true }, create: { id: "FOR-01", razaoSocial: "Fornecedor Laboratório", ativo: true } });
  const grupo = await prisma.grupoProduto.upsert({ where: { id: "GRP-01" }, update: { ativo: true }, create: { id: "GRP-01", nome: "Produtos demonstrativos", ativo: true } });

  // ─── Distribuidoras ───────────────────────────────────────────────────────
  const distribuidoras = await Promise.all([
    prisma.distribuidora.upsert({ where: { id: "D-01" }, update: { canalId: canal.id }, create: { id: "D-01", nome: "Distribuidora Horizonte", canalId: canal.id } }),
    prisma.distribuidora.upsert({ where: { id: "D-02" }, update: {}, create: { id: "D-02", nome: "Rede Litoral" } }),
    prisma.distribuidora.upsert({ where: { id: "D-03" }, update: {}, create: { id: "D-03", nome: "Comercial Veredas" } }),
  ]);

  // ─── Estabelecimentos ─────────────────────────────────────────────────────
  const estabelecimentos = await Promise.all([
    prisma.estabelecimento.upsert({ where: { id: "E-01" }, update: { distribuidoraId: "D-01", canalId: canal.id }, create: { id: "E-01", razaoSocial: "Mercado Estação", endereco: "Endereço sintético", distribuidoraId: "D-01", canalId: canal.id } }),
    prisma.estabelecimento.upsert({ where: { id: "E-02" }, update: {}, create: { id: "E-02", razaoSocial: "Empório do Parque" } }),
    prisma.estabelecimento.upsert({ where: { id: "E-03" }, update: {}, create: { id: "E-03", razaoSocial: "Loja Movimento" } }),
    prisma.estabelecimento.upsert({ where: { id: "E-04" }, update: {}, create: { id: "E-04", razaoSocial: "Supermercado Alameda" } }),
    prisma.estabelecimento.upsert({ where: { id: "E-05" }, update: {}, create: { id: "E-05", razaoSocial: "Clube Bem Viver" } }),
  ]);

  // ─── Degustadoras ─────────────────────────────────────────────────────────
  const degustadoras = await Promise.all([
    prisma.degustadora.upsert({ where: { id: "P-01" }, update: { fornecedorId: fornecedor.id }, create: { id: "P-01", nome: "Ana Martins", email: "ana.dev@example.test", fornecedorId: fornecedor.id } }),
    prisma.degustadora.upsert({ where: { id: "P-02" }, update: {}, create: { id: "P-02", nome: "Beatriz Costa" } }),
    prisma.degustadora.upsert({ where: { id: "P-03" }, update: {}, create: { id: "P-03", nome: "Carla Nunes" } }),
    prisma.degustadora.upsert({ where: { id: "P-04" }, update: {}, create: { id: "P-04", nome: "Diana Alves" } }),
  ]);

  const senhaAdmin = await hash(variavel("SEED_ADMIN_PASSWORD", process.env.ADMIN_PASSWORD), 12);
  const senhaFuncionario = await hash(variavel("SEED_FUNCIONARIO_PASSWORD", process.env.ADMIN_PASSWORD), 12);
  const admin = await prisma.usuario.upsert({
    where: { email: variavel("SEED_ADMIN_EMAIL", process.env.ADMIN_EMAIL || "admin.dev@eightgreen.local").toLowerCase() },
    update: { ativo: true, papel: "ADMINISTRADOR", passwordHash: senhaAdmin, mustChangePassword: false, estadoConvite: "ACEITO", credencialExpiraEm: null },
    create: { name: variavel("SEED_ADMIN_NAME", process.env.ADMIN_NAME || "Administrador de desenvolvimento"), email: variavel("SEED_ADMIN_EMAIL", process.env.ADMIN_EMAIL || "admin.dev@eightgreen.local").toLowerCase(), passwordHash: senhaAdmin, papel: "ADMINISTRADOR", ativo: true, mustChangePassword: false, estadoConvite: "ACEITO" },
  });
  const funcionario = await prisma.usuario.upsert({
    where: { email: variavel("SEED_FUNCIONARIO_EMAIL", "funcionario.dev@eightgreen.local").toLowerCase() },
    update: { ativo: true, papel: "FUNCIONARIO", passwordHash: senhaFuncionario, mustChangePassword: true, estadoConvite: "PENDENTE", credencialExpiraEm: new Date(Date.now() + 48 * 60 * 60 * 1000), degustadoraId: degustadoras[0].id },
    create: { name: variavel("SEED_FUNCIONARIO_NAME", "Funcionário de desenvolvimento"), email: variavel("SEED_FUNCIONARIO_EMAIL", "funcionario.dev@eightgreen.local").toLowerCase(), passwordHash: senhaFuncionario, papel: "FUNCIONARIO", ativo: true, mustChangePassword: true, estadoConvite: "PENDENTE", credencialExpiraEm: new Date(Date.now() + 48 * 60 * 60 * 1000), degustadoraId: degustadoras[0].id },
  });

  // ─── Produtos ─────────────────────────────────────────────────────────────
  const produtos = await Promise.all([
    prisma.produto.upsert({ where: { id: "PR-01" }, update: { grupoId: grupo.id }, create: { id: "PR-01", nome: "Bebida Energia 250 ml", estoqueMinimo: 240, grupoId: grupo.id } }),
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

  const documento = await prisma.documentoEstoque.upsert({
    where: { id: "DOC-ENT-01" },
    update: {},
    create: { id: "DOC-ENT-01", tipo: "ENTRADA", status: "ABERTO", data: new Date("2026-09-01"), fornecedorId: fornecedor.id, numeroNota: "NF-DEMO-001" },
  });
  await prisma.documentoEstoqueItem.upsert({
    where: { documentoId_produtoId: { documentoId: documento.id, produtoId: produtos[0].id } },
    update: {},
    create: { documentoId: documento.id, produtoId: produtos[0].id, quantidade: "10.000", valorUnitario: "5.25" },
  });

  const contaPagar = await prisma.contaPagar.upsert({ where: { id: "CP-DEV-01" }, update: {}, create: { id: "CP-DEV-01", descricao: "Conta demonstrativa", valor: "125.50", emissao: new Date("2026-09-01"), vencimento: new Date("2026-10-10"), fornecedorId: fornecedor.id, bancoId: banco.id } });
  const contaReceber = await prisma.contaReceber.upsert({ where: { id: "CR-DEV-01" }, update: {}, create: { id: "CR-DEV-01", descricao: "Recebimento demonstrativo", valor: "250.75", emissao: new Date("2026-09-01"), vencimento: new Date("2026-10-15"), estabelecimentoId: estabelecimentos[0].id, bancoId: banco.id } });
  const despesa = await prisma.despesaEmpresarial.upsert({ where: { id: "DESP-DEV-01" }, update: {}, create: { id: "DESP-DEV-01", descricao: "Visita demonstrativa", dataInicio: new Date("2026-09-10"), dataFim: new Date("2026-09-10"), destino: "Local sintético", responsavelId: admin.id } });
  await prisma.despesaItem.upsert({ where: { id: "DESPI-DEV-01" }, update: {}, create: { id: "DESPI-DEV-01", despesaId: despesa.id, data: new Date("2026-09-10"), tipo: "Transporte", descricao: "Item sintético", valor: "32.40" } });

  const contaCorrente = await prisma.contaCorrenteCliente.upsert({ where: { estabelecimentoId: estabelecimentos[0].id }, update: {}, create: { id: "CC-DEV-01", estabelecimentoId: estabelecimentos[0].id } });
  await prisma.lancamentoCC.upsert({ where: { id: "LCC-DEV-01" }, update: {}, create: { id: "LCC-DEV-01", contaCorrenteId: contaCorrente.id, contaReceberId: contaReceber.id, data: new Date("2026-09-01"), historico: "Lançamento demonstrativo", tipo: "CREDITO", valor: "250.75", origem: "SEED" } });

  await prisma.compromisso.upsert({ where: { id: "COMP-DEV-01" }, update: {}, create: { id: "COMP-DEV-01", titulo: "Compromisso demonstrativo", tipo: "REUNIAO", inicio: new Date("2026-10-12T10:00:00Z"), fim: new Date("2026-10-12T11:00:00Z"), diaInteiro: false, responsavelId: admin.id } });
  await prisma.registroMerchan.upsert({ where: { id: "MER-DEV-01" }, update: {}, create: { id: "MER-DEV-01", data: new Date("2026-09-20"), observacao: "Registro demonstrativo", tipoAtividade: "Positivação", distribuidoraId: distribuidoras[0].id, estabelecimentoId: estabelecimentos[0].id, responsavelId: funcionario.id } });
  const rota = await prisma.rota.upsert({ where: { id: "ROTA-DEV-01" }, update: {}, create: { id: "ROTA-DEV-01", descricao: "Rota demonstrativa", data: new Date("2026-10-13"), ativo: true, responsavelId: funcionario.id } });
  await prisma.rotaEstabelecimento.upsert({ where: { rotaId_estabelecimentoId: { rotaId: rota.id, estabelecimentoId: estabelecimentos[0].id } }, update: {}, create: { rotaId: rota.id, estabelecimentoId: estabelecimentos[0].id, ordem: 1 } });

  void contaPagar;

  console.log("Seed concluído.");
  void distribuidoras;
  void estabelecimentos;
  void degustadoras;
  void produtos;
  void admin;
  void funcionario;
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
