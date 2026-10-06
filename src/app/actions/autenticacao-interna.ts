"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { hashSync } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { conferirSenha, hashSenha, validarForcaSenha } from "@/lib/senhas";
import { criarSessao, encerrarSessao, obterSessaoAtual } from "@/lib/sessao";
import { normalizarEmail } from "@/lib/configuracao-autenticacao";
import { avaliarLogin } from "@/lib/politica-login";

export type EstadoAutenticacao = { erro?: string };
const HASH_NEUTRO = hashSync("credencial-inexistente", 12);

export async function entrar(_: EstadoAutenticacao, formData: FormData): Promise<EstadoAutenticacao> {
  const entrada = z.object({ email: z.string().email(), senha: z.string().min(1) }).safeParse({ email: formData.get("email"), senha: formData.get("senha") });
  if (!entrada.success) return { erro: "E-mail ou senha inválidos." };
  const email = normalizarEmail(entrada.data.email);
  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    const senhaCorreta = await conferirSenha(entrada.data.senha, usuario?.passwordHash ?? HASH_NEUTRO);
    const decisao = avaliarLogin(usuario, Boolean(usuario?.passwordHash && senhaCorreta));
    if (!decisao.permitido || !usuario) return { erro: decisao.erro };
    await prisma.usuario.update({ where: { id: usuario.id }, data: { ultimoAcesso: new Date() } });
    await criarSessao(usuario.id);
    redirect(decisao.destino);
  } catch (erro) {
    if (erro && typeof erro === "object" && "digest" in erro) throw erro;
    return { erro: "Não foi possível entrar agora. Tente novamente mais tarde." };
  }
}

export async function alterarSenha(_: EstadoAutenticacao, formData: FormData): Promise<EstadoAutenticacao> {
  const entrada = z.object({ senha: z.string(), confirmacao: z.string() }).safeParse({ senha: formData.get("senha"), confirmacao: formData.get("confirmacao") });
  if (!entrada.success || entrada.data.senha !== entrada.data.confirmacao) return { erro: "As senhas informadas não coincidem." };
  const erroForca = validarForcaSenha(entrada.data.senha);
  if (erroForca) return { erro: erroForca };
  const sessao = await obterSessaoAtual();
  if (!sessao || !sessao.user.mustChangePassword) return { erro: "Este acesso não está disponível ou já foi utilizado." };
  if (!sessao.user.credencialExpiraEm || sessao.user.credencialExpiraEm <= new Date()) return { erro: "A credencial temporária expirou. Solicite um novo acesso." };
  const passwordHash = await hashSenha(entrada.data.senha);
  await prisma.$transaction(async (tx) => {
    await tx.usuario.update({ where: { id: sessao.user.id }, data: { passwordHash, mustChangePassword: false, estadoConvite: "ACEITO", conviteAceitoEm: new Date(), credencialExpiraEm: null } });
    await tx.sessao.deleteMany({ where: { userId: sessao.user.id } });
    await tx.auditoria.create({ data: { autorId: sessao.user.id, operacao: "ALTERAR_SENHA_INICIAL", entidade: "Usuario", registroId: sessao.user.id, estadoAnterior: { mustChangePassword: true }, estadoPosterior: { mustChangePassword: false, estadoConvite: "ACEITO" } } });
  });
  await encerrarSessao();
  await criarSessao(sessao.user.id);
  redirect("/");
}

export async function sair() {
  await encerrarSessao();
  redirect("/login");
}
