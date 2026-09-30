"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertTriangle, Info, LoaderCircle } from "lucide-react";
import { entrarComGoogle, type EstadoLogin } from "@/app/actions/autenticacao";

const mensagens: Record<NonNullable<EstadoLogin["erro"]>, string> = {
  configuracao: "O acesso com Google ainda não está configurado neste ambiente.",
  "nao-autorizado": "Esta conta não possui acesso ao sistema da Eight Green.",
  provedor: "Não foi possível concluir a autenticação com o Google. Tente novamente.",
  desconhecido: "Não foi possível entrar. Tente novamente em alguns instantes.",
};

function BotaoGoogle() {
  const { pending } = useFormStatus();
  return <button className="botao-google" type="submit" disabled={pending} aria-disabled={pending}>
    {pending
      ? <LoaderCircle className="spin" aria-hidden="true" size={20}/>
      : <svg className="google-icon" viewBox="0 0 24 24" role="img" aria-label="Google" width={20} height={20}>
          <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.74 2.98-4.31 2.98-7.41Z"/>
          <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.36l-3.24-2.54c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"/>
          <path fill="#FBBC05" d="M6.39 13.93A6.03 6.03 0 0 1 6.07 12c0-.67.11-1.32.32-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.55l3.35-2.62Z"/>
          <path fill="#EA4335" d="M12 5.94c1.47 0 2.79.5 3.82 1.49l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z"/>
        </svg>}
    <span>{pending ? "Conectando…" : "Continuar com Google"}</span>
  </button>;
}

export function FormularioLogin({ erroInicial, retorno, configurado }: { erroInicial?: EstadoLogin["erro"]; retorno: string; configurado: boolean }) {
  const [state, action] = useActionState(entrarComGoogle, { erro: erroInicial });
  const erro = state.erro;
  return <section>
    <div className="marca login-marca">
      <div className="marca-simbolo" aria-hidden="true">8</div>
      <div><strong>Eight Green</strong><span>Gestão promocional</span></div>
    </div>
    <h1>Acessar o sistema</h1>
    <p>Entre com sua conta autorizada para acessar o painel de gestão promocional.</p>
    {erro && <div className={`auth-alerta ${erro === "configuracao" ? "atencao" : ""}`} role="alert">
      {erro === "configuracao" ? <Info size={17} aria-hidden="true"/> : <AlertTriangle size={17} aria-hidden="true"/>}
      <span>{mensagens[erro]}</span>
    </div>}
    <form action={action}>
      <input type="hidden" name="retorno" value={retorno}/>
      <BotaoGoogle/>
    </form>
    {!configurado && <p className="login-config">Configure as credenciais OAuth no servidor para habilitar o acesso.</p>}
    <p className="login-rodape">Acesso restrito à equipe autorizada da Eight Green.</p>
  </section>;
}
