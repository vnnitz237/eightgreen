export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { formatData } from '@/lib/format'
import FiltrosPeriodo from '@/componentes/relatorios/FiltrosPeriodo'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, XCircle, MapPin, Image } from 'lucide-react'

type SearchParams = Promise<{
  inicio?: string
  fim?: string
  promotor_id?: string
}>

export default async function RelatorioMerchanPage({ searchParams }: { searchParams: SearchParams }) {
  const { inicio, fim, promotor_id } = await searchParams

  const [visitas, promotores] = await Promise.all([
    prisma.merchan.findMany({
      where: {
        ...(inicio && fim
          ? { data: { gte: new Date(inicio), lte: new Date(fim) } }
          : {}),
        ...(promotor_id ? { promotorId: promotor_id } : {}),
      },
      include: {
        estabelecimento: { select: { razaoSocial: true } },
        promotor: { select: { name: true } },
        rotaParada: { select: { id: true, ordem: true } },
      },
      orderBy: { data: 'desc' },
    }),
    prisma.usuario.findMany({
      where: { merchanPromotor: { some: {} } },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ])

  const comChecklist = visitas.filter(v => v.checklistOk).length
  const comFotos = visitas.filter(v => v.fotos.length > 0).length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/relatorios" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatório de Merchan</h1>
          <p className="text-sm text-gray-500">
            {visitas.length} visita(s) · {comChecklist} com checklist OK · {comFotos} com fotos
          </p>
        </div>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total de visitas', value: visitas.length, color: 'text-gray-900' },
          { label: 'Checklist OK', value: comChecklist, color: 'text-green-600' },
          { label: 'Com fotos', value: comFotos, color: 'text-blue-600' },
          { label: 'Sem checklist', value: visitas.length - comChecklist, color: 'text-red-600' },
        ].map(c => (
          <div key={c.label} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className={`mt-1 text-2xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="rounded-lg bg-gray-50 p-4">
        <form method="GET" className="flex flex-wrap items-end gap-3">
          <Suspense>
            <FiltrosPeriodo basePath="/relatorios/merchan" />
          </Suspense>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Promotor</label>
            <select name="promotor_id" defaultValue={promotor_id ?? ''}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none min-w-[180px]">
              <option value="">Todos</option>
              {promotores.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <button type="submit"
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
            Filtrar
          </button>
          <Link href="/relatorios/merchan"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
            Limpar
          </Link>
        </form>
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Data', 'Estabelecimento', 'Promotor', 'Entrada', 'Saída', 'Checklist', 'Fotos', 'GPS'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visitas.length === 0 && (
              <tr><td colSpan={8} className="py-10 text-center text-gray-400">Nenhuma visita encontrada.</td></tr>
            )}
            {visitas.map(v => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatData(v.data)}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{v.estabelecimento?.razaoSocial ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{v.promotor?.name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{v.horaEntrada ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{v.horaSaida ?? '—'}</td>
                <td className="px-4 py-3">
                  {v.checklistOk
                    ? <CheckCircle className="h-4 w-4 text-green-500" />
                    : <XCircle className="h-4 w-4 text-red-400" />}
                </td>
                <td className="px-4 py-3">
                  {v.fotos.length > 0 ? (
                    <span className="inline-flex items-center gap-1 text-blue-600">
                      <Image className="h-4 w-4" /> {v.fotos.length}
                    </span>
                  ) : '—'}
                </td>
                <td className="px-4 py-3">
                  {v.latEntrada && v.lngEntrada ? (
                    <span className="inline-flex items-center gap-1 text-green-600 text-xs">
                      <MapPin className="h-3 w-3" /> {v.latEntrada.toFixed(4)}, {v.lngEntrada.toFixed(4)}
                    </span>
                  ) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
