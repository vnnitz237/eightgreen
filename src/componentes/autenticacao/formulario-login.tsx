"use client";

import { useActionState } from "react";
import { entrar } from "@/app/actions/autenticacao-interna";

export function FormularioLogin() {
  const [estado, acao, pendente] = useActionState(entrar, {});
  return (
    <form action={acao} className="form-login-real">
      <label>E-mail<input name="email" type="email" required autoComplete="email" /></label>
      <label>Senha<input name="senha" type="password" required autoComplete="current-password" /></label>
      {estado.erro && <p className="mensagem erro" role="alert">{estado.erro}</p>}
      <button type="submit" disabled={pendente}>{pendente ? "Entrando..." : "Entrar"}</button>
    </form>
  );
}
