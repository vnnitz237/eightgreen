"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Boxes, CalendarCheck2, CalendarClock, CheckCircle2, ChevronRight, CircleAlert, SlidersHorizontal } from "lucide-react";
import { filtrarAcoesPorPeriodo, resumirAcoes } from "@/funcionalidades/acoes/consultas";
import { periodoSchema } from "@/funcionalidades/acoes/schemas";
import { formatarDataCurta, formatarInteiro } from "@/lib/formatadores";
import { Status } from "@/componentes/ui/status";
import { CabecalhoPagina } from "@/componentes/compartilhados/cabecalho-pagina";
import type { AcaoPromocional } from "@/funcionalidades/acoes/tipos";
import type { ItemSaldoEstoque } from "./consultas";

const hoje = new Date().toISOString().slice(0, 7);
const inicial = { inicio: `${hoje}-01`, fim: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10) };

type Props = {
  acoes: AcaoPromocional[];
  saldoEstoque: ItemSaldoEstoque[];
};

export function Dashboard({ acoes: todasAcoes, saldoEstoque }: Props) {
  const [rascunho, setRascunho] = useState(inicial);
  const [periodo, setPeriodo] = useState(inicial);
  const [erro, setErro] = useState("");
  const acoes = useMemo(() => filtrarAcoesPorPeriodo(todasAcoes, periodo), [todasAcoes, periodo]);
  const resumo = resumirAcoes(acoes);
  const max = Math.max(...saldoEstoque.map(({ quantidade }) => quantidade), 1);
  const proximasAcoes = todasAcoes.filter((a) => a.status === "aberta" && a.data >= new Date().toISOString().slice(0, 10)).slice(0, 3);
  const abaixoDoMinimo = saldoEstoque.filter((i) => i.quantidade < i.minimo);

  function aplicarFiltro(evento: React.FormEvent) {
    evento.preventDefault();
    const resultado = periodoSchema.safeParse(rascunho);
    if (!resultado.success) { setErro("Revise o período informado."); return; }
    setErro(""); setPeriodo(resultado.data);
  }

  return <div className="pagina-conteudo">
    <CabecalhoPagina etiqueta="Operação" titulo="Visão geral" descricao="Acompanhe as ações promocionais e a posição atual do estoque." />

    <form className="filtro-periodo" onSubmit={aplicarFiltro}>
      <div className="filtro-titulo"><SlidersHorizontal size={18}/><div><strong>Período das ações</strong><span>Indicadores e lista usam o mesmo recorte</span></div></div>
      <label>De<input type="date" value={rascunho.inicio} onChange={(e) => setRascunho({ ...rascunho, inicio: e.target.value })}/></label>
      <label>Até<input type="date" value={rascunho.fim} onChange={(e) => setRascunho({ ...rascunho, fim: e.target.value })}/></label>
      <button type="submit">Aplicar período</button>
      {erro && <p role="alert">{erro}</p>}
    </form>

    <section className="kpis" aria-label="Indicadores de ações">
      <article><div className="kpi-icone azul"><CalendarCheck2/></div><div><span>Total de ações</span><strong>{resumo.total}</strong><small>No período selecionado</small></div></article>
      <article><div className="kpi-icone amarelo"><CalendarClock/></div><div><span>Ações abertas</span><strong>{resumo.abertas}</strong><small>{resumo.total ? Math.round(resumo.abertas / resumo.total * 100) : 0}% do período</small></div></article>
      <article><div className="kpi-icone verde"><CheckCircle2/></div><div><span>Ações encerradas</span><strong>{resumo.encerradas}</strong><small>{resumo.total ? Math.round(resumo.encerradas / resumo.total * 100) : 0}% do período</small></div></article>
    </section>

    <div className="grade-dashboard">
      <section className="painel painel-acoes">
        <div className="painel-cabecalho"><div><h2>Ações no período</h2><p>{acoes.length ? `${formatarDataCurta(periodo.inicio)} — ${formatarDataCurta(periodo.fim)}` : "Nenhum registro no recorte"}</p></div><Link href="/acoes">Ver todas <ArrowRight size={15}/></Link></div>
        {acoes.length ? <div className="tabela-wrap"><table><thead><tr><th>Ação</th><th>Data</th><th>Distribuidora</th><th>Status</th><th aria-label="Abrir"/></tr></thead><tbody>
          {acoes.map((acao) => <tr key={acao.id}><td><strong>{acao.titulo}</strong><small>{acao.id} · {acao.horario}</small></td><td>{formatarDataCurta(acao.data)}</td><td>{acao.distribuidora?.nome ?? "Ação avulsa"}</td><td><Status valor={acao.status}/></td><td><Link href={`/acoes/${acao.id}`} aria-label={`Abrir ${acao.titulo}`}><ChevronRight size={18}/></Link></td></tr>)}
        </tbody></table></div> : <div className="estado-vazio"><CalendarClock/><strong>Nenhuma ação neste período</strong><span>Altere as datas para consultar outro recorte.</span></div>}
      </section>

      <aside className="painel proximas">
        <div className="painel-cabecalho"><div><h2>Próximas ações</h2><p>A partir de hoje</p></div></div>
        {proximasAcoes.map((acao) => <Link href={`/acoes/${acao.id}`} key={acao.id} className="proxima-item"><div className="data-bloco"><strong>{new Date(`${acao.data}T12:00:00`).getDate()}</strong><span>{formatarDataCurta(acao.data).split(" ")[1]}</span></div><div><strong>{acao.titulo}</strong><span>{acao.horario} · {acao.estabelecimento.nome}</span></div><ChevronRight size={17}/></Link>)}
        {!proximasAcoes.length && <div className="estado-vazio"><CalendarClock/><strong>Sem próximas ações</strong></div>}
      </aside>
    </div>

    <section className="painel estoque-painel">
      <div className="painel-cabecalho"><div><h2>Posição atual do estoque</h2><p>Este resumo não acompanha o filtro de ações</p></div><Link href="/estoque/saldo">Ver saldo <ArrowRight size={15}/></Link></div>
      <div className="estoque-corpo">
        <div className="estoque-resumo"><div className="estoque-icone"><Boxes/></div><span>Unidades em posição</span><strong>{formatarInteiro(saldoEstoque.reduce((s, p) => s + p.quantidade, 0))}</strong><small>{saldoEstoque.length} produtos</small></div>
        {saldoEstoque.length > 0 && <div className="grafico-barras" role="img" aria-label="Gráfico de estoque atual por produto">
          {saldoEstoque.map((item) => <div className="barra-linha" key={item.produto}><div><span>{item.produto}</span><strong>{formatarInteiro(item.quantidade)}</strong></div><div className="trilho"><span style={{ width: `${item.quantidade / max * 100}%` }} className={item.quantidade < item.minimo ? "baixo" : ""}/><i style={{ left: `${item.minimo / max * 100}%` }} title={`Mínimo: ${item.minimo}`}/></div></div>)}
          <div className="legenda-grafico"><span><i className="legenda-barra"/>Saldo atual</span><span><i className="legenda-minimo"/>Mínimo</span></div>
        </div>}
        {abaixoDoMinimo.length > 0 && <div className="alerta-estoque"><CircleAlert size={20}/><div><strong>{abaixoDoMinimo.length} produto{abaixoDoMinimo.length > 1 ? "s" : ""} abaixo do mínimo</strong><span>{abaixoDoMinimo.map(i => i.produto).join(", ")}</span><Link href="/estoque/saldo">Consultar saldo</Link></div></div>}
      </div>
    </section>
  </div>;
}
