export const dynamic = 'force-dynamic'

import { exigirPermissaoPagina } from '@/lib/autorizacao'
import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { formatData, formatMoeda } from '@/lib/format'
import FiltrosPeriodo from '@/componentes/relatorios/FiltrosPeriodo'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

type SearchParams = Promise<{
  inicio?: string
  fim?: string
}>

export default async function RelatorioFinanceiroPage({ searchParams }: { searchParams: SearchParams }) {
  await exigirPermissaoPagina('MUTAR_FINANCEIRO')
  const { inicio, fim } = await searchParams

  const dataFiltro = inicio && fim
    ? { gte: new Date(inicio), lte: new Date(fim) }
    : undefined

  const [contasPagar, contasReceber] = await Promise.all([
    prisma.contaPagar.findMany({
      where: dataFiltro ? { vencimento: dataFiltro } : {},
      orderBy: { vencimento: 'asc' },
    }),
    prisma.contaReceber.findMany({
      where: dataFiltro ? { vencimento: dataFiltro } : {},
      include: { estabelecimento: { select: { razaoSocial: true } } },
      orderBy: { vencimento: 'asc' },
    }),
  ])

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const totalPagar = contasPagar.reduce((s, c) => s + Number(c.valor), 0)
  const totalReceber = contasReceber.reduce((s, c) => s + Number(c.valor), 0)
  const pagas = contasPagar.filter(c => c.status === 'PAGA').length
  const recebidas = contasReceber.filter(c => c.status === 'RECEBIDA').length
  const vencidasPagar = contasPagar.filter(c => c.status === 'ABERTA' && new Date(c.vencimento) < hoje).length
  const vencidasReceber = contasReceber.filter(c => c.status === 'ABERTA' && new Date(c.vencimento) < hoje).length

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/relatorios" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatório Financeiro</h1>
          <p className="text-sm text-gray-500">
            {contasPagar.length} conta(s) a pagar · {contasReceber.length} conta(s) a receber
          </p>
        </div>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Total a Pagar</p>
          <p className="mt-1 text-xl font-bold text-red-600">{formatMoeda(totalPagar)}</p>
          <p className="mt-1 text-xs text-gray-400">{pagas} paga(s)</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Total a Receber</p>
          <p className="mt-1 text-xl font-bold text-green-600">{formatMoeda(totalReceber)}</p>
          <p className="mt-1 text-xs text-gray-400">{recebidas} recebida(s)</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Vencidas a Pagar</p>
          <p className="mt-1 text-xl font-bold text-red-700">{vencidasPagar}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Vencidas a Receber</p>
          <p className="mt-1 text-xl font-bold text-orange-600">{vencidasReceber}</p>
        </div>
      </div>

      {/* Filtros */}
      <Suspense fallback={<div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-400">Carregando filtros…</div>}>
        <FiltrosPeriodo basePath="/relatorios/financeiro" />
      </Suspense>

      {/* Contas a Pagar */}
      <div>
        <h2 className="mb-3 font-semibold text-gray-900">Contas a Pagar</h2>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Descrição', 'Categoria', 'Vencimento', 'Valor', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contasPagar.length === 0 && (
                <tr><td colSpan={5} className="py-10 text-center text-gray-400">Nenhuma conta encontrada.</td></tr>
              )}
              {contasPagar.map(c => {
                const vencida = c.status === 'ABERTA' && new Date(c.vencimento) < hoje
                return (
                  <tr key={c.id} className={`hover:bg-gray-50 ${vencida ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-3 font-medium text-gray-900">{c.descricao}</td>
                    <td className="px-4 py-3 text-gray-600">{c.categoria ?? '—'}</td>
                    <td className={`px-4 py-3 whitespace-nowrap ${vencida ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                      {formatData(c.vencimento)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-red-600">{formatMoeda(c.valor)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.status === 'PAGA' ? 'bg-green-100 text-green-800' :
                        c.status === 'CANCELADA' ? 'bg-gray-100 text-gray-500' :
                        vencida ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {c.status === 'PAGA' ? 'Paga' : c.status === 'CANCELADA' ? 'Cancelada' : vencida ? 'Vencida' : 'Aberta'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            {contasPagar.length > 0 && (
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-xs text-gray-500">Total: {contasPagar.length} conta(s)</td>
                  <td className="px-4 py-3 text-sm font-bold text-red-600">{formatMoeda(totalPagar)}</td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Contas a Receber */}
      <div>
        <h2 className="mb-3 font-semibold text-gray-900">Contas a Receber</h2>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Descrição', 'Estabelecimento', 'Vencimento', 'Valor', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contasReceber.length === 0 && (
                <tr><td colSpan={5} className="py-10 text-center text-gray-400">Nenhuma conta encontrada.</td></tr>
              )}
              {contasReceber.map(c => {
                const vencida = c.status === 'ABERTA' && new Date(c.vencimento) < hoje
                return (
                  <tr key={c.id} className={`hover:bg-gray-50 ${vencida ? 'bg-orange-50' : ''}`}>
                    <td className="px-4 py-3 font-medium text-gray-900">{c.descricao}</td>
                    <td className="px-4 py-3 text-gray-600">{c.estabelecimento?.razaoSocial ?? '—'}</td>
                    <td className={`px-4 py-3 whitespace-nowrap ${vencida ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
                      {formatData(c.vencimento)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-green-600">{formatMoeda(c.valor)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.status === 'RECEBIDA' ? 'bg-green-100 text-green-800' :
                        c.status === 'CANCELADA' ? 'bg-gray-100 text-gray-500' :
                        vencida ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {c.status === 'RECEBIDA' ? 'Recebida' : c.status === 'CANCELADA' ? 'Cancelada' : vencida ? 'Vencida' : 'Aberta'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            {contasReceber.length > 0 && (
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-xs text-gray-500">Total: {contasReceber.length} conta(s)</td>
                  <td className="px-4 py-3 text-sm font-bold text-green-600">{formatMoeda(totalReceber)}</td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}
