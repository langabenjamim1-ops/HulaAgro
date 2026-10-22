'use client'

import { Edit2, Trash2 } from 'lucide-react'

interface Column {
  key: string
  label: string
  render?: (value: any, row: any) => React.ReactNode
}

interface CRUDTableProps {
  columns: Column[]
  data: any[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  loading?: boolean
}

export default function CRUDTable({ columns, data, onEdit, onDelete, loading }: CRUDTableProps) {
  if (loading) return <div className="rounded-xl border border-[#E2E5D9] bg-white p-10 text-center shadow-sm"><div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-[#DCE3C8] border-t-[#53602E]" /><p className="text-sm text-[#777E5C]">A carregar registos…</p></div>
  if (!data?.length) return <div className="rounded-xl border border-dashed border-[#D6DACB] bg-white px-6 py-12 text-center shadow-sm"><p className="font-semibold text-[#53602E]">Ainda não há registos</p><p className="mt-1 text-sm text-[#777E5C]">Os registos adicionados a este módulo vão aparecer aqui.</p></div>

  return <div className="w-full overflow-hidden rounded-xl border border-[#E2E5D9] bg-white shadow-sm"><div className="w-full overflow-x-auto"><table className="w-full min-w-[640px] font-montserrat text-sm">
    <thead className="border-b border-[#E2E5D9] bg-[#F7F8F4]"><tr>{columns.map((column) => <th key={column.key} className="whitespace-nowrap px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-[#68734C]">{column.label}</th>)}<th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-wide text-[#68734C]">Ações</th></tr></thead>
    <tbody>{data.map((row, index) => <tr key={row.id || index} className="border-b border-[#EEF0E9] transition-colors last:border-0 hover:bg-[#FAFBF8]">{columns.map((column) => <td key={column.key} className="px-5 py-3.5 text-[#343B22]">{column.render ? column.render(row[column.key], row) : row[column.key] || '—'}</td>)}<td className="px-3 py-2.5"><div className="flex items-center justify-center gap-1"><button type="button" onClick={() => onEdit(row.id)} className="rounded-lg p-2 transition-colors hover:bg-[#EEF3DE]" title="Editar" aria-label={`Editar registo ${row.id}`}><Edit2 className="h-4 w-4 text-[#53602E]" /></button><button type="button" onClick={() => onDelete(row.id)} className="rounded-lg p-2 transition-colors hover:bg-red-50" title="Remover" aria-label={`Remover registo ${row.id}`}><Trash2 className="h-4 w-4 text-red-600" /></button></div></td></tr>)}</tbody>
  </table></div></div>
}
