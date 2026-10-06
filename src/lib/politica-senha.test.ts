import { describe, expect, it } from "vitest";
import { validarForcaSenha } from "./politica-senha";

describe("política de senha", () => {
  it("rejeita senha curta ou sem diversidade", () => {
    expect(validarForcaSenha("Curta1!")).toMatch(/12/);
    expect(validarForcaSenha("apenasletrasminusculas")).toMatch(/maiúsculas/);
  });
  it("aceita senha longa e diversa", () => expect(validarForcaSenha("Senha-Forte-2026!")).toBeNull());
});
