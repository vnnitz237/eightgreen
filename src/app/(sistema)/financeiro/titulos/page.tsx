export const dynamic = "force-dynamic";

import Link from "next/link";
import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { listarTitulosAberto } from "@/lib/actions/financeiro";
import { ModalPagar } from "@/componentes/financeiro/ModalPagar";
import { ModalReceber } from "@/componentes/financeiro/ModalReceber";
import { formatarDataCurta, formatarMoeda } from "@/lib/formatadores";

export default async function TitulosPage() {
  const { pagar, receber } = await listarTitulosAberto();

  const totalPagar = pagar.reduce((s, c) => s + Number(c.valor), 0);
  const totalReceber = receber.reduce((s, c) => s + Number(c.valor), 0);
  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <div className="pagina-conteudo">
      <CabecalhoPagina
        etiqueta="Financeiro"
        titulo="Títulos em aberto"
        descricao={`${pagar.length} a pagar · ${receber.length} a receber`}
      />

      {/* Resumo */}
      <div className="kpis" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 24 }}>
        <article>
          <div style={{ padding: "12px 0 4px 0", fontSize: 11, color: "var(--cor-texto-3)", fontWeight: 700 }}>A receber</div>
          <strong style={{ fontSize: 20, color: "var(--cor-sucesso)" }}>{formatarMoeda(totalReceber)}</strong>
        </article>
        <article>
          <div style={{ padding: "12px 0 4px 0", fontSize: 11, color: "var(--cor-texto-3)", fontWeight: 700 }}>A pagar</div>
          <strong style={{ fontSize: 20, color: "var(--cor-erro)" }}>{formatarMoeda(totalPagar)}</strong>
        </article>
        <article>
          <div style={{ padding: "12px 0 4px 0", fontSize: 11, color: "var(--cor-texto-3)", fontWeight: 700 }}>Saldo</div>
          <strong style={{ fontSize: 20, color: totalReceber - totalPagar >= 0 ? "var(--cor-sucesso)" : "var(--cor-erro)" }}>
            {formatarMoeda(totalReceber - totalPagar)}
          </strong>
        </article>
      </div>

      {/* Contas a pagar em aberto */}
      <div className="painel" style={{ marginBottom: 18 }}>
        <div className="painel-cabecalho">
          <div><h2>A pagar</h2><p>{pagar.length} título(s) · {formatarMoeda(totalPagar)}</p></div>
          <Link href="/financeiro/contas-pagar" className="bt-link" style={{ fontSize: 11 }}>Ver todas</Link>
        </div>
        {pagar.length > 0 ? (
          <div className="tabela-wrap">
            <table>
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Descrição</th>
                  <th>Favorecido</th>
                  <th>Vencimento</th>
                  <th style={{ textAlign: "right" }}>Valor</th>
                  <th aria-label="Ações" />
                </tr>
              </thead>
              <tbody>
                {pagar.map((c) => {
                  const venc = c.vencimento.toISOString().slice(0, 10);
                  const atrasada = venc < hoje;
                  return (
                    <tr key={c.id}>
                      <td><span style={{ fontFamily: "monospace", fontSize: 11 }}>{c.numero ?? "—"}</span></td>
                      <td><strong>{c.descricao}</strong></td>
                      <td>{c.fornecedor?.razaoSocial ?? c.favorecido ?? <span style={{ color: "var(--cor-texto-3)" }}>—</span>}</td>
                      <td style={{ color: atrasada ? "var(--cor-erro)" : undefined, fontWeight: atrasada ? 700 : undefined }}>
                        {formatarDataCurta(venc)}
                        {atrasada && <span style={{ marginLeft: 4, fontSize: 10 }}>Vencida</span>}
                      </td>
                      <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{formatarMoeda(Number(c.valor))}</td>
                      <td><ModalPagar id={c.id} descricao={c.descricao} valor={Number(c.valor)} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="estado-vazio" style={{ minHeight: 60 }}><span>Nenhuma conta a pagar em aberto.</span></div>
        )}
      </div>

      {/* Contas a receber em aberto */}
      <div className="painel">
        <div className="painel-cabecalho">
          <div><h2>A receber</h2><p>{receber.length} título(s) · {formatarMoeda(totalReceber)}</p></div>
          <Link href="/financeiro/contas-receber" className="bt-link" style={{ fontSize: 11 }}>Ver todas</Link>
        </div>
        {receber.length > 0 ? (
          <div className="tabela-wrap">
            <table>
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Descrição</th>
                  <th>Cliente</th>
                  <th>Vencimento</th>
                  <th style={{ textAlign: "right" }}>Valor</th>
                  <th aria-label="Ações" />
                </tr>
              </thead>
              <tbody>
                {receber.map((c) => {
                  const venc = c.vencimento.toISOString().slice(0, 10);
                  const atrasada = venc < hoje;
                  return (
                    <tr key={c.id}>
                      <td><span style={{ fontFamily: "monospace", fontSize: 11 }}>{c.numero ?? "—"}</span></td>
                      <td><strong>{c.descricao}</strong></td>
                      <td>{c.estabelecimento?.razaoSocial ?? <span style={{ color: "var(--cor-texto-3)" }}>—</span>}</td>
                      <td style={{ color: atrasada ? "var(--cor-erro)" : undefined, fontWeight: atrasada ? 700 : undefined }}>
                        {formatarDataCurta(venc)}
                        {atrasada && <span style={{ marginLeft: 4, fontSize: 10 }}>Vencida</span>}
                      </td>
                      <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{formatarMoeda(Number(c.valor))}</td>
                      <td><ModalReceber id={c.id} descricao={c.descricao} valor={Number(c.valor)} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="estado-vazio" style={{ minHeight: 60 }}><span>Nenhuma conta a receber em aberto.</span></div>
        )}
      </div>
    </div>
  );
}
