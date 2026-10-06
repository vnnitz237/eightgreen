export function validarForcaSenha(senha: string) {
  if (senha.length < 12) return "A senha deve ter pelo menos 12 caracteres.";
  if (!/[a-z]/.test(senha) || !/[A-Z]/.test(senha) || !/\d/.test(senha) || !/[^A-Za-z0-9]/.test(senha)) return "Use letras maiúsculas, minúsculas, número e caractere especial.";
  return null;
}
