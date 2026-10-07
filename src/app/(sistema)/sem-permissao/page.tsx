import Link from 'next/link'
import { ShieldX } from 'lucide-react'

export default function SemPermissaoPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '80px 20px', textAlign: 'center' }}>
      <ShieldX size={64} style={{ color: 'var(--cor-erro, #dc2626)' }} />
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Acesso negado</h1>
      <p style={{ color: 'var(--cor-texto-2, #6b7280)', margin: 0 }}>
        Você não tem permissão para acessar esta área.<br />
        Fale com um administrador se precisar de acesso.
      </p>
      <Link href="/" className="botao" style={{ marginTop: 8 }}>
        Voltar ao início
      </Link>
    </div>
  )
}
