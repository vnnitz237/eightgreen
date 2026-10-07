export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { listarContasPagar, cancelarContaPagar } from "@/lib/actions/financeiro";
import { ModalPagar } from "@/componentes/financeiro/ModalPagar";
import { formatarDataCurta, formatarMoeda } from "@/lib/formatadores";

type SearchParams = Promise<{ status?: string; de?: string; ate?: string; busca?: string; pagina?: string }>;

const COR_STATUS: Record<string, string> = { ABERTA: "amarelo", PAGA: "verde", CANCELADA: "cinza" };
const ROTULO_STATUS: Record<string, string> = { ABERTA: "Aberta", PAGA: "Paga", CANCELADA: "Cancelada" };

export default async function ContasPagarPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const pagina = Number(sp.pagina ?? 1);
  const { contas, total, paginas } = await listarContasPagar({
    status: sp.status,
    de: sp.de,
    ate: sp.ate,
    busca: sp.busca,
    pagina,
  });

  const inicio = total === 0 ? 0 : (pagina - 1) * 20 + 1;
  const fim = Math.min(pagina * 20, total);

  const totalAberta = contas.filter((c) => c.status === "ABERTA").reduce((s, c) => s + Number(c.valor), 0);

  async function cancelar(id: string) {
    "use server";
    await cancelarContaPagar(id);
  }

  return (
    <div className="pagina-conteudo">
      <CabecalhoPagina
        etiqueta="Financeiro"
        titulo="Contas a pagar"
        descricao={`${total} registro(s)`}
        acao={
          <Link href="/financeiro/contas-pagar/nova" className="botao" style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Plus size={15} /> Nova conta
          </Link>
        }
      />

      {/* Filtros */}
      <div className="painel" style={{ marginBottom: 18 }}>
        <div className="painel-cabecalho"><div><h2>Filtros</h2></div></div>
        <form method="GET" className="form-completo" style={{ padding: "14px 19px" }}>
          <div className="form-completo-grupo">
            <label>
              Buscar
              <div style={{ position: "relative" }}>
                <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--cor-texto-3)" }} />
                <input name="busca" defaultValue={sp.busca ?? ""} placeholder="Descrição ou número…" style={{ paddingLeft: 30 }} />
              </div>
            </label>
            <label>
              Status
              <select name="status" defaultValue={sp.status ?? ""}>
                <option value="">Todos</option>
                <option value="ABERTA">Aberta</option>
                <option value="PAGA">Paga</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </label>
          </div>
          <div className="form-completo-grupo">
            <label>Vencimento (de)<input name="de" type="date" defaultValue={sp.de ?? ""} /></label>
            <label>Vencimento (até)<input name="ate" type="date" defaultValue={sp.ate ?? ""} /></label>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="botao">Filtrar</button>
            <Link href="/financeiro/contas-pagar" className="bt-secundario">Limpar</Link>
          </div>
        </form>
      </div>

      {/* Tabela */}
      <div className="painel">
        <div className="painel-cabecalho">
          <div>
            <h2>Lista de contas</h2>
            {total > 0
              ? <p>Mostrando {inicio}–{fim} de {total} · Aberto: {formatarMoeda(totalAberta)}</p>
              : <p>Nenhuma conta encontrada</p>}
          </div>
        </div>

        {contas.length > 0 ? (
          <div className="tabela-wrap">
            <table>
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Favorecido</th>
                  <th>Vencimento</th>
                  <th style={{ textAlign: "right" }}>Valor</th>
                  <th>Status</th>
                  <th aria-label="Ações" />
                </tr>
              </thead>
              <tbody>
                {contas.map((c) => {
                  const cancelarAction = cancelar.bind(null, c.id);
                  const hoje = new Date().toISOString().slice(0, 10);
                  const venc = c.vencimento.toISOString().slice(0, 10);
                  const atrasada = c.status === "ABERTA" && venc < hoje;
                  return (
                    <tr key={c.id}>
                      <td><span style={{ fontFamily: "monospace", fontSize: 11 }}>{c.numero ?? "—"}</span></td>
                      <td><strong>{c.descricao}</strong></td>
                      <td style={{ color: "var(--cor-texto-3)" }}>{c.categoria ?? "—"}</td>
                      <td>{c.fornecedor?.razaoSocial ?? c.favorecido ?? <span style={{ color: "var(--cor-texto-3)" }}>—</span>}</td>
                      <td style={{ color: atrasada ? "var(--cor-erro)" : undefined, fontWeight: atrasada ? 700 : undefined }}>
                        {formatarDataCurta(venc)}
                        {atrasada && <span style={{ marginLeft: 4, fontSize: 10 }}>Vencida</span>}
                      </td>
                      <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{formatarMoeda(Number(c.valor))}</td>
                      <td><span className={`tag tag-${COR_STATUS[c.status]}`}>{ROTULO_STATUS[c.status]}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                          {c.status === "ABERTA" && (
                            <>
                              <ModalPagar id={c.id} descricao={c.descricao} valor={Number(c.valor)} />
                              <form action={cancelarAction} style={{ display: "contents" }}>
                                <button type="submit" className="bt-link" style={{ fontSize: 11, color: "var(--cor-erro)" }}
                                  onClick={(e) => { if (!confirm("Cancelar esta conta?")) e.preventDefault(); }}>
                                  Cancelar
                                </button>
                              </form>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="estado-vazio">
            <strong>Nenhuma conta encontrada</strong>
            <span>Ajuste os filtros ou crie uma nova conta.</span>
          </div>
        )}

        {paginas > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "16px 19px", borderTop: "1px solid var(--cor-linha)" }}>
            {Array.from({ length: paginas }, (_, i) => i + 1).map((p) => {
              const params = new URLSearchParams({
                ...(sp.busca ? { busca: sp.busca } : {}),
                ...(sp.status ? { status: sp.status } : {}),
                ...(sp.de ? { de: sp.de } : {}),
                ...(sp.ate ? { ate: sp.ate } : {}),
                pagina: String(p),
              });
              return (
                <Link key={p} href={`/financeiro/contas-pagar?${params.toString()}`}
                  className={p === pagina ? "botao" : "bt-secundario"}
                  style={{ height: 30, width: 30, padding: 0, display: "grid", placeItems: "center", fontSize: 12 }}>
                  {p}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
