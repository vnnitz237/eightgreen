import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { emailAutorizado, autenticacaoConfigurada } from "./acesso";

describe("acesso autorizado", () => {
  const env = process.env;

  beforeEach(() => { process.env = { ...env }; });
  afterEach(() => { process.env = env; });

  it("normaliza e restringe o e-mail pela allowlist", () => {
    process.env.AUTHORIZED_EMAILS = "gestor@eightgreen.com, admin@eightgreen.com";
    expect(emailAutorizado("gestor@eightgreen.com")).toBe(true);
    expect(emailAutorizado("ADMIN@EIGHTGREEN.COM")).toBe(true);
    expect(emailAutorizado("outro@eightgreen.com")).toBe(false);
    expect(emailAutorizado(null)).toBe(false);
    expect(emailAutorizado(undefined)).toBe(false);
  });

  it("só considera a autenticação configurada com todas as variáveis", () => {
    process.env.AUTH_SECRET = "segredo";
    process.env.AUTH_GOOGLE_ID = "id";
    process.env.AUTH_GOOGLE_SECRET = "secret";
    process.env.AUTHORIZED_EMAILS = "gestor@eightgreen.com";
    expect(autenticacaoConfigurada()).toBe(true);
  });

  it("rejeita allowlist vazia como não configurada", () => {
    process.env.AUTH_SECRET = "segredo";
    process.env.AUTH_GOOGLE_ID = "id";
    process.env.AUTH_GOOGLE_SECRET = "secret";
    process.env.AUTHORIZED_EMAILS = "";
    expect(autenticacaoConfigurada()).toBe(false);
  });
});
