import { BarChart3, Boxes, CalendarDays, CircleDollarSign, ClipboardCheck, ContactRound, Gauge, MapPinned, PackageSearch, Settings2, UsersRound } from "lucide-react";

export const gruposNavegacao = [
  { titulo: "Operação", itens: [
    { rotulo: "Visão geral", href: "/", icone: Gauge },
    { rotulo: "Ações", href: "/acoes", icone: CalendarDays },
    { rotulo: "Merchan", href: "/merchan", icone: ClipboardCheck },
  ]},
  { titulo: "Gestão", itens: [
    { rotulo: "Cadastros", href: "/cadastros/clientes", icone: ContactRound },
    { rotulo: "Estoque", href: "/estoque", icone: Boxes },
    { rotulo: "Financeiro", href: "/financeiro/conta-corrente", icone: CircleDollarSign },
  ]},
  { titulo: "Equipe", itens: [
    { rotulo: "Agenda", href: "/pessoal/agenda", icone: UsersRound },
    { rotulo: "Rotas", href: "/pessoal/rotas", icone: MapPinned },
  ]},
  { titulo: "Análise", itens: [
    { rotulo: "Relatórios", href: "/relatorios/acoes", icone: BarChart3 },
    { rotulo: "Produtos", href: "/cadastros/produtos", icone: PackageSearch },
    { rotulo: "Configurações", href: "/configuracoes/perfil", icone: Settings2 },
  ]},
] as const;

export const rotasDocumentadas = [
  "/acoes", "/acoes/nova", "/acoes/[id]", "/acoes/[id]/editar", "/acoes/[id]/checkout",
  "/cadastros/clientes", "/cadastros/estabelecimentos", "/cadastros/degustadoras", "/cadastros/fornecedores", "/cadastros/produtos", "/cadastros/grupos-produto", "/cadastros/canais", "/cadastros/bancos",
  "/estoque/entradas", "/estoque/saidas", "/estoque/inventario", "/estoque/saldo",
  "/financeiro/conta-corrente", "/financeiro/a-pagar", "/financeiro/a-receber", "/financeiro/despesas", "/financeiro/titulos",
  "/merchan", "/pessoal/agenda", "/pessoal/rotas", "/relatorios/acoes", "/relatorios/conta-corrente", "/relatorios/contas-a-pagar", "/relatorios/estoque-minimo", "/configuracoes/usuarios", "/configuracoes/perfil",
] as const;
