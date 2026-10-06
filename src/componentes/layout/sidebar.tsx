"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, CalendarClock, CalendarDays, CircleDollarSign, Gauge, Settings2, UsersRound, X } from "lucide-react";

const destinos = [
  { rotulo: "Visão geral", href: "/", icone: Gauge },
  { rotulo: "Ações", href: "/acoes", icone: CalendarDays },
  { rotulo: "Agenda", href: "/agenda", icone: CalendarClock },
  { rotulo: "Estoque", href: "/estoque/saldo", icone: Boxes },
  { rotulo: "Financeiro", href: "/financeiro/conta-corrente", icone: CircleDollarSign },
];

export function Sidebar({ aberta, fechar }: { aberta: boolean; fechar: () => void }) {
  const pathname = usePathname();
  return <>
    {aberta && <button className="overlay" aria-label="Fechar navegação" onClick={fechar}/>}
    <aside className={`trilho-lateral ${aberta ? "aberto" : ""}`} aria-label="Atalhos contextuais">
      <button className="fechar-trilho" onClick={fechar} aria-label="Fechar menu"><X size={19}/></button>
      <nav className="trilho-grupo">
        {destinos.map(({ rotulo, href, icone: Icone }) => {
          const ativo = href === "/" ? pathname === "/" : pathname.startsWith(href.split("/").slice(0,2).join("/"));
          return <Link key={href} href={href} className={ativo ? "ativo" : ""} aria-label={rotulo} data-tooltip={rotulo} onClick={fechar}><Icone size={20}/></Link>;
        })}
      </nav>
      <nav className="trilho-grupo trilho-inferior">
        <Link href="/pessoal/agenda" aria-label="Equipe e agenda" data-tooltip="Equipe e agenda" onClick={fechar}><UsersRound size={20}/></Link>
        <Link href="/configuracoes/perfil" aria-label="Configurações" data-tooltip="Configurações" onClick={fechar}><Settings2 size={20}/></Link>
      </nav>
    </aside>
  </>;
}
