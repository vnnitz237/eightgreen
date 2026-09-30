"use client";

import { Menu, Search, CircleHelp, Bell } from "lucide-react";
import type { UsuarioSessao } from "@/tipos/sessao";

function iniciaisUsuario(nome?: string | null, email?: string | null) {
  if (nome) {
    const partes = nome.trim().split(/\s+/);
    if (partes.length >= 2) return (partes[0][0] + partes.at(-1)![0]).toUpperCase();
    return partes[0].slice(0, 2).toUpperCase();
  }
  return (email ?? "EG").slice(0, 2).toUpperCase();
}

export function Cabecalho({ abrirMenu, usuario }: { abrirMenu: () => void; usuario: UsuarioSessao }) {
  return <header className="cabecalho">
    <button className="menu-mobile" onClick={abrirMenu} aria-label="Abrir navegação"><Menu size={21}/></button>
    <div className="busca"><Search size={17}/><span>Buscar ações, produtos e pessoas</span><kbd>⌘ K</kbd></div>
    <div className="acoes-cabecalho">
      <button aria-label="Ajuda"><CircleHelp size={19}/></button>
      <button aria-label="Notificações"><Bell size={19}/></button>
      <div className="usuario">
        {usuario.image
          ? <img className="avatar-img" src={usuario.image} alt="" aria-hidden="true" referrerPolicy="no-referrer"/>
          : <span>{iniciaisUsuario(usuario.name, usuario.email)}</span>}
        <div><strong>{usuario.name ?? "Usuário"}</strong><small>{usuario.email}</small></div>
      </div>
    </div>
  </header>;
}
