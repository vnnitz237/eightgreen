export function normalizarEmail(email: string) {
  return email.trim().toLowerCase();
}

export function autenticacaoConfigurada() {
  return Boolean(process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 32);
}
