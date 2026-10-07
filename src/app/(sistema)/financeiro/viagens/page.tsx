export const dynamic = "force-dynamic";

import Link from "next/link";
import { Search } from "lucide-react";
import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { listarDespesasViagem, criarDespesaViagem, aprovarDespesaViagem } from "@/lib/actions/financeiro";
import { prisma } from "@/lib/prisma";
import { formatarDataCurta, formatarMoeda } from "@/lib/formatadores";

type SearchParams = Promise<{ busca?: string; pagina?: string }>;

export default async function ViagensPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const pagina = Number(sp.pagina ?? 1);

  const [{ despesas, total, paginas }, colaboradores] = await Promise.all([
    listarDespesasViagem({ busca: sp.busca, pagina }),
    prisma.usuario.findMany({ where: { ativo: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const inicio = total === 0 ? 0 : (pagina - 1) * 20 + 1;
  const fim = Math.min(pagina * 20, total);
  const totalValor = despesas.reduce((s, d) => s + Number(d.valor), 0);

  async function criar(formData: FormData) {
    "use server";
    await criarDespesaViagem(formData);
  }

  async function aprovar(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await aprovarDespesaViagem(id);
  }

  return (
    <div className="pagina-conteudo">
      <CabecalhoPagina
        etiqueta="Financeiro"
        titulo="Despesas de viagem"
        descricao={`${total} despesa(s) · Total: ${formatarMoeda(totalValor)}`}
      />

      {/* Filtros */}
      <div className="painel" style={{ marginBottom: 18 }}>
        <div className="painel-cabecalho"><div><h2>Filtros</h2></div></div>
        <form method="GET" className="form-completo" style={{ padding: "14px 19px" }}>
          <label>
            Buscar
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--cor-texto-3)" }} />
              <input name="busca" defaultValue={sp.busca ?? ""} placeholder="Descrição ou destino…" style={{ paddingLeft: 30 }} />
            </div>
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="botao">Filtrar</button>
            <Link href="/financeiro/viagens" className="bt-secundario">Limpar</Link>
          </div>
        </form>
      </div>

      {/* Lista */}
      <div className="painel" style={{ marginBottom: 18 }}>
        <div className="painel-cabecalho">
          <div>
            <h2>Registros</h2>
            {total > 0
              ? <p>Mostrando {inicio}–{fim} de {total}</p>
              : <p>Nenhum registro</p>}
          </div>
        </div>
        {despesas.length > 0 ? (
          <div className="tabela-wrap">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Destino</th>
                  <th>Tipo</th>
                  <th>Colaborador</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Valor</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {despesas.map((d) => (
                  <tr key={d.id}>
                    <td>{formatarDataCurta(d.data.toISOString().slice(0, 10))}</td>
                    <td><strong>{d.descricao}</strong></td>
                    <td>{d.destino ?? <span style={{ color: "var(--cor-texto-3)" }}>—</span>}</td>
                    <td>{d.tipoDespesa ?? <span style={{ color: "var(--cor-texto-3)" }}>—</span>}</td>
                    <td>{d.colaborador?.name ?? <span style={{ color: "var(--cor-texto-3)" }}>—</span>}</td>
                    <td>
                      <span style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 600,
                        background: d.status === "APROVADA" ? "var(--cor-sucesso-fundo, #dcfce7)" : "var(--cor-alerta-fundo, #fef9c3)",
                        color: d.status === "APROVADA" ? "var(--cor-sucesso, #166534)" : "var(--cor-alerta, #854d0e)",
                      }}>
                        {d.status === "APROVADA" ? "Aprovada" : d.status === "REJEITADA" ? "Rejeitada" : "Pendente"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{formatarMoeda(Number(d.valor))}</td>
                    <td>
                      {d.status !== "APROVADA" && (
                        <form action={aprovar}>
                          <input type="hidden" name="id" value={d.id} />
                          <button type="submit" className="botao" style={{ fontSize: 11, padding: "3px 10px", whiteSpace: "nowrap" }}>
                            Aprovar e gerar CP
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={6} style={{ textAlign: "right", fontWeight: 700 }}>Total</td>
                  <td style={{ textAlign: "right", fontWeight: 700 }}>{formatarMoeda(totalValor)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="estado-vazio" style={{ minHeight: 80 }}>
            <span>Nenhuma despesa encontrada.</span>
          </div>
        )}

        {paginas > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "16px 19px", borderTop: "1px solid var(--cor-linha)" }}>
            {Array.from({ length: paginas }, (_, i) => i + 1).map((p) => {
              const params = new URLSearchParams({ ...(sp.busca ? { busca: sp.busca } : {}), pagina: String(p) });
              return (
                <Link key={p} href={`/financeiro/viagens?${params.toString()}`}
                  className={p === pagina ? "botao" : "bt-secundario"}
                  style={{ height: 30, width: 30, padding: 0, display: "grid", placeItems: "center", fontSize: 12 }}>
                  {p}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Nova despesa */}
      <div className="painel">
        <div className="painel-cabecalho"><div><h2>Nova despesa</h2></div></div>
        <form action={criar} className="form-completo" style={{ padding: "14px 19px" }}>
          <div className="form-completo-grupo">
            <label>
              Descrição *
              <input name="descricao" required placeholder="Ex: Hospedagem, Alimentação…" />
            </label>
            <label>
              Data *
              <input name="data" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
            </label>
            <label>
              Valor *
              <input name="valor" type="number" step="0.01" min="0.01" required placeholder="0,00" />
            </label>
          </div>
          <div className="form-completo-grupo">
            <label>
              Destino
              <input name="destino" placeholder="Ex: São Paulo – SP" />
            </label>
            <label>
              Tipo
              <input name="tipoDespesa" placeholder="Ex: Hospedagem, Combustível…" />
            </label>
            <label>
              Colaborador
              <select name="colaboradorId">
                <option value="">— Selecionar —</option>
                {colaboradores.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </label>
          </div>
          <button type="submit" className="botao">Registrar despesa</button>
        </form>
      </div>
    </div>
  );
}
