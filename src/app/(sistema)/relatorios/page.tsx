import Link from 'next/link'
import { BarChart2, Package, Camera, DollarSign } from 'lucide-react'

const RELATORIOS = [
  {
    href: '/relatorios/acoes',
    icon: BarChart2,
    titulo: 'Relatório de Ações',
    descricao: 'Consulte ações por período, status e estabelecimento.',
    cor: 'bg-blue-50 text-blue-600',
  },
  {
    href: '/relatorios/estoque',
    icon: Package,
    titulo: 'Relatório de Estoque',
    descricao: 'Saldos atuais de produtos e últimas movimentações.',
    cor: 'bg-orange-50 text-orange-600',
  },
  {
    href: '/relatorios/merchan',
    icon: Camera,
    titulo: 'Relatório de Merchan',
    descricao: 'Visitas por promotor e estabelecimento.',
    cor: 'bg-purple-50 text-purple-600',
  },
  {
    href: '/relatorios/financeiro',
    icon: DollarSign,
    titulo: 'Relatório Financeiro',
    descricao: 'Resumo de contas a pagar, receber e vencidas.',
    cor: 'bg-green-50 text-green-600',
  },
]

export default function RelatoriosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="mt-1 text-sm text-gray-500">Selecione um relatório para gerar.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {RELATORIOS.map(r => {
          const Icon = r.icon
          return (
            <Link
              key={r.href}
              href={r.href}
              className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${r.cor}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{r.titulo}</h2>
                <p className="mt-1 text-sm text-gray-500">{r.descricao}</p>
              </div>
              <span className="mt-auto text-sm font-medium text-green-600">Gerar →</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
