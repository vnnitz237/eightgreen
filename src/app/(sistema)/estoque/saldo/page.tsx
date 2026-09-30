export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowRight, Boxes } from "lucide-react";
import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { calcularSaldoEstoque } from "@/funcionalidades/estoque/consultas";
import { formatarInteiro } from "@/lib/formatadores";

export default async function SaldoEstoquePage() {
  const saldo = await calcularSaldoEstoque();
  const total = saldo.reduce((s, p) => s + p.quantidade, 0);
  const abaixoDoMinimo = saldo.filter((p) => p.quantidade < p.minimo);
  const max = Math.max(...saldo.map((p) => p.quantidade), 1);

  return (
    <div className="pagina-conteudo">
      <CabecalhoPagina etiqueta="Estoque" titulo="Saldo de estoque" descricao="Posição atual de cada produto em estoque." />

      <div className="kpis" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        <article>
          <div className="kpi-icone verde"><Boxes /></div>
          <div>
            <span>Total em estoque</span>
            <strong>{formatarInteiro(total)}</strong>
            <small>{saldo.length} produtos</small>
          </div>
        </article>
        <article>
          <div className="kpi-icone amarelo"><Boxes /></div>
          <div>
            <span>Abaixo do mínimo</span>
            <strong>{abaixoDoMinimo.length}</strong>
            <small>{abaixoDoMinimo.length > 0 ? "reposição necessária" : "estoque adequado"}</small>
          </div>
        </article>
        <article>
          <div className="kpi-icone azul"><Boxes /></div>
          <div>
            <span>Produtos ativos</span>
            <strong>{saldo.length}</strong>
            <small>com movimentações</small>
          </div>
        </article>
      </div>

      <div className="painel">
        <div className="painel-cabecalho">
          <div><h2>Saldo por produto</h2><p>Calculado com base em todas as movimentações</p></div>
          <Link href="/estoque/entradas" style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--verde-700)", fontSize: 10, fontWeight: 700 }}>
            Registrar entrada <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ padding: "20px 19px" }}>
          {saldo.length > 0 ? (
            <>
              <div className="grafico-barras">
                {saldo.map((item) => (
                  <div className="barra-linha" key={item.produto}>
                    <div>
                      <span>{item.produto}</span>
                      <strong>{formatarInteiro(item.quantidade)} {item.quantidade < item.minimo && <span style={{ color: "#d49b34", fontSize: 9, marginLeft: 4 }}>▼ abaixo do mínimo</span>}</strong>
                    </div>
                    <div className="trilho">
                      <span style={{ width: `${item.quantidade / max * 100}%` }} className={item.quantidade < item.minimo ? "baixo" : ""} />
                      <i style={{ left: `${item.minimo / max * 100}%` }} title={`Mínimo: ${item.minimo}`} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="legenda-grafico" style={{ marginTop: 16 }}>
                <span><i className="legenda-barra" />Saldo atual</span>
                <span><i className="legenda-minimo" />Mínimo</span>
              </div>
            </>
          ) : (
            <div className="estado-vazio"><strong>Sem dados de estoque</strong><span>Registre movimentações para ver o saldo.</span></div>
          )}
        </div>

        {saldo.length > 0 && (
          <div className="tabela-wrap">
            <table>
              <thead><tr><th>Produto</th><th>Saldo atual</th><th>Estoque mínimo</th><th>Situação</th></tr></thead>
              <tbody>
                {saldo.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.produto}</strong></td>
                    <td>{formatarInteiro(item.quantidade)}</td>
                    <td>{formatarInteiro(item.minimo)}</td>
                    <td>
                      <span className={item.quantidade < item.minimo ? "badge badge-saida" : "badge badge-entrada"}>
                        {item.quantidade < item.minimo ? "Abaixo do mínimo" : "Adequado"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
