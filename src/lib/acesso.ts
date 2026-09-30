function emailsAutorizados() {
  return new Set(
    (process.env.AUTHORIZED_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function emailAutorizado(email?: string | null) {
  return Boolean(email && emailsAutorizados().has(email.trim().toLowerCase()));
}

export function autenticacaoConfigurada() {
  return Boolean(
    process.env.AUTH_SECRET &&
      process.env.AUTH_GOOGLE_ID &&
      process.env.AUTH_GOOGLE_SECRET &&
      emailsAutorizados().size
  );
}
