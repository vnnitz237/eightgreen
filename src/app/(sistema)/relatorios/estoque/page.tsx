export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { formatDataHora, STATUS_LABELS } from '@/lib/format'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

type SearchParams = Promise<{
  grupo_id?: string
  apenas_negativos?: string
}>

export default async function RelatorioEstoquePage({ searchParams }: { searchParams: SearchParams }) {
  const { grupo_id, apenas_negativos } = await searchParams

  const [saldos, movimentacoes, grupos] = await Promise.all([
    prisma.saldoEstoque.findMany({
      where: {
        ...(grupo_id ? { produto: { grupoId: grupo_id } } : {}),
        ...(apenas_negativos === 'true' ? { quantidade: { lt: 0 } } : {}),
      },
      include: {
        produto: {
          select: { nome: true, codigo: true, grupo: { select: { nome: true } } },
        },
      },
      orderBy: { produto: { nome: 'asc' } },
    }),
    prisma.documentoEstoqueItem.findMany({
      include: {
        produto: { select: { nome: true, codigo: true } },
        documento: { select: { tipo: true, criadoEm: true, observacao: true } },
      },
      orderBy: { documento: { criadoEm: 'desc' } },
      take: 50,
    }),
    prisma.grupoProduto.findMany({ orderBy: { nome: 'asc' } }),
  ])

  const negativos = saldos.filter(s => Number(s.quantidade) < 0).length

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/relatorios" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatório de Estoque</h1>
          <p className="text-sm text-gray-500">{saldos.length} produto(s) · {negativos} com saldo negativo</p>
        </div>
      </div>

      {/* Filtros */}
      <form method="GET" className="flex flex-wrap items-end gap-3 rounded-lg bg-gray-50 p-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Grupo</label>
          <select name="grupo_id" defaultValue={grupo_id ?? ''}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none min-w-[160px]">
            <option value="">Todos os grupos</option>
            {grupos.map(g => <option key={g.id} value={g.id}>{g.nome}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 pb-1">
          <input type="checkbox" id="apenas_negativos" name="apenas_negativos" value="true"
            defaultChecked={apenas_negativos === 'true'} className="h-4 w-4 text-green-600" />
          <label htmlFor="apenas_negativos" className="text-sm text-gray-700">Apenas negativos</label>
        </div>
        <button type="submit"
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
          Filtrar
        </button>
        <Link href="/relatorios/estoque"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
          Limpar
        </Link>
      </form>

      {/* Saldos */}
      <div>
        <h2 className="mb-3 font-semibold text-gray-900">Saldos atuais</h2>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Código', 'Produto', 'Grupo', 'Saldo'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {saldos.length === 0 && (
                <tr><td colSpan={4} className="py-10 text-center text-gray-400">Nenhum produto encontrado.</td></tr>
              )}
              {saldos.map(s => {
                const qtd = Number(s.quantidade)
                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.produto.codigo ?? '—'}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{s.produto.nome}</td>
                    <td className="px-4 py-3 text-gray-600">{s.produto.grupo?.nome ?? '—'}</td>
                    <td className={`px-4 py-3 font-semibold ${qtd < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      {qtd}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Últimas movimentações */}
      <div>
        <h2 className="mb-3 font-semibold text-gray-900">Últimas 50 movimentações</h2>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Data', 'Tipo', 'Código', 'Produto', 'Qtd', 'Observação'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {movimentacoes.length === 0 && (
                <tr><td colSpan={6} className="py-10 text-center text-gray-400">Nenhuma movimentação.</td></tr>
              )}
              {movimentacoes.map(m => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDataHora(m.documento.criadoEm)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium
                      ${m.documento.tipo === 'ENTRADA' ? 'bg-green-100 text-green-800' :
                        m.documento.tipo === 'SAIDA' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'}`}>
                      {STATUS_LABELS[m.documento.tipo] ?? m.documento.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{m.produto.codigo ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-900">{m.produto.nome}</td>
                  <td className="px-4 py-3 text-center font-medium text-gray-900">{Number(m.quantidade)}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{m.documento.observacao ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
