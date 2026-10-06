import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { normalizarEmail } from "../src/lib/configuracao-autenticacao";
import { DURACAO_CREDENCIAL_TEMPORARIA_MS, gerarSenhaTemporaria, hashSenha } from "../src/lib/senhas";
import { mensagemPrimeiroAcesso, obterProvedorEmail } from "../src/lib/email";

const prisma = new PrismaClient();

async function main() {
  const entrada = z.object({ nome: z.string().trim().min(2), email: z.string().email().transform(normalizarEmail) }).parse({ nome: process.env.OWNER_NAME, email: process.env.OWNER_EMAIL });
  const usuariosExistentes = await prisma.usuario.findMany({ select: { id: true, email: true, papel: true, estadoConvite: true, name: true } });
  const existente = usuariosExistentes.find((usuario) => usuario.email === entrada.email);
  if (usuariosExistentes.length > 0 && (!existente || existente.papel !== "ADMINISTRADOR" || usuariosExistentes.length > 1)) throw new Error("A criação inicial foi recusada porque o sistema já possui usuários. Use a administração do sistema.");
  if (existente?.estadoConvite === "ACEITO") { console.log("O proprietário inicial já existe e aceitou o acesso."); return; }

  const senhaTemporaria = gerarSenhaTemporaria();
  const passwordHash = await hashSenha(senhaTemporaria);
  const expiraEm = new Date(Date.now() + DURACAO_CREDENCIAL_TEMPORARIA_MS);
  const proprietario = await prisma.$transaction(async (tx) => {
    if (existente) {
      const atualizado = await tx.usuario.update({ where: { id: existente.id }, data: { passwordHash, mustChangePassword: true, estadoConvite: "PENDENTE", credencialExpiraEm: expiraEm } });
      await tx.auditoria.create({ data: { autorId: atualizado.id, operacao: "REENVIAR_PROPRIETARIO_INICIAL", entidade: "Usuario", registroId: atualizado.id, estadoPosterior: { estadoConvite: "PENDENTE", mustChangePassword: true } } });
      return atualizado;
    }
    const criado = await tx.usuario.create({ data: { name: entrada.nome, email: entrada.email, passwordHash, papel: "ADMINISTRADOR", ativo: true, mustChangePassword: true, estadoConvite: "PENDENTE", credencialExpiraEm: expiraEm } });
    await tx.auditoria.create({ data: { autorId: criado.id, operacao: "CRIAR_PROPRIETARIO_INICIAL", entidade: "Usuario", registroId: criado.id, estadoPosterior: { email: criado.email, papel: criado.papel, ativo: criado.ativo, estadoConvite: criado.estadoConvite } } });
    return criado;
  });

  let enviado = false;
  try { enviado = (await obterProvedorEmail().enviar(mensagemPrimeiroAcesso({ nome: proprietario.name, email: proprietario.email, senhaTemporaria, expiraEm }))).enviado; } catch { enviado = false; }
  await prisma.usuario.update({ where: { id: proprietario.id }, data: enviado ? { conviteEnviadoEm: new Date() } : { estadoConvite: "ENVIO_FALHOU" } });
  if (!enviado) throw new Error("Proprietário criado, mas o envio falhou. Configure o provedor e reenvie o acesso pela administração.");
  console.log("Proprietário inicial criado e acesso enviado com segurança.");
}

main().catch((erro) => { console.error(erro instanceof Error ? erro.message : "Falha ao criar proprietário."); process.exitCode = 1; }).finally(() => prisma.$disconnect());
