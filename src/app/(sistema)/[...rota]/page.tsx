import { notFound } from "next/navigation";
import { PaginaFutura } from "@/componentes/compartilhados/pagina-futura";

const titulos: Record<string, [string, string]> = {
  "acoes": ["Ações promocionais", "Operação"], "acoes/nova": ["Nova ação", "Ações"],
  "cadastros/clientes": ["Distribuidoras", "Cadastros"], "cadastros/degustadoras": ["Degustadoras", "Cadastros"], "cadastros/fornecedores": ["Fornecedores", "Cadastros"], "cadastros/produtos": ["Produtos", "Cadastros"], "cadastros/grupos": ["Grupos de produtos", "Cadastros"], "cadastros/canais": ["Canais", "Cadastros"], "cadastros/bancos": ["Bancos", "Cadastros"],
  "estoque/entradas": ["Entradas de estoque", "Estoque"], "estoque/saidas": ["Saídas de estoque", "Estoque"], "estoque/inventario": ["Inventários", "Estoque"], "estoque/saldo": ["Saldo de estoque", "Estoque"],
  "financeiro/conta-corrente": ["Conta corrente", "Financeiro"], "financeiro/a-pagar": ["Contas a pagar", "Financeiro"], "financeiro/a-receber": ["Contas a receber", "Financeiro"], "financeiro/despesas": ["Despesas", "Financeiro"], "financeiro/titulos": ["Títulos", "Financeiro"],
  "merchan": ["Merchan", "Operação"], "pessoal/agenda": ["Agenda", "Pessoal"], "pessoal/rotas": ["Rotas", "Pessoal"],
  "relatorios/acoes": ["Relatório de ações", "Relatórios"], "relatorios/conta-corrente": ["Relatório de conta corrente", "Relatórios"], "relatorios/contas-a-pagar": ["Relatório de contas a pagar", "Relatórios"], "relatorios/estoque-minimo": ["Relatório de estoque mínimo", "Relatórios"],
  "configuracoes/usuarios": ["Administração de usuários", "Configurações"], "configuracoes/perfil": ["Meu perfil", "Configurações"],
};

export default async function RotaFutura({ params }: { params: Promise<{ rota: string[] }> }) {
  const { rota } = await params; const chave = rota.join("/");
  let definicao = titulos[chave];
  if (!definicao && rota[0] === "acoes" && rota.length >= 2) definicao = rota.at(-1) === "editar" ? ["Editar ação", "Ações"] : rota.at(-1) === "checkout" ? ["Checkout da ação", "Ações"] : ["Detalhe da ação", "Ações"];
  if (!definicao) notFound();
  return <PaginaFutura titulo={definicao[0]} dominio={definicao[1]}/>;
}
