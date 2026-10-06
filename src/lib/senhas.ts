import { randomBytes } from "node:crypto";
import { compare, hash } from "bcryptjs";

export { validarForcaSenha } from "@/lib/politica-senha";
export const DURACAO_CREDENCIAL_TEMPORARIA_MS = 48 * 60 * 60 * 1000;

export function gerarSenhaTemporaria() {
  return `Eg!${randomBytes(18).toString("base64url")}7a`;
}

export function hashSenha(senha: string) {
  return hash(senha, 12);
}

export function conferirSenha(senha: string, passwordHash: string) {
  return compare(senha, passwordHash);
}
