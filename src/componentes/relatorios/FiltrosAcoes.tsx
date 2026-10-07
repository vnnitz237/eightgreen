'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

interface Estabelecimento {
  id: string
  razaoSocial: string
}

interface FiltrosAcoesProps {
  estabelecimentos: Estabelecimento[]
}

// StatusAcao values are lowercase in this project's schema
const STATUS_OPCOES = [
  { value: '', label: 'Todos os status' },
  { value: 'aberta', label: 'Aberta' },
  { value: 'encerrada', label: 'Encerrada' },
  { value: 'cancelada', label: 'Cancelada' },
]

export default function FiltrosAcoes({ estabelecimentos }: FiltrosAcoesProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [inicio, setInicio] = useState(searchParams.get('inicio') ?? '')
  const [fim, setFim] = useState(searchParams.get('fim') ?? '')
  const [status, setStatus] = useState(searchParams.get('status') ?? '')
  const [estabelecimentoId, setEstabelecimentoId] = useState(searchParams.get('estabelecimento_id') ?? '')

  function aplicar() {
    const params = new URLSearchParams()
    if (inicio) params.set('inicio', inicio)
    if (fim) params.set('fim', fim)
    if (status) params.set('status', status)
    if (estabelecimentoId) params.set('estabelecimento_id', estabelecimentoId)
    router.push(`/relatorios/acoes?${params.toString()}`)
  }

  function limpar() {
    setInicio(''); setFim(''); setStatus(''); setEstabelecimentoId('')
    router.push('/relatorios/acoes')
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg bg-gray-50 p-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">Data início</label>
        <input type="date" value={inicio} onChange={e => setInicio(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">Data fim</label>
        <input type="date" value={fim} onChange={e => setFim(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">Status</label>
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none">
          {STATUS_OPCOES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">Estabelecimento</label>
        <select value={estabelecimentoId} onChange={e => setEstabelecimentoId(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none min-w-[200px]">
          <option value="">Todos</option>
          {estabelecimentos.map(e => <option key={e.id} value={e.id}>{e.razaoSocial}</option>)}
        </select>
      </div>
      <div className="flex gap-2">
        <button onClick={aplicar}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
          Filtrar
        </button>
        <button onClick={limpar}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
          Limpar
        </button>
      </div>
    </div>
  )
}
