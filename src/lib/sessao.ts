import "server-only";
import { createHmac, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { COOKIE_SESSAO } from "@/lib/cookie-sessao";

export { COOKIE_SESSAO } from "@/lib/cookie-sessao";
const DURACAO_SESSAO_MS = 8 * 60 * 60 * 1000;

function segredo() {
  const valor = process.env.AUTH_SECRET;
  if (!valor || valor.length < 32) throw new Error("AUTENTICACAO_NAO_CONFIGURADA");
  return valor;
}

export function hashTokenSessao(token: string) {
  return createHmac("sha256", segredo()).update(token).digest("hex");
}

async function definirCookie(token: string, expiraEm: Date) {
  (await cookies()).set(COOKIE_SESSAO, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires: expiraEm });
}

export async function criarSessao(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiraEm = new Date(Date.now() + DURACAO_SESSAO_MS);
  await prisma.sessao.create({ data: { sessionToken: hashTokenSessao(token), userId, expires: expiraEm } });
  await definirCookie(token, expiraEm);
}

export async function obterSessaoAtual() {
  const token = (await cookies()).get(COOKIE_SESSAO)?.value;
  if (!token) return null;
  const sessionToken = hashTokenSessao(token);
  const sessao = await prisma.sessao.findUnique({ where: { sessionToken }, include: { user: true } });
  if (!sessao || sessao.expires <= new Date() || !sessao.user.ativo) {
    if (sessao) await prisma.sessao.delete({ where: { sessionToken } });
    return null;
  }
  return sessao;
}

export async function encerrarSessao() {
  const armazenador = await cookies();
  const token = armazenador.get(COOKIE_SESSAO)?.value;
  if (token) await prisma.sessao.deleteMany({ where: { sessionToken: hashTokenSessao(token) } });
  armazenador.delete(COOKIE_SESSAO);
}
