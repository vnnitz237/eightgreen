import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { autenticacaoConfigurada } from "@/lib/configuracao-autenticacao";
import { COOKIE_SESSAO } from "@/lib/cookie-sessao";

const publicas = new Set(["/login", "/alterar-senha"]);

export function proxy(request: NextRequest) {
  const caminho = request.nextUrl.pathname;
  if (!autenticacaoConfigurada()) {
    if (caminho === "/login") return NextResponse.next();
    const login = new URL("/login", request.url);
    login.searchParams.set("error", "Configuration");
    return NextResponse.redirect(login);
  }
  if (publicas.has(caminho)) return NextResponse.next();
  if (!request.cookies.has(COOKIE_SESSAO)) return NextResponse.redirect(new URL("/login", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
