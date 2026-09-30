"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Cabecalho } from "./cabecalho";

export function Shell({ children }: { children: React.ReactNode }) {
  const [menuAberto, setMenuAberto] = useState(false);
  return <div className="app-shell">
    <Cabecalho abrirMenu={() => setMenuAberto(true)}/>
    <Sidebar aberta={menuAberto} fechar={() => setMenuAberto(false)}/>
    <div className="area-principal"><main>{children}</main></div>
  </div>;
}
