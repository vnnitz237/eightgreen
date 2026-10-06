import { describe, expect, it } from "vitest";
import { avaliarLogin } from "./politica-login";

const futuro = new Date("2099-01-01");
describe("login interno", () => {
  it("nega usuário inexistente, inativo e senha incorreta com a mesma mensagem", () => {
    const resultados = [avaliarLogin(null, false), avaliarLogin({ ativo: false, mustChangePassword: false, credencialExpiraEm: null }, true), avaliarLogin({ ativo: true, mustChangePassword: false, credencialExpiraEm: null }, false)];
    expect(new Set(resultados.map((r) => r.erro)).size).toBe(1);
  });
  it("redireciona credencial temporária válida e rejeita expirada", () => {
    expect(avaliarLogin({ ativo: true, mustChangePassword: true, credencialExpiraEm: futuro }, true).destino).toBe("/alterar-senha");
    expect(avaliarLogin({ ativo: true, mustChangePassword: true, credencialExpiraEm: new Date(0) }, true).permitido).toBe(false);
  });
});
