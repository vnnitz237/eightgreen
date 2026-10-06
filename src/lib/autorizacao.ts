import "server-only";
import { redirect } from "next/navigation";
import type { Usuario } from "@prisma/client";
import { obterSessaoAtual } from "@/lib/sessao";
import { papelPode, type Operacao } from "@/lib/politica-autorizacao";

export { papelPode } from "@/lib/politica-autorizacao";

export async function obterUsuarioAtual(): Promise<Usuario | null> {
  const sessao = await obterSessaoAtual();
  return sessao?.user ?? null;
}

export async function exigirUsuario() {
  const usuario = await obterUsuarioAtual();
  if (!usuario || !usuario.ativo) redirect("/login?error=AccessDenied");
  if (usuario.mustChangePassword) redirect("/alterar-senha");
  return usuario;
}

export async function exigirPermissao(operacao: Operacao) {
  const usuario = await exigirUsuario();
  if (!papelPode(usuario.papel, operacao)) throw new Error("ACESSO_NEGADO");
  return usuario;
}

export async function exigirAdministrador() {
  return exigirPermissao("ADMINISTRAR_USUARIOS");
}
