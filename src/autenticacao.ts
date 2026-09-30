import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { autenticacaoConfigurada, emailAutorizado } from "@/lib/acesso";

export { autenticacaoConfigurada, emailAutorizado } from "@/lib/acesso";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  trustHost: true,
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    async signIn({ user }) {
      return emailAutorizado(user.email);
    },
    async jwt({ token, user }) {
      if (user?.id) token.userId = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = String(token.userId ?? token.sub ?? "");
      return session;
    },
    authorized({ auth: session, request }) {
      const autenticado = Boolean(session?.user && emailAutorizado(session.user.email));
      const login = request.nextUrl.pathname === "/login";
      if (login && autenticado) return Response.redirect(new URL("/", request.nextUrl));
      if (login) return true;
      return autenticado;
    },
  },
});

void autenticacaoConfigurada;
