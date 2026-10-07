import { Prisma } from '@prisma/client'

export function formatMoeda(valor: number | Prisma.Decimal | null | undefined): string {
  if (valor === null || valor === undefined) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor))
}

export function formatData(data: Date | string | null | undefined): string {
  if (!data) return '—'
  return new Intl.DateTimeFormat('pt-BR').format(new Date(data))
}

export function formatDataHora(data: Date | string | null | undefined): string {
  if (!data) return '—'
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(data))
}

export const STATUS_LABELS: Record<string, string> = {
  // StatusAcao (lowercase)
  aberta: 'Aberta',
  encerrada: 'Encerrada',
  cancelada: 'Cancelada',
  // StatusContaPagar / StatusContaReceber
  ABERTA: 'Aberta',
  PAGA: 'Paga',
  RECEBIDA: 'Recebida',
  CANCELADA: 'Cancelada',
  // TipoDocumentoEstoque
  ENTRADA: 'Entrada',
  SAIDA: 'Saída',
  INVENTARIO: 'Inventário',
  // StatusRota
  PENDENTE: 'Pendente',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDA: 'Concluída',
}

export const STATUS_CORES: Record<string, string> = {
  aberta: 'bg-blue-100 text-blue-800',
  encerrada: 'bg-gray-100 text-gray-800',
  cancelada: 'bg-red-100 text-red-800',
  ABERTA: 'bg-blue-100 text-blue-800',
  PAGA: 'bg-green-100 text-green-800',
  RECEBIDA: 'bg-green-100 text-green-800',
  CANCELADA: 'bg-red-100 text-red-800',
  PENDENTE: 'bg-orange-100 text-orange-800',
  EM_ANDAMENTO: 'bg-yellow-100 text-yellow-800',
  CONCLUIDA: 'bg-gray-100 text-gray-800',
}
