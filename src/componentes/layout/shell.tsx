"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Cabecalho } from "./cabecalho";

type UsuarioShell = { nome: string | null; email: string; papel: "ADMINISTRADOR" | "FUNCIONARIO" };

export function Shell({ children, usuario }: { children: React.ReactNode; usuario: UsuarioShell }) {
  const [menuAberto, setMenuAberto] = useState(false);
  return <div className="app-shell">
    <Cabecalho abrirMenu={() => setMenuAberto(true)} usuario={usuario}/>
    <Sidebar aberta={menuAberto} fechar={() => setMenuAberto(false)}/>
    <div className="area-principal"><main>{children}</main></div>
  </div>;
}
