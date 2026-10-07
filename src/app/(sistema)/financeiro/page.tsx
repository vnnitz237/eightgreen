export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowRight, TrendingDown, TrendingUp, Wallet, PlaneTakeoff } from "lucide-react";
import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import { prisma } from "@/lib/prisma";
import { formatarMoeda } from "@/lib/formatadores";

export default async function FinanceiroPage() {
  const [cpAberta, crAberta, viagens] = await Promise.all([
    prisma.contaPagar.aggregate({ where: { status: "ABERTA" }, _sum: { valor: true }, _count: { id: true } }),
    prisma.contaReceber.aggregate({ where: { status: "ABERTA" }, _sum: { valor: true }, _count: { id: true } }),
    prisma.despesaViagem.aggregate({ _sum: { valor: true }, _count: { id: true } }),
  ]);

  const totalPagar = Number(cpAberta._sum.valor ?? 0);
  const totalReceber = Number(crAberta._sum.valor ?? 0);
  const totalViagens = Number(viagens._sum.valor ?? 0);
  const saldo = totalReceber - totalPagar;

  return (
    <div className="pagina-conteudo">
      <CabecalhoPagina
        etiqueta="Financeiro"
        titulo="Visão geral financeira"
        descricao="Resumo de contas a pagar, a receber e despesas de viagem."
      />

      <div className="kpis" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: 24 }}>
        <article>
          <div className="kpi-icone verde"><TrendingUp /></div>
          <div>
            <span>A receber</span>
            <strong style={{ fontSize: 20 }}>{formatarMoeda(totalReceber)}</strong>
            <small>{crAberta._count.id} título(s) aberto(s)</small>
          </div>
        </article>
        <article>
          <div className="kpi-icone amarelo"><TrendingDown /></div>
          <div>
            <span>A pagar</span>
            <strong style={{ fontSize: 20 }}>{formatarMoeda(totalPagar)}</strong>
            <small>{cpAberta._count.id} título(s) aberto(s)</small>
          </div>
        </article>
        <article>
          <div className="kpi-icone azul"><PlaneTakeoff /></div>
          <div>
            <span>Viagens</span>
            <strong style={{ fontSize: 20 }}>{formatarMoeda(totalViagens)}</strong>
            <small>{viagens._count.id} despesa(s)</small>
          </div>
        </article>
        <article>
          <div className={`kpi-icone ${saldo >= 0 ? "verde" : "vermelho"}`}><Wallet /></div>
          <div>
            <span>Saldo líquido</span>
            <strong style={{ fontSize: 20, color: saldo >= 0 ? "var(--cor-sucesso)" : "var(--cor-erro)" }}>
              {formatarMoeda(saldo)}
            </strong>
            <small>{saldo >= 0 ? "Resultado positivo" : "Resultado negativo"}</small>
          </div>
        </article>
      </div>

      <div className="painel-grade painel-grade-3">
        {[
          { label: "Contas a pagar", href: "/financeiro/contas-pagar", valor: totalPagar, cor: "var(--cor-erro)" },
          { label: "Contas a receber", href: "/financeiro/contas-receber", valor: totalReceber, cor: "var(--cor-sucesso)" },
          { label: "Conta corrente", href: "/financeiro/conta-corrente", valor: null, cor: undefined },
          { label: "Despesas de viagem", href: "/financeiro/viagens", valor: totalViagens, cor: "var(--cor-aviso)" },
          { label: "Títulos em aberto", href: "/financeiro/titulos", valor: null, cor: undefined },
        ].map(({ label, href, valor, cor }) => (
          <div key={href} className="painel">
            <div className="painel-cabecalho">
              <div><h2>{label}</h2></div>
              <Link href={href} style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--cor-sucesso)", fontSize: 10, fontWeight: 700 }}>
                Acessar <ArrowRight size={13} />
              </Link>
            </div>
            {valor !== null && (
              <div style={{ padding: "16px 19px" }}>
                <p style={{ margin: 0, fontSize: 22, fontFamily: "Georgia,serif", fontWeight: 700, color: cor }}>{formatarMoeda(valor)}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
