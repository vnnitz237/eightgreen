import { describe, expect, it } from "vitest";
import { validarUltimoAdministrador } from "./regras";

describe("proteção do último administrador", () => {
  it("bloqueia rebaixamento e inativação do último administrador ativo", () => {
    expect(() => validarUltimoAdministrador(1, { papel: "ADMINISTRADOR", ativo: true }, { papel: "FUNCIONARIO", ativo: true })).toThrow(/último administrador/i);
    expect(() => validarUltimoAdministrador(1, { papel: "ADMINISTRADOR", ativo: true }, { papel: "ADMINISTRADOR", ativo: false })).toThrow(/último administrador/i);
  });

  it("permite a alteração quando outro administrador ativo permanece", () => {
    expect(() => validarUltimoAdministrador(2, { papel: "ADMINISTRADOR", ativo: true }, { papel: "FUNCIONARIO", ativo: true })).not.toThrow();
  });
});
