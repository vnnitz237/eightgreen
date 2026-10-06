"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { exigirAdministrador } from "@/lib/autorizacao";
import { normalizarEmail } from "@/lib/configuracao-autenticacao";
import { validarUltimoAdministrador } from "./regras";
import { DURACAO_CREDENCIAL_TEMPORARIA_MS, gerarSenhaTemporaria, hashSenha } from "@/lib/senhas";
import { mensagemPrimeiroAcesso, obterProvedorEmail } from "@/lib/email";

const novoUsuarioSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome").max(120),
  email: z.string().trim().email("E-mail inválido").transform(normalizarEmail),
  papel: z.enum(["ADMINISTRADOR", "FUNCIONARIO"]),
  ativo: z.enum(["true", "false"]).transform((valor) => valor === "true"),
  degustadoraId: z.string().trim().min(1).nullable(),
});

export async function provisionarUsuario(formData: FormData) {
  const administrador = await exigirAdministrador();
  const dados = novoUsuarioSchema.parse({ nome: formData.get("nome"), email: formData.get("email"), papel: formData.get("papel"), ativo: formData.get("ativo"), degustadoraId: formData.get("degustadoraId") || null });
  const senhaTemporaria = gerarSenhaTemporaria();
  const passwordHash = await hashSenha(senhaTemporaria);
  const expiraEm = new Date(Date.now() + DURACAO_CREDENCIAL_TEMPORARIA_MS);
  const usuario = await prisma.$transaction(async (tx) => {
    if (dados.degustadoraId) {
      const elegivel = await tx.degustadora.findFirst({ where: { id: dados.degustadoraId, ativo: true }, select: { id: true } });
      if (!elegivel) throw new Error("A degustadora selecionada não está disponível.");
    }
    const criado = await tx.usuario.create({ data: { name: dados.nome, email: dados.email, papel: dados.papel, ativo: dados.ativo, degustadoraId: dados.degustadoraId, passwordHash, mustChangePassword: true, estadoConvite: "PENDENTE", credencialExpiraEm: expiraEm } });
    await tx.auditoria.create({ data: { autorId: administrador.id, operacao: "CRIAR", entidade: "Usuario", registroId: criado.id, estadoPosterior: { email: criado.email, papel: criado.papel, ativo: criado.ativo, degustadoraId: criado.degustadoraId, estadoConvite: criado.estadoConvite } } });
    return criado;
  });
  let resultado = "enviado";
  try {
    const envio = await obterProvedorEmail().enviar(mensagemPrimeiroAcesso({ nome: usuario.name, email: usuario.email, senhaTemporaria, expiraEm }));
    if (!envio.enviado) resultado = "pendente";
  } catch { resultado = "pendente"; }
  await prisma.usuario.update({ where: { id: usuario.id }, data: resultado === "enviado" ? { conviteEnviadoEm: new Date(), estadoConvite: "PENDENTE" } : { estadoConvite: "ENVIO_FALHOU" } });
  revalidatePath("/configuracoes/usuarios");
  redirect(`/configuracoes/usuarios?convite=${resultado}`);
}

export async function reenviarAcesso(id: string) {
  const administrador = await exigirAdministrador();
  const senhaTemporaria = gerarSenhaTemporaria();
  const passwordHash = await hashSenha(senhaTemporaria);
  const expiraEm = new Date(Date.now() + DURACAO_CREDENCIAL_TEMPORARIA_MS);
  const usuario = await prisma.$transaction(async (tx) => {
    const atualizado = await tx.usuario.update({ where: { id }, data: { passwordHash, mustChangePassword: true, estadoConvite: "PENDENTE", credencialExpiraEm: expiraEm, conviteAceitoEm: null } });
    await tx.sessao.deleteMany({ where: { userId: id } });
    await tx.auditoria.create({ data: { autorId: administrador.id, operacao: "REENVIAR_ACESSO", entidade: "Usuario", registroId: id, estadoPosterior: { estadoConvite: "PENDENTE", mustChangePassword: true, credencialExpiraEm: expiraEm.toISOString() } } });
    return atualizado;
  });
  let resultado = "enviado";
  try {
    const envio = await obterProvedorEmail().enviar(mensagemPrimeiroAcesso({ nome: usuario.name, email: usuario.email, senhaTemporaria, expiraEm }));
    if (!envio.enviado) resultado = "pendente";
  } catch { resultado = "pendente"; }
  await prisma.usuario.update({ where: { id }, data: resultado === "enviado" ? { conviteEnviadoEm: new Date(), estadoConvite: "PENDENTE" } : { estadoConvite: "ENVIO_FALHOU" } });
  revalidatePath("/configuracoes/usuarios");
  redirect(`/configuracoes/usuarios?convite=${resultado}`);
}

export async function atualizarUsuario(id: string, formData: FormData) {
  const administrador = await exigirAdministrador();
  const papel = z.enum(["ADMINISTRADOR", "FUNCIONARIO"]).parse(formData.get("papel"));
  const ativo = formData.get("ativo") === "true";
  const degustadoraId = z.string().trim().min(1).nullable().parse(formData.get("degustadoraId") || null);
  if (administrador.id === id && (papel !== administrador.papel || !ativo)) throw new Error("O administrador não pode alterar o próprio papel nem inativar a própria conta.");
  await prisma.$transaction(async (tx) => {
    const anterior = await tx.usuario.findUnique({ where: { id }, select: { id: true, email: true, papel: true, ativo: true, degustadoraId: true } });
    if (!anterior) throw new Error("Usuário não encontrado.");
    if (degustadoraId) {
      const elegivel = await tx.degustadora.findFirst({ where: { id: degustadoraId, ativo: true }, select: { id: true } });
      if (!elegivel) throw new Error("A degustadora selecionada não está disponível.");
    }
    const administradoresAtivos = await tx.usuario.count({ where: { papel: "ADMINISTRADOR", ativo: true } });
    validarUltimoAdministrador(administradoresAtivos, anterior, { papel, ativo });
    const posterior = await tx.usuario.update({ where: { id }, data: { papel, ativo, degustadoraId }, select: { id: true, email: true, papel: true, ativo: true, degustadoraId: true } });
    if (!ativo) await tx.sessao.deleteMany({ where: { userId: id } });
    await tx.auditoria.create({ data: { autorId: administrador.id, operacao: "ATUALIZAR", entidade: "Usuario", registroId: id, estadoAnterior: anterior, estadoPosterior: posterior } });
  }, { isolationLevel: "Serializable" });
  revalidatePath("/configuracoes/usuarios");
}
