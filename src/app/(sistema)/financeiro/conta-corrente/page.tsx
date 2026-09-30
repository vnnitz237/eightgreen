export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowRight, TrendingDown, TrendingUp, Wallet, BarChart2 } from "lucide-react";
import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { listarContaCorrente } from "@/funcionalidades/financeiro/consultas";
import { formatarMoeda } from "@/lib/formatadores";

export default async function ContaCorrentePage() {
  const { totalPagar, totalReceber, totalDespesas, saldo } = await listarContaCorrente();

  return (
    <div className="pagina-conteudo">
      <CabecalhoPagina etiqueta="Financeiro" titulo="Conta corrente" descricao="Resumo financeiro geral do período." />

      <div className="kpis" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        <article>
          <div className="kpi-icone verde"><TrendingUp /></div>
          <div>
            <span>A receber</span>
            <strong style={{ fontSize: 20 }}>{formatarMoeda(totalReceber)}</strong>
            <small>Contas a receber</small>
          </div>
        </article>
        <article>
          <div className="kpi-icone amarelo"><TrendingDown /></div>
          <div>
            <span>A pagar</span>
            <strong style={{ fontSize: 20 }}>{formatarMoeda(totalPagar)}</strong>
            <small>Contas a pagar</small>
          </div>
        </article>
        <article>
          <div className="kpi-icone azul"><BarChart2 /></div>
          <div>
            <span>Despesas</span>
            <strong style={{ fontSize: 20 }}>{formatarMoeda(totalDespesas)}</strong>
            <small>Operacionais</small>
          </div>
        </article>
        <article>
          <div className={`kpi-icone ${saldo >= 0 ? "verde" : "amarelo"}`}><Wallet /></div>
          <div>
            <span>Saldo</span>
            <strong style={{ fontSize: 20, color: saldo >= 0 ? "var(--verde-700)" : "#9b3c34" }}>
              {formatarMoeda(saldo)}
            </strong>
            <small>{saldo >= 0 ? "Resultado positivo" : "Resultado negativo"}</small>
          </div>
        </article>
      </div>

      <div className="painel-grade painel-grade-3" style={{ marginBottom: 18 }}>
        <div className="painel">
          <div className="painel-cabecalho">
            <div><h2>A receber</h2></div>
            <Link href="/financeiro/a-receber" style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--verde-700)", fontSize: 10, fontWeight: 700 }}>
              Ver <ArrowRight size={13} />
            </Link>
          </div>
          <div style={{ padding: "16px 19px" }}>
            <p style={{ margin: 0, fontSize: 24, fontFamily: "Georgia,serif", fontWeight: 700, color: "var(--verde-700)" }}>{formatarMoeda(totalReceber)}</p>
          </div>
        </div>

        <div className="painel">
          <div className="painel-cabecalho">
            <div><h2>A pagar</h2></div>
            <Link href="/financeiro/a-pagar" style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--verde-700)", fontSize: 10, fontWeight: 700 }}>
              Ver <ArrowRight size={13} />
            </Link>
          </div>
          <div style={{ padding: "16px 19px" }}>
            <p style={{ margin: 0, fontSize: 24, fontFamily: "Georgia,serif", fontWeight: 700, color: "#9b3c34" }}>{formatarMoeda(totalPagar)}</p>
          </div>
        </div>

        <div className="painel">
          <div className="painel-cabecalho">
            <div><h2>Despesas</h2></div>
            <Link href="/financeiro/despesas" style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--verde-700)", fontSize: 10, fontWeight: 700 }}>
              Ver <ArrowRight size={13} />
            </Link>
          </div>
          <div style={{ padding: "16px 19px" }}>
            <p style={{ margin: 0, fontSize: 24, fontFamily: "Georgia,serif", fontWeight: 700, color: "var(--amarelo)" }}>{formatarMoeda(totalDespesas)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
