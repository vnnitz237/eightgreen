export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { criarContaReceber } from "@/lib/actions/financeiro";
import { prisma } from "@/lib/prisma";

export default async function NovaContaReceberPage() {
  const [bancos, estabelecimentos] = await Promise.all([
    prisma.banco.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } }),
    prisma.estabelecimento.findMany({ where: { ativo: true }, orderBy: { razaoSocial: "asc" }, select: { id: true, razaoSocial: true } }),
  ]);

  async function criar(formData: FormData) {
    "use server";
    const res = await criarContaReceber(formData);
    if (res.ok) redirect("/financeiro/contas-receber");
  }

  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <div className="pagina-conteudo">
      <div style={{ marginBottom: 16 }}>
        <Link href="/financeiro/contas-receber" style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--cor-texto-3)", fontSize: 11 }}>
          <ArrowLeft size={14} /> Voltar às contas a receber
        </Link>
      </div>

      <CabecalhoPagina etiqueta="Financeiro" titulo="Nova conta a receber" descricao="Preencha os dados do título." />

      <div className="painel">
        <div className="painel-cabecalho"><div><h2>Dados da conta</h2></div></div>
        <form action={criar} className="form-completo" style={{ padding: "18px 19px" }}>
          <div className="form-completo-grupo">
            <label>
              Descrição *
              <input name="descricao" required placeholder="Ex: Serviços – Distribuidora XYZ" />
            </label>
            <label>
              Categoria
              <input name="categoria" placeholder="Ex: Serviço, Produto…" />
            </label>
          </div>
          <div className="form-completo-grupo">
            <label>
              Valor *
              <input name="valor" type="number" step="0.01" min="0.01" required placeholder="0,00" />
            </label>
            <label>
              Emissão *
              <input name="emissao" type="date" required defaultValue={hoje} />
            </label>
            <label>
              Vencimento *
              <input name="vencimento" type="date" required defaultValue={hoje} />
            </label>
          </div>
          <div className="form-completo-grupo">
            <label>
              Forma de recebimento
              <input name="formaPagamento" placeholder="Ex: PIX, Boleto, Depósito…" />
            </label>
            <label>
              Banco
              <select name="bancoId">
                <option value="">— Selecionar —</option>
                {bancos.map((b) => <option key={b.id} value={b.id}>{b.nome}</option>)}
              </select>
            </label>
            <label>
              Cliente / Estabelecimento
              <select name="estabelecimentoId">
                <option value="">— Selecionar —</option>
                {estabelecimentos.map((e) => <option key={e.id} value={e.id}>{e.razaoSocial}</option>)}
              </select>
            </label>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="botao">Salvar conta</button>
            <Link href="/financeiro/contas-receber" className="bt-secundario">Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
