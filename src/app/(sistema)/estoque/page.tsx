export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { listarDocumentos, encerrarDocumento, cancelarDocumento } from "@/lib/actions/estoque";
import { formatarDataCurta } from "@/lib/formatadores";
import type { TipoDocumentoEstoque, StatusDocumentoEstoque } from "@prisma/client";

type SearchParams = Promise<{
  tipo?: string;
  status?: string;
  de?: string;
  ate?: string;
  busca?: string;
  pagina?: string;
}>;

const ROTULO_TIPO: Record<TipoDocumentoEstoque, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
  INVENTARIO: "Inventário",
};

const COR_TIPO: Record<TipoDocumentoEstoque, string> = {
  ENTRADA: "verde",
  SAIDA: "vermelho",
  INVENTARIO: "azul",
};

const ROTULO_STATUS: Record<StatusDocumentoEstoque, string> = {
  ABERTO: "Aberto",
  ENCERRADO: "Encerrado",
  CANCELADO: "Cancelado",
};

const COR_STATUS: Record<StatusDocumentoEstoque, string> = {
  ABERTO: "amarelo",
  ENCERRADO: "verde",
  CANCELADO: "cinza",
};

export default async function EstoquePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const pagina = Number(sp.pagina ?? 1);

  const { documentos, total, paginas } = await listarDocumentos({
    tipo: sp.tipo as TipoDocumentoEstoque | undefined,
    status: sp.status as StatusDocumentoEstoque | undefined,
    de: sp.de,
    ate: sp.ate,
    busca: sp.busca,
    pagina,
  });

  const inicio = total === 0 ? 0 : (pagina - 1) * 20 + 1;
  const fim = Math.min(pagina * 20, total);

  const encerrar = async (id: string) => {
    "use server";
    await encerrarDocumento(id);
  };

  const cancelar = async (id: string) => {
    "use server";
    await cancelarDocumento(id);
  };

  return (
    <div className="pagina-conteudo">
      <CabecalhoPagina
        etiqueta="Estoque"
        titulo="Documentos de estoque"
        descricao={`${total} documento${total !== 1 ? "s" : ""}`}
        acao={
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/estoque/saldo" className="bt-secundario">Ver saldo</Link>
            <Link href="/estoque/novo" className="botao" style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Plus size={15} /> Novo documento
            </Link>
          </div>
        }
      />

      {/* Filtros */}
      <div className="painel" style={{ marginBottom: 18 }}>
        <div className="painel-cabecalho"><div><h2>Filtros</h2></div></div>
        <form method="GET" className="form-completo" style={{ padding: "14px 19px" }}>
          <div className="form-completo-grupo">
            <label>
              Buscar número
              <div style={{ position: "relative" }}>
                <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--cor-texto-3)" }} />
                <input name="busca" defaultValue={sp.busca ?? ""} placeholder="ENT-202401-001…" style={{ paddingLeft: 30 }} />
              </div>
            </label>
            <label>
              Tipo
              <select name="tipo" defaultValue={sp.tipo ?? ""}>
                <option value="">Todos</option>
                <option value="ENTRADA">Entrada</option>
                <option value="SAIDA">Saída</option>
                <option value="INVENTARIO">Inventário</option>
              </select>
            </label>
            <label>
              Status
              <select name="status" defaultValue={sp.status ?? ""}>
                <option value="">Todos</option>
                <option value="ABERTO">Aberto</option>
                <option value="ENCERRADO">Encerrado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </label>
          </div>
          <div className="form-completo-grupo">
            <label>Data (de)<input name="de" type="date" defaultValue={sp.de ?? ""} /></label>
            <label>Data (até)<input name="ate" type="date" defaultValue={sp.ate ?? ""} /></label>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="botao">Filtrar</button>
            <Link href="/estoque" className="bt-secundario">Limpar</Link>
          </div>
        </form>
      </div>

      {/* Tabela */}
      <div className="painel">
        <div className="painel-cabecalho">
          <div>
            <h2>Lista de documentos</h2>
            {total > 0
              ? <p>Mostrando {inicio}–{fim} de {total}</p>
              : <p>Nenhum documento encontrado</p>}
          </div>
        </div>

        {documentos.length > 0 ? (
          <div className="tabela-wrap">
            <table>
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Tipo</th>
                  <th>Data</th>
                  <th>Fornecedor/Responsável</th>
                  <th style={{ textAlign: "center" }}>Itens</th>
                  <th>Status</th>
                  <th aria-label="Ações" />
                </tr>
              </thead>
              <tbody>
                {documentos.map((doc) => {
                  const encerrarAction = encerrar.bind(null, doc.id);
                  const cancelarAction = cancelar.bind(null, doc.id);
                  return (
                    <tr key={doc.id}>
                      <td><strong style={{ fontFamily: "monospace", fontSize: 11 }}>{doc.numero ?? "—"}</strong></td>
                      <td><span className={`tag tag-${COR_TIPO[doc.tipo]}`}>{ROTULO_TIPO[doc.tipo]}</span></td>
                      <td>{formatarDataCurta(doc.data.toISOString().slice(0, 10))}</td>
                      <td>{doc.fornecedor?.razaoSocial ?? doc.responsavel?.name ?? <span style={{ color: "var(--cor-texto-3)" }}>—</span>}</td>
                      <td style={{ textAlign: "center" }}>{doc._count.itens}</td>
                      <td><span className={`tag tag-${COR_STATUS[doc.status]}`}>{ROTULO_STATUS[doc.status]}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                          <Link href={`/estoque/${doc.id}`} className="bt-link" style={{ fontSize: 11 }}>Ver</Link>
                          {doc.status === "ABERTO" && (
                            <>
                              <Link href={`/estoque/${doc.id}/editar`} className="bt-link" style={{ fontSize: 11 }}>Editar</Link>
                              <form action={encerrarAction} style={{ display: "contents" }}>
                                <button type="submit" className="bt-link" style={{ fontSize: 11, color: "var(--cor-sucesso)" }}
                                  onClick={(e) => { if (!confirm("Encerrar este documento? O saldo será atualizado.")) e.preventDefault(); }}>
                                  Encerrar
                                </button>
                              </form>
                              <form action={cancelarAction} style={{ display: "contents" }}>
                                <button type="submit" className="bt-link" style={{ fontSize: 11, color: "var(--cor-erro)" }}
                                  onClick={(e) => { if (!confirm("Cancelar este documento?")) e.preventDefault(); }}>
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
            <strong>Nenhum documento encontrado</strong>
            <span>Ajuste os filtros ou crie um novo documento.</span>
          </div>
        )}

        {/* Paginação */}
        {paginas > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "16px 19px", borderTop: "1px solid var(--cor-linha)" }}>
            {Array.from({ length: paginas }, (_, i) => i + 1).map((p) => {
              const params = new URLSearchParams({
                ...(sp.busca ? { busca: sp.busca } : {}),
                ...(sp.tipo ? { tipo: sp.tipo } : {}),
                ...(sp.status ? { status: sp.status } : {}),
                ...(sp.de ? { de: sp.de } : {}),
                ...(sp.ate ? { ate: sp.ate } : {}),
                pagina: String(p),
              });
              return (
                <Link key={p} href={`/estoque?${params.toString()}`}
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
