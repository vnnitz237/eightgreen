import { afterEach, describe, expect, it } from "vitest";
import { validarAmbienteServidor } from "./ambiente";

const original = {
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
};

afterEach(() => Object.assign(process.env, original));

describe("configuração obrigatória do servidor", () => {
  it("explica quais variáveis estão ausentes", () => {
    delete process.env.DATABASE_URL;
    delete process.env.DIRECT_URL;
    delete process.env.AUTH_SECRET;
    expect(() => validarAmbienteServidor()).toThrow("DATABASE_URL, DIRECT_URL, AUTH_SECRET");
  });

  it("aceita URLs PostgreSQL e segredo forte", () => {
    process.env.DATABASE_URL = "postgresql://usuario:senha@localhost:5432/eightgreen";
    process.env.DIRECT_URL = process.env.DATABASE_URL;
    process.env.AUTH_SECRET = "x".repeat(32);
    expect(() => validarAmbienteServidor()).not.toThrow();
  });
});
