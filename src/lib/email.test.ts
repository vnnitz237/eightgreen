import { afterEach, describe, expect, it } from "vitest";
import { obterProvedorEmail } from "./email";

const anterior = process.env.EMAIL_PROVIDER;
afterEach(() => { if (anterior === undefined) delete process.env.EMAIL_PROVIDER; else process.env.EMAIL_PROVIDER = anterior; });

describe("envio de acesso", () => {
  it("não finge envio quando não há provedor", async () => {
    delete process.env.EMAIL_PROVIDER;
    await expect(obterProvedorEmail().enviar({ para: "teste@example.com", assunto: "Teste", texto: "Sem segredo" })).resolves.toEqual(expect.objectContaining({ enviado: false }));
  });
});
