"use server";

import { signIn, signOut } from "@/autenticacao";
import { AuthError } from "next-auth";

export type EstadoLogin = {
  erro?: "configuracao" | "nao-autorizado" | "provedor" | "desconhecido";
};

export async function entrarComGoogle(
  _: EstadoLogin,
  dados: FormData
): Promise<EstadoLogin> {
  const retorno = String(dados.get("retorno") ?? "/");
  try {
    await signIn("google", { redirectTo: retorno });
    return {};
  } catch (erro) {
    if (erro instanceof AuthError) {
      if (erro.type === "AccessDenied") return { erro: "nao-autorizado" };
      if ((erro.type as string) === "Configuration") return { erro: "configuracao" };
      if (erro.type?.startsWith("OAuth")) return { erro: "provedor" };
    }
    if (erro instanceof Error && erro.message.includes("NEXT_REDIRECT")) throw erro;
    return { erro: "desconhecido" };
  }
}

export async function encerrarSessao() {
  await signOut({ redirectTo: "/login" });
}
