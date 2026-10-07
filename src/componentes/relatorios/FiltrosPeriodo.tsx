'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

interface FiltrosPeriodoProps {
  basePath: string
  extraParams?: Record<string, string>
}

export default function FiltrosPeriodo({ basePath, extraParams = {} }: FiltrosPeriodoProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [inicio, setInicio] = useState(searchParams.get('inicio') ?? '')
  const [fim, setFim] = useState(searchParams.get('fim') ?? '')

  function aplicar() {
    const params = new URLSearchParams({ ...extraParams })
    if (inicio) params.set('inicio', inicio)
    if (fim) params.set('fim', fim)
    router.push(`${basePath}?${params.toString()}`)
  }

  function limpar() {
    setInicio('')
    setFim('')
    router.push(basePath)
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg bg-gray-50 p-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">Data início</label>
        <input
          type="date"
          value={inicio}
          onChange={e => setInicio(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">Data fim</label>
        <input
          type="date"
          value={fim}
          onChange={e => setFim(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={aplicar}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          Filtrar
        </button>
        <button
          onClick={limpar}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Limpar
        </button>
      </div>
    </div>
  )
}
