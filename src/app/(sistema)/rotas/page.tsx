export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { listarRotas } from "@/lib/actions/merchan";
import { formatarDataCurta } from "@/lib/formatadores";

type SearchParams = Promise<{ busca?: string; pagina?: string }>;

const corStatus: Record<string, string> = {
  PENDENTE: "cinza",
  EM_ANDAMENTO: "azul",
  CONCLUIDA: "verde",
  CANCELADA: "vermelho",
};

const labelStatus: Record<string, string> = {
  PENDENTE: "Pendente",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDA: "Concluída",
  CANCELADA: "Cancelada",
};

export default async function RotasPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const pagina = Number(sp.pagina ?? 1);

  const { rotas, total, paginas } = await listarRotas({ busca: sp.busca, pagina });
  const inicio = total === 0 ? 0 : (pagina - 1) * 20 + 1;
  const fim = Math.min(pagina * 20, total);

  return (
    <div className="pagina-conteudo">
      <CabecalhoPagina
        etiqueta="Equipe"
        titulo="Rotas"
        descricao={`${total} rota(s)`}
        acao={
          <Link href="/rotas/nova" className="botao">
            <Plus size={14} /> Nova rota
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
              <input name="busca" defaultValue={sp.busca ?? ""} placeholder="Nome ou descrição…" style={{ paddingLeft: 30 }} />
            </div>
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="botao">Filtrar</button>
            <Link href="/rotas" className="bt-secundario">Limpar</Link>
          </div>
        </form>
      </div>

      {/* Lista */}
      <div className="painel">
        <div className="painel-cabecalho">
          <div>
            <h2>Rotas</h2>
            {total > 0 ? <p>Mostrando {inicio}–{fim} de {total}</p> : <p>Nenhuma rota</p>}
          </div>
        </div>

        {rotas.length > 0 ? (
          <div className="tabela-wrap">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Nome</th>
                  <th>Promotor</th>
                  <th>Paradas</th>
                  <th>Status</th>
                  <th aria-label="Ações" />
                </tr>
              </thead>
              <tbody>
                {rotas.map((r) => (
                  <tr key={r.id}>
                    <td>{formatarDataCurta(r.data.toISOString().slice(0, 10))}</td>
                    <td><strong>{r.nome || r.descricao}</strong></td>
                    <td>{r.promotor?.name ?? <span style={{ color: "var(--cor-texto-3)" }}>—</span>}</td>
                    <td>
                      <span style={{ fontFamily: "monospace" }}>
                        {r.paradas.filter((p) => p.visitado).length}/{r.paradas.length}
                      </span>
                    </td>
                    <td>
                      <span className={`tag tag-${corStatus[r.status] ?? "cinza"}`}>
                        {labelStatus[r.status] ?? r.status}
                      </span>
                    </td>
                    <td>
                      <Link href={`/rotas/${r.id}`} className="bt-link" style={{ fontSize: 12 }}>Ver</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="estado-vazio" style={{ minHeight: 80 }}>
            <span>Nenhuma rota encontrada.</span>
          </div>
        )}

        {paginas > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "16px 19px", borderTop: "1px solid var(--cor-linha)" }}>
            {Array.from({ length: paginas }, (_, i) => i + 1).map((p) => {
              const params = new URLSearchParams({ ...(sp.busca ? { busca: sp.busca } : {}), pagina: String(p) });
              return (
                <Link key={p} href={`/rotas?${params.toString()}`}
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
