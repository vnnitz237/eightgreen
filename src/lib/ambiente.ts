const obrigatoriasServidor = ["DATABASE_URL", "DIRECT_URL", "AUTH_SECRET"] as const;

export function validarAmbienteServidor() {
  const ausentes = obrigatoriasServidor.filter((nome) => !process.env[nome]?.trim());
  if (ausentes.length > 0) {
    throw new Error(`CONFIGURACAO_AUSENTE: defina ${ausentes.join(", ")} no ambiente do servidor.`);
  }

  if ((process.env.AUTH_SECRET?.length ?? 0) < 32) {
    throw new Error("CONFIGURACAO_INVALIDA: AUTH_SECRET deve ter pelo menos 32 caracteres.");
  }

  for (const nome of ["DATABASE_URL", "DIRECT_URL"] as const) {
    try {
      const url = new URL(process.env[nome]!);
      if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") throw new Error();
    } catch {
      throw new Error(`CONFIGURACAO_INVALIDA: ${nome} deve ser uma URL PostgreSQL válida.`);
    }
  }
}
