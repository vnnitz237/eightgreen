import { describe, expect, it } from "vitest";
import { acaoMutacaoSchema } from "./schemas";

const base = { titulo: "Ação sintética", data: "2026-10-06", horario: "09:00", distribuidoraId: null };

describe("contrato de mutação de ação", () => {
  it("exige exatamente uma forma de local", () => {
    expect(acaoMutacaoSchema.safeParse({ ...base, estabelecimentoId: null, estabelecimentoAvulso: null }).success).toBe(false);
    expect(acaoMutacaoSchema.safeParse({ ...base, estabelecimentoId: "E-01", estabelecimentoAvulso: "Praça" }).success).toBe(false);
    expect(acaoMutacaoSchema.safeParse({ ...base, estabelecimentoId: "E-01", estabelecimentoAvulso: null }).success).toBe(true);
    expect(acaoMutacaoSchema.safeParse({ ...base, estabelecimentoId: null, estabelecimentoAvulso: "Praça" }).success).toBe(true);
  });

  it("não aceita status enviado pelo navegador no contrato persistido", () => {
    const resultado = acaoMutacaoSchema.parse({ ...base, estabelecimentoId: "E-01", status: "encerrada" });
    expect("status" in resultado).toBe(false);
  });
});
