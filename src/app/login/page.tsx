import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, autenticacaoConfigurada } from "@/autenticacao";
import { FormularioLogin } from "@/componentes/autenticacao/formulario-login";

export const metadata: Metadata = { title: "Acessar · Eight Green", description: "Acesso ao sistema de gestão Eight Green" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ error?: string; callbackUrl?: string; retorno?: string }>;

function caminhoSeguro(valor?: string) {
  if (!valor || !valor.startsWith("/") || valor.startsWith("//")) return "/";
  return valor;
}

function mapearErro(error?: string): "configuracao" | "nao-autorizado" | "provedor" | "desconhecido" | undefined {
  if (error === "AccessDenied") return "nao-autorizado";
  if (error === "Configuration") return "configuracao";
  if (error?.startsWith("OAuth")) return "provedor";
  return error ? "desconhecido" : undefined;
}

export default async function PaginaLogin({ searchParams }: { searchParams: SearchParams }) {
  const configurado = autenticacaoConfigurada();
  if (configurado) {
    const session = await auth();
    if (session?.user) redirect("/");
  }
  const params = await searchParams;
  return <main className="login">
    <FormularioLogin
      erroInicial={mapearErro(params.error)}
      retorno={caminhoSeguro(params.callbackUrl ?? params.retorno)}
      configurado={configurado}
    />
  </main>;
}
