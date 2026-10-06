export type UsuarioLogin = { ativo: boolean; mustChangePassword: boolean; credencialExpiraEm: Date | null };

export function avaliarLogin(usuario: UsuarioLogin | null, senhaCorreta: boolean, agora = new Date()) {
  if (!usuario || !usuario.ativo || !senhaCorreta) return { permitido: false as const, erro: "E-mail ou senha inválidos." };
  if (usuario.mustChangePassword && (!usuario.credencialExpiraEm || usuario.credencialExpiraEm <= agora)) return { permitido: false as const, erro: "A credencial temporária expirou. Solicite um novo acesso ao administrador." };
  return { permitido: true as const, destino: usuario.mustChangePassword ? "/alterar-senha" : "/" };
}
