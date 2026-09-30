"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, Menu, Search } from "lucide-react";
import { gruposNavegacao } from "@/conteudos/navegacao";

const areas = [
  { rotulo: "Dashboard", href: "/" },
  { rotulo: "Ações", href: "/acoes" },
  { rotulo: "Estoque", href: "/estoque/saldo" },
  { rotulo: "Financeiro", href: "/financeiro/conta-corrente" },
];

export function Cabecalho({ abrirMenu }: { abrirMenu: () => void }) {
  const pathname = usePathname();
  return <header className="cabecalho-novo">
    <div className="marca-nova"><span className="marca-folha" aria-hidden="true">8</span><strong>Eight Green</strong></div>
    <button className="menu-mobile" onClick={abrirMenu} aria-label="Abrir navegação"><Menu size={21}/></button>
    <nav className="nav-capsula" aria-label="Áreas principais">
      {areas.map(({ rotulo, href }) => <Link key={href} href={href} className={(href === "/" ? pathname === "/" : pathname.startsWith(href.split("/").slice(0,2).join("/"))) ? "ativo" : ""}>{rotulo}</Link>)}
      <details className="menu-modulos">
        <summary>Mais <ChevronDown size={14}/></summary>
        <div className="menu-modulos-painel">
          {gruposNavegacao.map((grupo) => <section key={grupo.titulo}><strong>{grupo.titulo}</strong>{grupo.itens.map((item) => <Link href={item.href} key={item.href}>{item.rotulo}</Link>)}</section>)}
        </div>
      </details>
    </nav>
    <div className="utilidades">
      <button aria-label="Busca indisponível nesta etapa" title="Busca indisponível nesta etapa" disabled><Search size={20}/></button>
      <button aria-label="Notificações indisponíveis nesta etapa" title="Notificações indisponíveis nesta etapa" disabled><Bell size={19}/></button>
      <Link className="perfil-capsula" href="/configuracoes/perfil" aria-label="Abrir meu perfil"><span>EG</span><div><strong>Equipe</strong><small>Demo</small></div></Link>
    </div>
  </header>;
}
