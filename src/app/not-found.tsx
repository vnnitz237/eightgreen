import Link from "next/link";
export default function NotFound() { return <main className="erro-pagina"><strong>404</strong><h1>Página não encontrada</h1><p>A rota informada não faz parte do mapa atual.</p><Link href="/">Voltar à visão geral</Link></main>; }
