import { exigirPermissaoPagina } from '@/lib/autorizacao'

export default async function FinanceiroLayout({ children }: { children: React.ReactNode }) {
  await exigirPermissaoPagina('MUTAR_FINANCEIRO')
  return <>{children}</>
}
