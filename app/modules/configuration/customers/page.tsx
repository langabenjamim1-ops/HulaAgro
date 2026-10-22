'use client'

import { useCallback, useEffect, useState } from 'react'
import { Building2, RefreshCw, Users } from 'lucide-react'

type Customer = {
  id: string; name: string; email: string | null; phone: string | null; status: string; plan: string
  trial_ends_at: string | null; created_at: string
  farms?: Array<{ id: string; farm_name: string; location: string | null }>
  profiles?: Array<{ id: string; full_name: string | null; role: string }>
  subscriptions?: Array<{ id: string; status: string; current_period_end: string | null; subscription_plans?: { name: string; price: number | null; currency: string } | null }>
}

const statuses = [
  ['trialing','Avaliação'], ['active','Activo'], ['past_due','Pagamento pendente'], ['suspended','Suspenso'], ['cancelled','Cancelado'],
]
const date = (value: string | null) => value ? new Date(value).toLocaleDateString('pt-PT') : '—'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')
  const [loading, setLoading] = useState(true)
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const response = await fetch('/api/admin/customers', { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Falha ao carregar clientes.')
      setCustomers(result.customers ?? [])
    } catch (e) { setError(e instanceof Error ? e.message : 'Falha ao carregar clientes.') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void load() }, [load])

  async function changeStatus(customer: Customer, status: string) {
    setBusyId(customer.id); setError('')
    try {
      const response = await fetch('/api/admin/customers', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tenant_id: customer.id, status }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Falha ao actualizar o cliente.')
      await load()
    } catch (e) { setError(e instanceof Error ? e.message : 'Falha ao actualizar o cliente.') }
    finally { setBusyId('') }
  }

  return <main className="h-full overflow-y-auto bg-[#F5F6F1] p-5 text-[#283106] md:p-8">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-xs font-bold tracking-widest text-[#718348]">PLATAFORMA</p><h1 className="mt-1 text-2xl font-bold">Gestão de clientes</h1><p className="mt-2 text-sm text-[#68705B]">Organizações inscritas, estado das contas e períodos de avaliação.</p></div>
      <button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-[#C8D0B8] bg-white px-3 py-2 text-sm font-medium hover:bg-[#F5F6F1] disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Actualizar</button>
    </header>
    {error && <div role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
    <div className="mt-6 overflow-hidden rounded-xl border border-[#E0E5D8] bg-white">
      <div className="flex items-center gap-2 border-b border-[#E7EADF] px-4 py-3 text-sm font-semibold"><Users className="h-4 w-4" />{customers.length} clientes</div>
      {loading ? <p className="p-6 text-sm text-[#68705B]">A carregar clientes…</p> : customers.length === 0 ? <p className="p-6 text-sm text-[#68705B]">Ainda não há clientes inscritos.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm">
        <thead className="bg-[#F7F8F4] text-xs uppercase text-[#68705B]"><tr><th className="px-4 py-3">Cliente / Aviário</th><th className="px-4 py-3">Contacto</th><th className="px-4 py-3">Plano</th><th className="px-4 py-3">Inscrição / Avaliação até</th><th className="px-4 py-3">Estado</th></tr></thead>
        <tbody className="divide-y divide-[#EEF0E9]">{customers.map((customer) => <tr key={customer.id}>
          <td className="px-4 py-4"><div className="font-semibold">{customer.name}</div><div className="mt-1 flex items-center gap-1 text-xs text-[#68705B]"><Building2 className="h-3 w-3" />{customer.farms?.map(f => f.farm_name).join(', ') || 'Sem aviário'}</div></td>
          <td className="px-4 py-4">{customer.email || '—'}<div className="mt-1 text-xs text-[#68705B]">{customer.phone || 'Sem telefone'}</div></td>
          <td className="px-4 py-4">{customer.subscriptions?.[0]?.subscription_plans?.name || customer.plan}</td>
          <td className="px-4 py-4">{date(customer.created_at)}<div className="mt-1 text-xs text-[#68705B]">Avaliação: {date(customer.trial_ends_at)}</div></td>
          <td className="px-4 py-4"><select aria-label={`Estado de ${customer.name}`} disabled={busyId === customer.id} value={customer.status} onChange={(e) => void changeStatus(customer,e.target.value)} className="rounded-md border border-[#D6DCCB] bg-white px-2 py-1.5 text-xs">{statuses.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></td>
        </tr>)}</tbody>
      </table></div>}
    </div>
  </main>
}
