"use client";

import { useActionState } from "react";
import { alterarSenha } from "@/app/actions/autenticacao-interna";

export function FormularioAlterarSenha() {
  const [estado, acao, pendente] = useActionState(alterarSenha, {});
  return <form action={acao} className="form-login-real"><label>Nova senha<input name="senha" type="password" required minLength={12} autoComplete="new-password" /></label><label>Confirmar nova senha<input name="confirmacao" type="password" required minLength={12} autoComplete="new-password" /></label><small>Use pelo menos 12 caracteres, com maiúscula, minúscula, número e símbolo.</small>{estado.erro && <p className="mensagem erro" role="alert">{estado.erro}</p>}<button type="submit" disabled={pendente}>{pendente ? "Salvando..." : "Definir nova senha"}</button></form>;
}
