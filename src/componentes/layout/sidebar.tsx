"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, X } from "lucide-react";
import { useFormStatus } from "react-dom";
import { gruposNavegacao } from "@/conteudos/navegacao";
import { encerrarSessao } from "@/app/actions/autenticacao";
import type { UsuarioSessao } from "@/tipos/sessao";

function BotaoEncerrar() {
  const { pending } = useFormStatus();
  return <button className="botao-encerrar" type="submit" disabled={pending} aria-label="Encerrar sessão">
    <LogOut size={14}/>{pending ? "Saindo…" : "Sair"}
  </button>;
}

export function Sidebar({ aberta, fechar, usuario }: { aberta: boolean; fechar: () => void; usuario: UsuarioSessao }) {
  const pathname = usePathname();
  return <>
    {aberta && <button className="overlay" aria-label="Fechar navegação" onClick={fechar} />}
    <aside className={`sidebar ${aberta ? "sidebar-aberta" : ""}`}>
      <div className="marca">
        <div className="marca-simbolo" aria-hidden="true">8</div>
        <div><strong>Eight Green</strong><span>Gestão promocional</span></div>
        <button className="fechar-menu" onClick={fechar} aria-label="Fechar menu"><X size={20}/></button>
      </div>
      <nav aria-label="Navegação principal">
        {gruposNavegacao.map((grupo) => <div className="nav-grupo" key={grupo.titulo}>
          <p>{grupo.titulo}</p>
          {grupo.itens.map(({ rotulo, href, icone: Icone }) => {
            const ativo = href === "/" ? pathname === "/" : pathname.startsWith(href.split("/").slice(0, 2).join("/"));
            return <Link key={href} href={href} className={ativo ? "ativo" : ""} onClick={fechar}>
              <Icone size={18}/><span>{rotulo}</span>
            </Link>;
          })}
        </div>)}
      </nav>
      <div className="sidebar-rodape">
        <span className="ponto"/>
        <strong>{usuario.name ?? usuario.email}</strong>
        <span>{usuario.email}</span>
        <form action={encerrarSessao}><BotaoEncerrar/></form>
      </div>
    </aside>
  </>;
}
