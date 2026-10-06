import { redirect } from "next/navigation";
import { KeyRound } from "lucide-react";
import { obterSessaoAtual } from "@/lib/sessao";
import { FormularioAlterarSenha } from "@/componentes/autenticacao/formulario-alterar-senha";

export default async function AlterarSenhaPage() {
  const sessao = await obterSessaoAtual();
  if (!sessao) redirect("/login?error=AccessDenied");
  if (!sessao.user.mustChangePassword) redirect("/");
  return <main className="login"><section><div className="marca login-marca"><div className="marca-simbolo">8</div><div><strong>Eight Green</strong><span>Gestão promocional</span></div></div><div className="login-icone"><KeyRound/></div><h1>Defina sua nova senha</h1><p>Por segurança, a credencial temporária não permite acessar o sistema antes desta alteração.</p><FormularioAlterarSenha/><small>A credencial temporária será invalidada após a troca.</small></section></main>;
}
