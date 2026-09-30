"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Cabecalho } from "./cabecalho";
import type { UsuarioSessao } from "@/tipos/sessao";

export function Shell({ children, usuario }: { children: React.ReactNode; usuario: UsuarioSessao }) {
  const [menuAberto, setMenuAberto] = useState(false);
  return <div className="app-shell">
    <Sidebar aberta={menuAberto} fechar={() => setMenuAberto(false)} usuario={usuario}/>
    <div className="area-principal"><Cabecalho abrirMenu={() => setMenuAberto(true)} usuario={usuario}/><main>{children}</main></div>
  </div>;
}
