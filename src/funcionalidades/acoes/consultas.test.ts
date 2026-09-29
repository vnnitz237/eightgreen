import { describe, expect, it } from "vitest";
import { acoesDemonstrativas } from "./dados-demonstrativos";
import { filtrarAcoesPorPeriodo, resumirAcoes } from "./consultas";

describe("indicadores operacionais", () => {
  it("deriva lista e indicadores do mesmo recorte inclusivo", () => {
    const recorte = filtrarAcoesPorPeriodo(acoesDemonstrativas, { inicio: "2026-09-01", fim: "2026-09-30" });
    expect(recorte.map(({ id }) => id)).toEqual(["AC-1048", "AC-1051", "AC-1054", "AC-1058", "AC-1061"]);
    expect(resumirAcoes(recorte)).toEqual({ total: 5, abertas: 2, encerradas: 3, canceladas: 0 });
  });
});
