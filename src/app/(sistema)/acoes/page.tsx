export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { Status } from "@/componentes/ui/status";
import { formatarDataCurta } from "@/lib/formatadores";
import { listarAcoesComFiltros } from "@/funcionalidades/acoes/consultas-lista";
import { listarDistribuidoras, listarEstabelecimentos } from "@/funcionalidades/cadastros/consultas";
import { clonarAcao, cancelarAcao } from "@/funcionalidades/acoes/actions";
import { BotaoSubmitConfirmacao } from "@/funcionalidades/acoes/botao-submit-confirmacao";
import type { StatusAcao } from "@/funcionalidades/acoes/tipos";

type SearchParams = Promise<{
  busca?: string;
  status?: string;
  de?: string;
  ate?: string;
  distribuidoraId?: string;
  estabelecimentoId?: string;
  pagina?: string;
}>;

export default async function AcoesPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const pagina = Number(sp.pagina ?? 1);

  const [{ acoes, total, paginas }, distribuidoras, estabelecimentos] = await Promise.all([
    listarAcoesComFiltros({
      busca: sp.busca,
      status: sp.status,
      de: sp.de,
      ate: sp.ate,
      distribuidoraId: sp.distribuidoraId,
      estabelecimentoId: sp.estabelecimentoId,
      pagina,
    }),
    listarDistribuidoras(),
    listarEstabelecimentos(),
  ]);

  const inicio = (pagina - 1) * 20 + 1;
  const fim = Math.min(pagina * 20, total);

  return (
    <div className="pagina-conteudo">
      <CabecalhoPagina
        etiqueta="Operação"
        titulo="Ações promocionais"
        descricao={`${total} ação${total !== 1 ? "ões" : ""} cadastrada${total !== 1 ? "s" : ""}`}
        acao={
          <Link href="/acoes/nova" className="botao" style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Plus size={15} /> Nova ação
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
                <input name="busca" defaultValue={sp.busca ?? ""} placeholder="Título, número ou observações..." style={{ paddingLeft: 30 }} />
              </div>
            </label>
            <label>
              Status
              <select name="status" defaultValue={sp.status ?? ""}>
                <option value="">Todos</option>
                <option value="aberta">Aberta</option>
                <option value="encerrada">Encerrada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </label>
          </div>
          <div className="form-completo-grupo">
            <label>
              Data início (de)
              <input name="de" type="date" defaultValue={sp.de ?? ""} />
            </label>
            <label>
              Data início (até)
              <input name="ate" type="date" defaultValue={sp.ate ?? ""} />
            </label>
            <label>
              Distribuidora
              <select name="distribuidoraId" defaultValue={sp.distribuidoraId ?? ""}>
                <option value="">Todas</option>
                {distribuidoras.map((d) => (
                  <option key={d.id} value={d.id}>{d.nome}</option>
                ))}
              </select>
            </label>
            <label>
              Estabelecimento
              <select name="estabelecimentoId" defaultValue={sp.estabelecimentoId ?? ""}>
                <option value="">Todos</option>
                {estabelecimentos.map((e) => (
                  <option key={e.id} value={e.id}>{e.razaoSocial}</option>
                ))}
              </select>
            </label>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="botao">Filtrar</button>
            <Link href="/acoes" className="bt-secundario">Limpar</Link>
          </div>
        </form>
      </div>

      {/* Tabela */}
      <div className="painel">
        <div className="painel-cabecalho">
          <div>
            <h2>Lista de ações</h2>
            {total > 0 ? (
              <p>Mostrando {inicio}–{fim} de {total} {total === 1 ? "ação" : "ações"}</p>
            ) : (
              <p>Nenhuma ação encontrada</p>
            )}
          </div>
        </div>

        {acoes.length > 0 ? (
          <div className="tabela-wrap">
            <table>
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Título</th>
                  <th>Distribuidora</th>
                  <th>Estabelecimento</th>
                  <th>Data início</th>
                  <th>Data fim</th>
                  <th>Produtos</th>
                  <th>Degust.</th>
                  <th>Status</th>
                  <th aria-label="Ações" />
                </tr>
              </thead>
              <tbody>
                {acoes.map((acao) => {
                  const nomeEstab = acao.estabelecimento
                    ? acao.estabelecimento.nomeFantasia ?? acao.estabelecimento.razaoSocial
                    : acao.estabelecimentoAvulso ?? "—";
                  const clonar = clonarAcao.bind(null, acao.id);
                  const cancelar = cancelarAcao.bind(null, acao.id);
                  return (
                    <tr key={acao.id}>
                      <td>
                        <strong style={{ fontFamily: "monospace", fontSize: 11 }}>{acao.numero}</strong>
                      </td>
                      <td>
                        <strong>{acao.titulo}</strong>
                        <small>{acao.horario}</small>
                      </td>
                      <td>{acao.distribuidora?.nome ?? <span style={{ color: "var(--cor-texto-3)" }}>—</span>}</td>
                      <td>{nomeEstab}</td>
                      <td>{formatarDataCurta(acao.data.toISOString().slice(0, 10))}</td>
                      <td>{acao.dataFim ? formatarDataCurta(acao.dataFim.toISOString().slice(0, 10)) : <span style={{ color: "var(--cor-texto-3)" }}>—</span>}</td>
                      <td style={{ textAlign: "center" }}>{acao.produtos.length}</td>
                      <td style={{ textAlign: "center" }}>{acao.acaoDegustadoras.length}</td>
                      <td><Status valor={acao.status as StatusAcao} /></td>
                      <td>
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                          <Link href={`/acoes/${acao.id}`} className="bt-link" style={{ fontSize: 11 }}>Ver</Link>
                          {acao.status === "aberta" && (
                            <Link href={`/acoes/${acao.id}/editar`} className="bt-link" style={{ fontSize: 11 }}>Editar</Link>
                          )}
                          <form action={clonar} style={{ display: "contents" }}>
                            <BotaoSubmitConfirmacao
                              className="bt-link"
                              style={{ fontSize: 11 }}
                              mensagem="Clonar esta ação?"
                            >
                              Clonar
                            </BotaoSubmitConfirmacao>
                          </form>
                          {acao.status === "aberta" && (
                            <form action={cancelar} style={{ display: "contents" }}>
                              <BotaoSubmitConfirmacao
                                className="bt-link"
                                style={{ fontSize: 11, color: "var(--cor-erro)" }}
                                mensagem="Cancelar esta ação? Não poderá ser reaberta."
                              >
                                Cancelar
                              </BotaoSubmitConfirmacao>
                            </form>
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
            <strong>Nenhuma ação encontrada</strong>
            <span>Ajuste os filtros ou crie uma nova ação.</span>
          </div>
        )}

        {/* Paginação */}
        {paginas > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "16px 19px", borderTop: "1px solid var(--cor-linha)" }}>
            {Array.from({ length: paginas }, (_, i) => i + 1).map((p) => {
              const params = new URLSearchParams({
                ...(sp.busca ? { busca: sp.busca } : {}),
                ...(sp.status ? { status: sp.status } : {}),
                ...(sp.de ? { de: sp.de } : {}),
                ...(sp.ate ? { ate: sp.ate } : {}),
                ...(sp.distribuidoraId ? { distribuidoraId: sp.distribuidoraId } : {}),
                ...(sp.estabelecimentoId ? { estabelecimentoId: sp.estabelecimentoId } : {}),
                pagina: String(p),
              });
              return (
                <Link
                  key={p}
                  href={`/acoes?${params.toString()}`}
                  className={p === pagina ? "botao" : "bt-secundario"}
                  style={{ height: 30, width: 30, padding: 0, display: "grid", placeItems: "center", fontSize: 12 }}
                >
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
