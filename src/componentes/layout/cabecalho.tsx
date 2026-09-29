"use client";

import { Menu, Search, CircleHelp, Bell } from "lucide-react";

export function Cabecalho({ abrirMenu }: { abrirMenu: () => void }) {
  return <header className="cabecalho">
    <button className="menu-mobile" onClick={abrirMenu} aria-label="Abrir navegação"><Menu size={21}/></button>
    <div className="busca"><Search size={17}/><span>Buscar ações, produtos e pessoas</span><kbd>⌘ K</kbd></div>
    <div className="acoes-cabecalho">
      <button aria-label="Ajuda"><CircleHelp size={19}/></button>
      <button aria-label="Notificações"><Bell size={19}/></button>
      <div className="usuario"><span>EG</span><div><strong>Equipe Eight Green</strong><small>Demonstração</small></div></div>
    </div>
  </header>;
}
