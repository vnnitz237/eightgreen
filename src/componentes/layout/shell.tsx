"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Cabecalho } from "./cabecalho";

export function Shell({ children }: { children: React.ReactNode }) {
  const [menuAberto, setMenuAberto] = useState(false);
  return <div className="app-shell">
    <Sidebar aberta={menuAberto} fechar={() => setMenuAberto(false)}/>
    <div className="area-principal"><Cabecalho abrirMenu={() => setMenuAberto(true)}/><main>{children}</main></div>
  </div>;
}
