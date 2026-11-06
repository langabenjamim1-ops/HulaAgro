'use client'

import { useCallback, useEffect, useState } from 'react'
import { Activity, RefreshCw, Rows3 } from 'lucide-react'
import { CLIENT_PAGE_SIZE, getClientJson, invalidateClientData, pagedEndpoint } from '@/lib/client-data'

export type LiveColumn = { key: string; label: string; unit?: string; kind?: 'date' | 'currency' | 'number' }

export function LiveRecordsPage({ title, description, endpoint, columns, emptyMessage = 'Ainda não existem registos reais nesta área.' }: { title: string; description: string; endpoint: string; columns: LiveColumn[]; emptyMessage?: string }) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState('')
  const load = useCallback(async (offset = 0, refresh = false) => {
    if (refresh) invalidateClientData(pagedEndpoint(endpoint, offset))
    if (offset === 0) setLoading(true); else setLoadingMore(true)
    setError('')
    try {
      const data: unknown = await getClientJson(pagedEndpoint(endpoint, offset))
      if (!Array.isArray(data)) throw new Error('A resposta do servidor não tem o formato esperado.')
      const pageRows = data.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
      setRows((current) => offset === 0 ? pageRows : [...current, ...pageRows])
      setHasMore(pageRows.length === CLIENT_PAGE_SIZE)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Falha ao carregar os registos.') }
    finally { setLoading(false); setLoadingMore(false) }
  }, [endpoint])
  useEffect(() => { void load() }, [load])
  const amountColumn = columns.find((column) => column.kind === 'currency' || column.kind === 'number')
  const sum = amountColumn ? rows.reduce((total, row) => total + (Number(row[amountColumn.key]) || 0), 0) : null
  function format(row: Record<string, unknown>, column: LiveColumn) {
    const value = row[column.key]
    if (value == null || value === '') return '—'
    if (column.kind === 'date') {
      const date = new Date(String(value))
      return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('pt-MZ')
    }
    if (column.kind === 'currency') return `${Number(value).toLocaleString('pt-MZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${column.unit ?? 'MZN'}`
    if (column.kind === 'number') return `${Number(value).toLocaleString('pt-MZ', { maximumFractionDigits: 2 })}${column.unit ? ` ${column.unit}` : ''}`
    return String(value)
  }
  return <div className="space-y-6 pb-8">
    <section className="flex flex-col justify-between gap-4 rounded-2xl bg-[#515062] p-6 text-white sm:flex-row sm:items-center sm:p-8"><div className="flex items-start gap-3"><span className="rounded-xl bg-white/10 p-3"><Activity className="h-5 w-5" /></span><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#D5DEDC]">Gestão integrada</p><h1 className="mt-1 text-2xl font-bold sm:text-3xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#E2E8E6]">{description}</p></div></div><button onClick={() => void load(0, true)} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#CDEFE7] px-4 py-2.5 text-sm font-bold text-[#515062] hover:bg-white disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Atualizar</button></section>
    <section className="grid gap-4 sm:grid-cols-2"><div className="rounded-xl border border-[#E2E8E6] bg-white p-5"><p className="text-sm text-[#7D8B89]">Registos carregados</p><p className="mt-2 text-2xl font-bold text-[#515062]">{loading ? '…' : rows.length}</p></div>{sum !== null && <div className="rounded-xl border border-[#E2E8E6] bg-white p-5"><p className="text-sm text-[#7D8B89]">Total nesta lista · {amountColumn?.label}</p><p className="mt-2 text-2xl font-bold text-[#515062]">{loading ? '…' : `${sum.toLocaleString('pt-MZ', { maximumFractionDigits: 2 })} ${amountColumn?.unit ?? ''}`}</p></div>}</section>
    <section className="overflow-hidden rounded-xl border border-[#E2E8E6] bg-white shadow-sm"><div className="flex items-center gap-2 border-b border-[#EEF2F1] px-5 py-4"><Rows3 className="h-4 w-4 text-[#2FB394]" /><h2 className="font-bold text-[#515062]">Dados registados</h2></div>{error ? <div role="alert" className="m-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">{error}</div> : loading ? <div className="p-8 text-center text-sm text-[#7D8B89]">A carregar dados reais…</div> : rows.length === 0 ? <div className="p-10 text-center"><Activity className="mx-auto h-8 w-8 text-[#98ABA9]" /><p className="mt-3 text-sm font-semibold text-[#2FB394]">Sem dados para apresentar</p><p className="mt-1 text-sm text-[#7D8B89]">{emptyMessage}</p></div> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-[#F9F9F9] text-left text-xs uppercase tracking-wide text-[#7D8B89]"><tr>{columns.map((column) => <th key={column.key} className="px-4 py-3">{column.label}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={String(row.id ?? index)} className="border-t border-[#EEF2F1] hover:bg-[#F9F9F9]">{columns.map((column) => <td key={column.key} className="max-w-sm px-4 py-3 text-[#5F5E73]">{format(row, column)}</td>)}</tr>)}</tbody></table></div>}</section>
    {hasMore && <div className="flex justify-center"><button onClick={() => void load(rows.length)} disabled={loadingMore} className="rounded-lg border border-[#E2E8E6] bg-white px-5 py-2.5 text-sm font-semibold text-[#5F5E73] shadow-sm hover:bg-[#F9F9F9] disabled:opacity-60">{loadingMore ? 'A carregar…' : 'Carregar mais registos'}</button></div>}
  </div>
}
