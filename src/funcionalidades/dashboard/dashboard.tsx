"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Activity, AlertTriangle, ArrowUpRight, CalendarClock, CalendarDays, CheckCircle2, ChevronRight, Plus, TrendingDown, UsersRound, XCircle } from "lucide-react";
import type { AcaoPromocional } from "@/funcionalidades/acoes/tipos";
import { filtrarAcoesPorPeriodo, resumirAcoes } from "@/funcionalidades/acoes/consultas";
import { periodoSchema } from "@/funcionalidades/acoes/schemas";
import { formatarDataCurta, formatarInteiro } from "@/lib/formatadores";
import { Status } from "@/componentes/ui/status";
import type { AlertasFinanceiros, ItemSaldoEstoque } from "./consultas";

type Props = { acoes: AcaoPromocional[]; saldoEstoque: ItemSaldoEstoque[]; alertas: AlertasFinanceiros; modoFuncionario?: boolean };

export function Dashboard({ acoes: acoesIniciais, saldoEstoque, alertas, modoFuncionario = false }: Props) {
  const referencia = new Date().toISOString().slice(0, 10);
  const periodoInicial = { inicio: `${referencia.slice(0, 8)}01`, fim: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10) };
  const [rascunho, setRascunho] = useState(periodoInicial);
  const [periodo, setPeriodo] = useState(periodoInicial);
  const [erro, setErro] = useState("");
  const acoes = useMemo(() => filtrarAcoesPorPeriodo(acoesIniciais, periodo), [periodo, acoesIniciais]);
  const resumo = resumirAcoes(acoes);
  const proximas = acoesIniciais.filter((acao) => acao.status === "aberta" && acao.data >= referencia).slice(0, 4);
  const equipe = Array.from(new Map(proximas.flatMap((acao) => acao.profissionais).map((p) => [p.id, p])).values());
  const semanas = [1, 2, 3, 4, 5].map((semana) => ({ semana, valor: acoes.filter((acao) => Math.min(5, Math.ceil(Number(acao.data.slice(-2)) / 7)) === semana).length }));
  const maiorSemana = Math.max(1, ...semanas.map((item) => item.valor));
  const totalEstoque = saldoEstoque.reduce((soma, item) => soma + item.quantidade, 0);
  const itensBaixos = saldoEstoque.filter((item) => item.quantidade < item.minimo).length;
  const maiorSaldo = Math.max(1, ...saldoEstoque.map((item) => item.quantidade));
  const totalGlobal = acoesIniciais.length;
  const abertasGlobal = acoesIniciais.filter((a) => a.status === "aberta").length;
  const encerradasGlobal = acoesIniciais.filter((a) => a.status === "encerrada").length;
  const canceladasGlobal = acoesIniciais.filter((a) => a.status === "cancelada").length;

  function aplicarFiltro(evento: React.FormEvent) {
    evento.preventDefault();
    const resultado = periodoSchema.safeParse(rascunho);
    if (!resultado.success) { setErro("Revise o período informado."); return; }
    setErro(""); setPeriodo(resultado.data);
  }

  if (modoFuncionario) return <DashboardFuncionario acoes={acoesIniciais} referencia={referencia} />;

  return <div className="dashboard-novo">
    <section className="boas-vindas">
      <div className="boas-vindas-topo">
        <div><span>Operação persistida</span><h1>Olá, <em>Equipe Eight Green</em></h1><p>Visão operacional das ações promocionais e do trabalho em campo.</p></div>
        <Link className="acao-capsula" href="/acoes/nova"><Plus size={18}/>Nova ação</Link>
      </div>
      <form className="filtro-capsula" onSubmit={aplicarFiltro}>
        <label><span>De</span><input type="date" value={rascunho.inicio} onChange={(e) => setRascunho({ ...rascunho, inicio: e.target.value })}/></label>
        <span aria-hidden="true">—</span>
        <label><span>Até</span><input type="date" value={rascunho.fim} onChange={(e) => setRascunho({ ...rascunho, fim: e.target.value })}/></label>
        <button type="submit">Aplicar</button>
        {erro && <small role="alert">{erro}</small>}
      </form>
    </section>

    <section className="kpis" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }} aria-label="Resumo geral">
      <article><div className="kpi-icone azul"><Activity/></div><div><span>Total de ações</span><strong>{totalGlobal}</strong><small>Todos os registros</small></div></article>
      <article><div className="kpi-icone amarelo"><CalendarClock/></div><div><span>Ações abertas</span><strong>{abertasGlobal}</strong><small>{totalGlobal ? Math.round(abertasGlobal / totalGlobal * 100) : 0}% do total</small></div></article>
      <article><div className="kpi-icone verde"><CheckCircle2/></div><div><span>Ações encerradas</span><strong>{encerradasGlobal}</strong><small>{totalGlobal ? Math.round(encerradasGlobal / totalGlobal * 100) : 0}% do total</small></div></article>
      <article><div className="kpi-icone vermelho"><XCircle/></div><div><span>Ações canceladas</span><strong>{canceladasGlobal}</strong><small>{totalGlobal ? Math.round(canceladasGlobal / totalGlobal * 100) : 0}% do total</small></div></article>
    </section>

    {(alertas.cpVencidas > 0 || alertas.crVencidas > 0 || alertas.saldoNegativo > 0) && (
      <section className="kpis" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }} aria-label="Alertas financeiros">
        <Link href="/financeiro/contas-pagar" style={{ textDecoration: "none" }}>
          <article style={{ cursor: "pointer" }}>
            <div className={`kpi-icone ${alertas.cpVencidas > 0 ? "vermelho" : "verde"}`}><AlertTriangle/></div>
            <div>
              <span>CP vencidas</span>
              <strong>{alertas.cpVencidas}</strong>
              <small>{alertas.cpVencidas > 0 ? "Requer atenção" : "Em dia"}</small>
            </div>
          </article>
        </Link>
        <Link href="/financeiro/contas-receber" style={{ textDecoration: "none" }}>
          <article style={{ cursor: "pointer" }}>
            <div className={`kpi-icone ${alertas.crVencidas > 0 ? "amarelo" : "verde"}`}><AlertTriangle/></div>
            <div>
              <span>CR vencidas</span>
              <strong>{alertas.crVencidas}</strong>
              <small>{alertas.crVencidas > 0 ? "Requer atenção" : "Em dia"}</small>
            </div>
          </article>
        </Link>
        <Link href="/estoque/saldo" style={{ textDecoration: "none" }}>
          <article style={{ cursor: "pointer" }}>
            <div className={`kpi-icone ${alertas.saldoNegativo > 0 ? "vermelho" : "verde"}`}><TrendingDown/></div>
            <div>
              <span>Saldo negativo</span>
              <strong>{alertas.saldoNegativo}</strong>
              <small>{alertas.saldoNegativo > 0 ? "Produto(s) com saldo negativo" : "Estoque OK"}</small>
            </div>
          </article>
        </Link>
      </section>
    )}

    <section className="grid-referencia">
      <article className="card-ref resumo-acoes">
        <CabecalhoCard titulo="Resumo de ações" subtitulo={`${formatarDataCurta(periodo.inicio)} — ${formatarDataCurta(periodo.fim)}`} href="/acoes" />
        <div className="destaque-verde">
          <span>Ações no período</span><strong>{resumo.total}</strong><small>Registros no intervalo selecionado</small>
          <div><span><i className="ponto-status aberto"/>Abertas <b>{resumo.abertas}</b></span><span><i className="ponto-status encerrado"/>Encerradas <b>{resumo.encerradas}</b></span></div>
        </div>
        <div className="indicador-complementar"><div><span>Taxa de encerramento</span><strong>{resumo.total ? Math.round(resumo.encerradas / resumo.total * 100) : 0}%</strong></div><div className="progresso"><i style={{ width: `${resumo.total ? resumo.encerradas / resumo.total * 100 : 0}%` }}/></div><small>Derivada apenas do status das ações no período</small></div>
      </article>

      <article className="card-ref grafico-acoes">
        <div className="card-topo"><div className="icone-card"><CalendarDays size={18}/></div><div><h2>Ações por semana</h2><p>Distribuição no período selecionado</p></div><div className="segmentado" aria-label="Agrupamento do gráfico"><button className="ativo">Semanal</button><button disabled title="Visão mensal indisponível">Mensal</button></div></div>
        <div className="grafico-grade">
          <div className="eixo-y"><span>{maiorSemana}</span><span>{Math.ceil(maiorSemana / 2)}</span><span>0</span></div>
          <div className="barras-semana">
            {semanas.map((item) => <div className="coluna-semana" key={item.semana}><div className="barra-ref" style={{ height: `${item.valor ? Math.max(24, item.valor / maiorSemana * 100) : 4}%` }}><span>{item.valor}</span></div><small>S{item.semana}</small></div>)}
          </div>
        </div>
        <div className="grafico-legenda"><span><i/>Quantidade de ações</span><strong>{resumo.total} no total</strong></div>
      </article>

      <article className="card-ref saldo-estoque">
        <CabecalhoCard titulo="Estoque atual" subtitulo="Posição independente do período" href="/estoque/saldo" />
        <div className="estoque-numero"><span>Unidades em posição</span><strong>{formatarInteiro(totalEstoque)}</strong><small>Posição atual registrada no sistema</small></div>
        <div className="sparkline" aria-label="Distribuição relativa do estoque">
          {saldoEstoque.map((item) => <i key={item.produto} style={{ height: `${Math.max(16, item.quantidade / maiorSaldo * 100)}%` }}/>) }
        </div>
        <div className="estoque-alerta"><span className={itensBaixos ? "pendente" : "positivo"}>{itensBaixos} abaixo do mínimo</span><Link href="/estoque/saldo">Ver saldo <ChevronRight size={14}/></Link></div>
      </article>

      <article className="card-ref tabela-proximas">
        <CabecalhoCard titulo="Próximas ações" subtitulo={`Agenda operacional a partir de ${formatarDataCurta(referencia)}`} href="/acoes" />
        <div className="tabela-ref-wrap"><table><thead><tr><th>Ação</th><th>Data e hora</th><th>Distribuidora</th><th>Equipe</th><th>Status</th><th/></tr></thead><tbody>
          {proximas.map((acao) => <tr key={acao.id}><td><span className="acao-identidade"><i>{acao.titulo.charAt(0)}</i><span><strong>{acao.titulo}</strong><small>{acao.id}</small></span></span></td><td><strong>{formatarDataCurta(acao.data)}</strong><small>{acao.horario}</small></td><td>{acao.distribuidora?.nome ?? "Ação avulsa"}</td><td>{acao.profissionais.length} {acao.profissionais.length === 1 ? "profissional" : "profissionais"}</td><td><Status valor={acao.status}/></td><td><Link href={`/acoes/${acao.id}`} aria-label={`Abrir ${acao.titulo}`}><ArrowUpRight size={16}/></Link></td></tr>)}
        </tbody></table></div>
      </article>

      <article className="card-ref equipe-escalada">
        <div className="card-topo"><div className="icone-card"><UsersRound size={18}/></div><div><h2>Equipe escalada</h2><p>Próximas ações abertas</p></div></div>
        <div className="avatares-equipe">{equipe.map((pessoa, indice) => <span key={pessoa.id} style={{ "--avatar": indice } as React.CSSProperties} title={pessoa.nome}>{pessoa.nome.split(" ").map((parte) => parte[0]).slice(0,2).join("")}</span>)}</div>
        <strong className="total-equipe">{equipe.length} profissionais</strong><p className="texto-equipe">Escaladas em {proximas.length} ações futuras persistidas.</p>
        <div className="lista-equipe">{equipe.slice(0,3).map((pessoa) => <div key={pessoa.id}><span>{pessoa.nome}</span><small>{pessoa.modo === "avulsa" ? "Participação avulsa" : "Cadastrada"}</small></div>)}</div>
        <Link className="link-equipe" href="/cadastros/degustadoras">Ver profissionais <ArrowUpRight size={15}/></Link>
      </article>
    </section>
  </div>;
}

