import { exigirPermissaoPagina } from '@/lib/autorizacao'

export default async function CadastrosLayout({ children }: { children: React.ReactNode }) {
  await exigirPermissaoPagina('MUTAR_CADASTROS')
  return <>{children}</>
}
