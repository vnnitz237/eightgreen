import { LockKeyhole } from "lucide-react";
import { autenticacaoConfigurada } from "@/lib/configuracao-autenticacao";
import { FormularioLogin } from "@/componentes/autenticacao/formulario-login";

const mensagens: Record<string, string> = {
  AccessDenied: "Esta conta não está autorizada ou está inativa.",
  Configuration: "A autenticação ainda não foi configurada neste ambiente.",
};

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const configurada = autenticacaoConfigurada();
  return <main className="login"><section><div className="marca login-marca"><div className="marca-simbolo">8</div><div><strong>Eight Green</strong><span>Gestão promocional</span></div></div><div className="login-icone"><LockKeyhole/></div><h1>Acesso interno</h1><p>Entre com o e-mail e a senha fornecidos pelo administrador.</p>{error && <p className="mensagem erro" role="alert">{mensagens[error] ?? "Não foi possível concluir o acesso."}</p>}{configurada ? <FormularioLogin /> : <p className="mensagem erro" role="alert">Configure um AUTH_SECRET seguro no servidor para habilitar o login.</p>}<small>Sem cadastro público · acesso concedido pela administração</small></section></main>;
}
