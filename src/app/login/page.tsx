import Link from "next/link";
import { LockKeyhole } from "lucide-react";

export default function Login() {
  return <main className="login"><section><div className="marca login-marca"><div className="marca-simbolo">8</div><div><strong>Eight Green</strong><span>Gestão promocional</span></div></div><div className="login-icone"><LockKeyhole/></div><h1>Autenticação ainda não conectada</h1><p>Esta entrega é uma demonstração isolada, sem usuários ou dados reais. A autenticação e a autorização no servidor serão implementadas na próxima etapa.</p><Link href="/">Acessar demonstração</Link><small>Ambiente local · Etapa 1</small></section></main>;
}
