"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, Menu, Search } from "lucide-react";
import { gruposNavegacao } from "@/conteudos/navegacao";
import { sair } from "@/app/actions/autenticacao-interna";

const areasAdmin = [
  { rotulo: "Dashboard", href: "/" },
  { rotulo: "Ações", href: "/acoes" },
  { rotulo: "Estoque", href: "/estoque/saldo" },
  { rotulo: "Financeiro", href: "/financeiro/conta-corrente" },
];

const areasFuncionario = [
  { rotulo: "Dashboard", href: "/" },
  { rotulo: "Ações", href: "/acoes" },
];

export function Cabecalho({ abrirMenu, usuario }: { abrirMenu: () => void; usuario: { nome: string | null; email: string; papel: "ADMINISTRADOR" | "FUNCIONARIO" } }) {
  const pathname = usePathname();
  const ehAdmin = usuario.papel === "ADMINISTRADOR";
  const areas = ehAdmin ? areasAdmin : areasFuncionario;
  const iniciais = (usuario.nome ?? usuario.email).split(/\s|@/).filter(Boolean).slice(0, 2).map((parte) => parte[0]).join("").toUpperCase();
  return <header className="cabecalho-novo">
    <div className="marca-nova"><span className="marca-folha" aria-hidden="true">8</span><strong>Eight Green</strong></div>
    <button className="menu-mobile" onClick={abrirMenu} aria-label="Abrir navegação"><Menu size={21}/></button>
    <nav className="nav-capsula" aria-label="Áreas principais">
      {areas.map(({ rotulo, href }) => <Link key={href} href={href} className={(href === "/" ? pathname === "/" : pathname.startsWith(href.split("/").slice(0,2).join("/"))) ? "ativo" : ""}>{rotulo}</Link>)}
      {ehAdmin && <details className="menu-modulos">
        <summary>Mais <ChevronDown size={14}/></summary>
        <div className="menu-modulos-painel">
          <section><strong>Cadastros</strong><Link href="/cadastros/canais">Canais</Link><Link href="/cadastros/bancos">Bancos</Link><Link href="/cadastros/estabelecimentos">Estabelecimentos</Link><Link href="/cadastros/degustadoras">Degustadoras</Link><Link href="/cadastros/fornecedores">Fornecedores</Link><Link href="/cadastros/grupos-produto">Grupos de produtos</Link><Link href="/cadastros/produtos">Produtos</Link></section>
          {gruposNavegacao.map((grupo) => <section key={grupo.titulo}><strong>{grupo.titulo}</strong>{grupo.itens.map((item) => <Link href={item.href} key={item.href}>{item.rotulo}</Link>)}</section>)}
          <section><strong>Administração</strong><Link href="/configuracoes/usuarios">Usuários e acessos</Link></section>
        </div>
      </details>}
    </nav>
    <div className="utilidades">
      <button aria-label="Busca indisponível nesta etapa" title="Busca indisponível nesta etapa" disabled><Search size={20}/></button>
      <button aria-label="Notificações indisponíveis nesta etapa" title="Notificações indisponíveis nesta etapa" disabled><Bell size={19}/></button>
      <Link className="perfil-capsula" href="/configuracoes/perfil" aria-label="Abrir meu perfil"><span>{iniciais}</span><div><strong>{usuario.nome ?? usuario.email}</strong><small>{usuario.papel === "ADMINISTRADOR" ? "Administrador" : "Funcionário"}</small></div></Link>
      <form action={sair}><button type="submit" className="botao-icone" title="Sair" aria-label="Sair">Sair</button></form>
    </div>
  </header>;
}
