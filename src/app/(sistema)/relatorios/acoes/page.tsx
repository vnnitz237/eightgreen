export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { formatData, STATUS_LABELS, STATUS_CORES } from '@/lib/format'
import FiltrosAcoes from '@/componentes/relatorios/FiltrosAcoes'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { StatusAcao } from '@prisma/client'

type SearchParams = Promise<{
  inicio?: string
  fim?: string
  status?: string
  estabelecimento_id?: string
  degustadora_id?: string
}>

export default async function RelatorioAcoesPage({ searchParams }: { searchParams: SearchParams }) {
  const { inicio, fim, status, estabelecimento_id, degustadora_id } = await searchParams

  const [acoes, estabelecimentos, degustadoras] = await Promise.all([
    prisma.acao.findMany({
      where: {
        ...(inicio && fim
          ? { data: { gte: new Date(inicio) }, dataFim: { lte: new Date(fim) } }
          : {}),
        ...(status ? { status: status as StatusAcao } : {}),
        ...(estabelecimento_id ? { estabelecimentoId: estabelecimento_id } : {}),
        ...(degustadora_id
          ? { acaoDegustadoras: { some: { degustadoraId: degustadora_id } } }
          : {}),
      },
      include: {
        estabelecimento: { select: { razaoSocial: true } },
        _count: { select: { produtos: true, acaoDegustadoras: true } },
      },
      orderBy: { data: 'desc' },
    }),
    prisma.estabelecimento.findMany({
      select: { id: true, razaoSocial: true },
      orderBy: { razaoSocial: 'asc' },
    }),
    prisma.degustadora.findMany({
      select: { id: true, nome: true },
      where: { ativo: true },
      orderBy: { nome: 'asc' },
    }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/relatorios" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatório de Ações</h1>
          <p className="text-sm text-gray-500">{acoes.length} registro(s) encontrado(s)</p>
        </div>
      </div>

      <Suspense fallback={<div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-400">Carregando filtros…</div>}>
        <FiltrosAcoes estabelecimentos={estabelecimentos} degustadoras={degustadoras} />
      </Suspense>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Ação', 'Estabelecimento', 'Data', 'Fim', 'Status', 'Produtos', 'Degustadoras'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {acoes.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-gray-400">Nenhuma ação encontrada.</td>
              </tr>
            )}
            {acoes.map(a => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  <Link href={`/acoes/${a.id}`} className="hover:text-green-600">{a.titulo}</Link>
                </td>
                <td className="px-4 py-3 text-gray-600">{a.estabelecimento?.razaoSocial ?? a.estabelecimentoAvulso ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{formatData(a.data)}</td>
                <td className="px-4 py-3 text-gray-600">{a.dataFim ? formatData(a.dataFim) : '—'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CORES[a.status] ?? 'bg-gray-100 text-gray-700'}`}>
                    {STATUS_LABELS[a.status] ?? a.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-gray-600">{a._count.produtos}</td>
                <td className="px-4 py-3 text-center text-gray-600">{a._count.acaoDegustadoras}</td>
              </tr>
            ))}
          </tbody>
          {acoes.length > 0 && (
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={5} className="px-4 py-3 text-xs text-gray-500">Total: {acoes.length} ações</td>
                <td className="px-4 py-3 text-center text-xs font-medium text-gray-700">
                  {acoes.reduce((s, a) => s + a._count.produtos, 0)}
                </td>
                <td className="px-4 py-3 text-center text-xs font-medium text-gray-700">
                  {acoes.reduce((s, a) => s + a._count.acaoDegustadoras, 0)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
