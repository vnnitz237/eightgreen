export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus } from "lucide-react";
import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { criarLancamentoBanco } from "@/lib/actions/financeiro";
import { prisma } from "@/lib/prisma";
import { formatarDataCurta, formatarMoeda } from "@/lib/formatadores";

type SearchParams = Promise<{ banco?: string; mes?: string }>;

export default async function ContaCorrentePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  const bancos = await prisma.banco.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } });
  const bancoSelecionado = sp.banco ? bancos.find((b) => b.id === sp.banco) : bancos[0];

  const mesAtual = sp.mes ?? new Date().toISOString().slice(0, 7);
  const [anoS, mesS] = mesAtual.split("-").map(Number);
  const dataInicio = new Date(anoS, mesS - 1, 1);
  const dataFim = new Date(anoS, mesS, 0);

  const lancamentos = bancoSelecionado
    ? await prisma.lancamentoBanco.findMany({
        where: { bancoId: bancoSelecionado.id, data: { gte: dataInicio, lte: dataFim } },
        orderBy: { data: "asc" },
      })
    : [];

  const totalCredito = lancamentos.filter((l) => l.tipo === "CREDITO").reduce((s, l) => s + Number(l.valor), 0);
  const totalDebito = lancamentos.filter((l) => l.tipo === "DEBITO").reduce((s, l) => s + Number(l.valor), 0);
  const saldo = totalCredito - totalDebito;

  async function novoLancamento(formData: FormData) {
    "use server";
    await criarLancamentoBanco(formData);
  }

  return (
    <div className="pagina-conteudo">
      <CabecalhoPagina etiqueta="Financeiro" titulo="Conta corrente" descricao="Extrato por banco e período." />

      {/* Seletor de banco e mês */}
      <div className="painel" style={{ marginBottom: 18 }}>
        <div className="painel-cabecalho"><div><h2>Seleção</h2></div></div>
        <form method="GET" className="form-completo" style={{ padding: "14px 19px" }}>
          <div className="form-completo-grupo">
            <label>
              Banco
              <select name="banco" defaultValue={bancoSelecionado?.id ?? ""}>
                {bancos.map((b) => <option key={b.id} value={b.id}>{b.nome}</option>)}
              </select>
            </label>
            <label>
              Mês
              <input name="mes" type="month" defaultValue={mesAtual} />
            </label>
          </div>
          <button type="submit" className="botao">Filtrar</button>
        </form>
      </div>

      {bancoSelecionado && (
        <>
          {/* KPIs */}
          <div className="kpis" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 18 }}>
            <article>
              <div style={{ padding: "12px 0 4px 0", fontSize: 11, color: "var(--cor-texto-3)", fontWeight: 700 }}>Créditos</div>
              <strong style={{ fontSize: 20, color: "var(--cor-sucesso)" }}>{formatarMoeda(totalCredito)}</strong>
            </article>
            <article>
              <div style={{ padding: "12px 0 4px 0", fontSize: 11, color: "var(--cor-texto-3)", fontWeight: 700 }}>Débitos</div>
              <strong style={{ fontSize: 20, color: "var(--cor-erro)" }}>{formatarMoeda(totalDebito)}</strong>
            </article>
            <article>
              <div style={{ padding: "12px 0 4px 0", fontSize: 11, color: "var(--cor-texto-3)", fontWeight: 700 }}>Saldo</div>
              <strong style={{ fontSize: 20, color: saldo >= 0 ? "var(--cor-sucesso)" : "var(--cor-erro)" }}>{formatarMoeda(saldo)}</strong>
            </article>
          </div>

          {/* Extrato */}
          <div className="painel" style={{ marginBottom: 18 }}>
            <div className="painel-cabecalho">
              <div><h2>Extrato — {bancoSelecionado.nome}</h2><p>{lancamentos.length} lançamento(s)</p></div>
            </div>
            {lancamentos.length > 0 ? (
              <div className="tabela-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Histórico</th>
                      <th>Tipo</th>
                      <th style={{ textAlign: "right" }}>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lancamentos.map((l) => (
                      <tr key={l.id}>
                        <td>{formatarDataCurta(l.data.toISOString().slice(0, 10))}</td>
                        <td>{l.historico}</td>
                        <td>
                          <span className={`tag tag-${l.tipo === "CREDITO" ? "verde" : "vermelho"}`}>
                            {l.tipo === "CREDITO" ? "Crédito" : "Débito"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: l.tipo === "CREDITO" ? "var(--cor-sucesso)" : "var(--cor-erro)" }}>
                          {l.tipo === "DEBITO" ? "–" : "+"}{formatarMoeda(Number(l.valor))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="estado-vazio" style={{ minHeight: 80 }}>
                <span>Nenhum lançamento no período.</span>
              </div>
            )}
          </div>

          {/* Novo lançamento */}
          <div className="painel">
            <div className="painel-cabecalho"><div><h2>Novo lançamento</h2></div></div>
            <form action={novoLancamento} className="form-completo" style={{ padding: "14px 19px" }}>
              <input type="hidden" name="bancoId" value={bancoSelecionado.id} />
              <div className="form-completo-grupo">
                <label>
                  Data *
                  <input name="data" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
                </label>
                <label>
                  Tipo *
                  <select name="tipo" required>
                    <option value="CREDITO">Crédito</option>
                    <option value="DEBITO">Débito</option>
                  </select>
                </label>
                <label>
                  Valor *
                  <input name="valor" type="number" step="0.01" min="0.01" required placeholder="0,00" />
                </label>
              </div>
              <div className="form-completo-grupo">
                <label style={{ gridColumn: "1/-1" }}>
                  Histórico *
                  <input name="historico" required placeholder="Descrição do lançamento" />
                </label>
              </div>
              <button type="submit" className="botao" style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <Plus size={14} /> Adicionar lançamento
              </button>
            </form>
          </div>
        </>
      )}

      {!bancoSelecionado && (
        <div className="estado-vazio">
          <strong>Nenhum banco cadastrado</strong>
          <span><Link href="/cadastros/bancos" className="bt-link">Cadastrar banco</Link></span>
        </div>
      )}
    </div>
  );
}
