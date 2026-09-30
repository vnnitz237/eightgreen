import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { NextAuthRequest } from "next-auth";
import { auth } from "@/autenticacao";
import { autenticacaoConfigurada } from "@/lib/acesso";

const proxyAutenticado = auth((request: NextAuthRequest, event: NextFetchEvent) => {
  void request;
  void event;
  return NextResponse.next();
});

export function proxy(request: NextRequest, event: NextFetchEvent) {
  if (!autenticacaoConfigurada()) {
    if (request.nextUrl.pathname === "/login") return NextResponse.next();
    const login = new URL("/login", request.url);
    login.searchParams.set("error", "Configuration");
    return NextResponse.redirect(login);
  }
  return proxyAutenticado(request, event);
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
