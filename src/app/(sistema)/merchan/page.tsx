export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { listarMerchan } from "@/lib/actions/merchan";
import { formatarDataCurta } from "@/lib/formatadores";

type SearchParams = Promise<{ busca?: string; pagina?: string }>;

export default async function MerchanPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const pagina = Number(sp.pagina ?? 1);

  const { visitas, total, paginas } = await listarMerchan({ busca: sp.busca, pagina });
  const inicio = total === 0 ? 0 : (pagina - 1) * 20 + 1;
  const fim = Math.min(pagina * 20, total);

  return (
    <div className="pagina-conteudo">
      <CabecalhoPagina
        etiqueta="Merchan"
        titulo="Visitas de merchandising"
        descricao={`${total} registro(s)`}
        acao={
          <Link href="/merchan/novo" className="botao">
            <Plus size={14} /> Nova visita
          </Link>
        }
      />

      {/* Filtros */}
      <div className="painel" style={{ marginBottom: 18 }}>
        <div className="painel-cabecalho"><div><h2>Filtros</h2></div></div>
        <form method="GET" className="form-completo" style={{ padding: "14px 19px" }}>
          <label>
            Buscar
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--cor-texto-3)" }} />
              <input name="busca" defaultValue={sp.busca ?? ""} placeholder="Estabelecimento ou promotor…" style={{ paddingLeft: 30 }} />
            </div>
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="botao">Filtrar</button>
            <Link href="/merchan" className="bt-secundario">Limpar</Link>
          </div>
        </form>
      </div>

      {/* Lista */}
      <div className="painel">
        <div className="painel-cabecalho">
          <div>
            <h2>Registros</h2>
            {total > 0 ? <p>Mostrando {inicio}–{fim} de {total}</p> : <p>Nenhum registro</p>}
          </div>
        </div>

        {visitas.length > 0 ? (
          <div className="tabela-wrap">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Estabelecimento</th>
                  <th>Promotor</th>
                  <th>Entrada</th>
                  <th>Saída</th>
                  <th>Checklist</th>
                  <th aria-label="Ações" />
                </tr>
              </thead>
              <tbody>
                {visitas.map((v) => (
                  <tr key={v.id}>
                    <td>{formatarDataCurta(v.data.toISOString().slice(0, 10))}</td>
                    <td><strong>{v.estabelecimento?.razaoSocial ?? <span style={{ color: "var(--cor-texto-3)" }}>—</span>}</strong></td>
                    <td>{v.promotor?.name ?? <span style={{ color: "var(--cor-texto-3)" }}>—</span>}</td>
                    <td>{v.horaEntrada ?? <span style={{ color: "var(--cor-texto-3)" }}>—</span>}</td>
                    <td>{v.horaSaida ?? <span style={{ color: "var(--cor-texto-3)" }}>—</span>}</td>
                    <td>
                      <span className={`tag tag-${v.checklistOk ? "verde" : "cinza"}`}>
                        {v.checklistOk ? "OK" : "Pendente"}
                      </span>
                    </td>
                    <td>
                      <Link href={`/merchan/${v.id}`} className="bt-link" style={{ fontSize: 12 }}>Ver</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="estado-vazio" style={{ minHeight: 80 }}>
            <span>Nenhuma visita encontrada.</span>
          </div>
        )}

        {paginas > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "16px 19px", borderTop: "1px solid var(--cor-linha)" }}>
            {Array.from({ length: paginas }, (_, i) => i + 1).map((p) => {
              const params = new URLSearchParams({ ...(sp.busca ? { busca: sp.busca } : {}), pagina: String(p) });
              return (
                <Link key={p} href={`/merchan?${params.toString()}`}
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