function CabecalhoCard({ titulo, subtitulo, href }: { titulo: string; subtitulo: string; href: string }) {
  return <div className="card-topo"><div><h2>{titulo}</h2><p>{subtitulo}</p></div><Link href={href} aria-label={`Abrir ${titulo}`}><ArrowUpRight size={17}/></Link></div>;
}

function DashboardFuncionario({ acoes, referencia }: { acoes: AcaoPromocional[]; referencia: string }) {
  const proximas = acoes.filter((a) => a.status === "aberta" && a.data >= referencia);
  const historico = acoes.filter((a) => a.status !== "aberta" || a.data < referencia);
  return (
    <div className="dashboard-novo">
      <section className="boas-vindas">
        <div className="boas-vindas-topo">
          <div><span>Minhas ações</span><h1>Olá, <em>Equipe Eight Green</em></h1><p>Acompanhe suas ações agendadas e encerradas.</p></div>
        </div>
      </section>
      <section className="kpis" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }} aria-label="Resumo">
        <article><div className="kpi-icone azul"><Activity/></div><div><span>Total atribuídas</span><strong>{acoes.length}</strong><small>Todas as ações</small></div></article>
        <article><div className="kpi-icone amarelo"><CalendarClock/></div><div><span>Próximas</span><strong>{proximas.length}</strong><small>Abertas a partir de hoje</small></div></article>
        <article><div className="kpi-icone verde"><CheckCircle2/></div><div><span>Encerradas</span><strong>{acoes.filter((a) => a.status === "encerrada").length}</strong><small>Já realizadas</small></div></article>
      </section>
      <section className="grid-referencia">
        <article className="card-ref tabela-proximas" style={{ gridColumn: "1/-1" }}>
          <div className="card-topo"><div><h2>Próximas ações</h2><p>Abertas a partir de hoje</p></div><Link href="/acoes" aria-label="Ver todas"><ArrowUpRight size={17}/></Link></div>
          {proximas.length === 0 ? (
            <div className="estado-vazio"><strong>Nenhuma ação futura</strong><span>Você não tem ações abertas agendadas.</span></div>
          ) : (
            <div className="tabela-ref-wrap"><table><thead><tr><th>Ação</th><th>Data</th><th>Local</th><th>Status</th><th/></tr></thead><tbody>
              {proximas.map((acao) => (
                <tr key={acao.id}>
                  <td><strong>{acao.titulo}</strong></td>
                  <td><strong>{formatarDataCurta(acao.data)}</strong><small>{acao.horario}</small></td>
                  <td>{acao.estabelecimento.modo === "cadastrado" ? acao.estabelecimento.nome : acao.estabelecimento.nome}</td>
                  <td><Status valor={acao.status}/></td>
                  <td><Link href={`/acoes/${acao.id}`} aria-label={`Abrir ${acao.titulo}`}><ArrowUpRight size={16}/></Link></td>
                </tr>
              ))}
            </tbody></table></div>
          )}
        </article>
        {historico.length > 0 && (
          <article className="card-ref tabela-proximas" style={{ gridColumn: "1/-1" }}>
            <div className="card-topo"><div><h2>Histórico</h2><p>Ações encerradas ou passadas</p></div></div>
            <div className="tabela-ref-wrap"><table><thead><tr><th>Ação</th><th>Data</th><th>Local</th><th>Status</th><th/></tr></thead><tbody>
              {historico.slice(0, 10).map((acao) => (
                <tr key={acao.id}>
                  <td><strong>{acao.titulo}</strong></td>
                  <td><strong>{formatarDataCurta(acao.data)}</strong><small>{acao.horario}</small></td>
                  <td>{acao.estabelecimento.modo === "cadastrado" ? acao.estabelecimento.nome : acao.estabelecimento.nome}</td>
                  <td><Status valor={acao.status}/></td>
                  <td><Link href={`/acoes/${acao.id}`} aria-label={`Abrir ${acao.titulo}`}><ArrowUpRight size={16}/></Link></td>
                </tr>
              ))}
            </tbody></table></div>
          </article>
        )}
      </section>
    </div>
  );
}
