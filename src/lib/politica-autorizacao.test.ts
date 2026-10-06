import { describe, expect, it } from "vitest";
import { papelPode } from "./politica-autorizacao";

describe("política inicial de autorização", () => {
  it("reserva mutações ao administrador e mantém funcionário somente leitura", () => {
    expect(papelPode("ADMINISTRADOR", "MUTAR_ACOES")).toBe(true);
    expect(papelPode("ADMINISTRADOR", "ADMINISTRAR_USUARIOS")).toBe(true);
    expect(papelPode("FUNCIONARIO", "LER_SISTEMA")).toBe(true);
    expect(papelPode("FUNCIONARIO", "MUTAR_ACOES")).toBe(false);
    expect(papelPode("FUNCIONARIO", "ADMINISTRAR_USUARIOS")).toBe(false);
  });
});
