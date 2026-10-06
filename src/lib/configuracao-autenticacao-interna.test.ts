import { afterEach, describe, expect, it } from "vitest";
import { autenticacaoConfigurada, normalizarEmail } from "./configuracao-autenticacao";

const anterior = { ...process.env };
afterEach(() => { process.env = { ...anterior }; });

describe("configuração da autenticação interna", () => {
  it("normaliza e-mail", () => expect(normalizarEmail(" Pessoa@Example.COM ")).toBe("pessoa@example.com"));
  it("exige segredo do servidor com tamanho mínimo", () => {
    process.env.AUTH_SECRET = "x".repeat(32);
    expect(autenticacaoConfigurada()).toBe(true);
    process.env.AUTH_SECRET = "curto";
    expect(autenticacaoConfigurada()).toBe(false);
  });
});
