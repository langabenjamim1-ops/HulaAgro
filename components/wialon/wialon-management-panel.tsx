'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AlertTriangle, Bell, CarFront, FileText, Layers3, RefreshCw, Route, UserRound, Users, Wifi, WifiOff } from 'lucide-react'
import { getClientJson, invalidateClientData } from '@/lib/client-data'

type Fleet = {
  updatedAt: string
  account: { id: number; name: string }
  units: Array<{ id: number; name: string; connected: boolean; position: { speed: number } | null }>
  groups: Array<{ id: number; name: string; unitIds: number[] }>
  users: Array<{ id: number; name: string; lastLogin: number }>
  resources: Array<{ id: number; name: string }>
  drivers: Array<{ id: number; name: string; code: string; phone: string; description: string; assignedUnitId: number | null; resourceName: string }>
  driverGroups: Array<{ id: number; name: string; description: string; driverIds: number[] }>
  routes: Array<{ id: number; name: string; description: string; unitIds: number[]; checkpoints: Array<{ name: string; latitude: number; longitude: number }>; schedulesCount: number; ridesCount: number }>
  notifications: Array<{ id: number; name: string; text: string; disabled: boolean; alarmsCount: number; unitIds: number[]; triggerType: string; actionTypes: string[]; resourceName: string }>
  reportTemplates: Array<{ id: number; resourceId: number; resourceName: string; name: string; type: string }>
}

const tabs = [
  { id: 'units', label: 'Unidades', icon: CarFront },
  { id: 'groups', label: 'Grupos', icon: Layers3 },
  { id: 'users', label: 'Utilizadores', icon: Users },
  { id: 'drivers', label: 'Motoristas', icon: UserRound },
  { id: 'routes', label: 'Rotas', icon: Route },
  { id: 'notifications', label: 'Notificações', icon: Bell },
  { id: 'reports', label: 'Relatórios', icon: FileText },
] as const

type TabId = (typeof tabs)[number]['id']

function Empty({ label }: { label: string }) {
  return <div className="rounded-xl border border-dashed border-[#E2E8E6] bg-[#F9F9F9] p-8 text-center text-sm text-[#7D8B89]">Ainda não há {label} visíveis nesta conta Wialon. Se esperavas encontrar dados, confirma o acesso do token no Wialon.</div>
}

function Table({ headers, rows }: { headers: string[]; rows: Array<Array<ReactNode>> }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#E2E8E6]">
      <table className="w-full text-left text-sm">
        <thead className="bg-[#F9F9F9] text-xs uppercase tracking-wide text-[#2FB394]"><tr>{headers.map((header) => <th className="px-4 py-3 font-semibold" key={header}>{header}</th>)}</tr></thead>
        <tbody className="divide-y divide-[#E2E8E6]">{rows.map((row, index) => <tr className="bg-white" key={index}>{row.map((cell, cellIndex) => <td className="px-4 py-3 text-[#515062]" key={cellIndex}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  )
}

export default function WialonManagementPanel() {
  const [fleet, setFleet] = useState<Fleet | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('units')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedUnitId, setSelectedUnitId] = useState('')
  const [fromDate, setFromDate] = useState(() => new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10))
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [runningReportId, setRunningReportId] = useState<number | null>(null)
  const [reportTables, setReportTables] = useState<Array<{ name: string; headers: string[]; rows: string[][]; total: string[]; truncated: boolean }>>([])
  const [reportError, setReportError] = useState('')

  const loadFleet = useCallback(async (refresh = false) => {
    setLoading(true)
    try {
      if (refresh) invalidateClientData('/api/wialon/fleet')
      const result = await getClientJson<Fleet & { ok?: boolean; error?: string }>(refresh ? '/api/wialon/fleet?refresh=1' : '/api/wialon/fleet')
      if (!result.ok) throw new Error(result.error || 'Não foi possível carregar os dados Wialon.')
      setFleet(result)
      setSelectedUnitId((current) => current || String(result.units?.[0]?.id || ''))
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar dados Wialon.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void loadFleet() }, [loadFleet])

  const unitNames = useMemo(() => new Map((fleet?.units || []).map((unit) => [unit.id, unit.name])), [fleet?.units])
  const counts = fleet ? [fleet.units.length, fleet.groups.length, fleet.users.length, fleet.drivers.length, fleet.routes.length, fleet.notifications.length, fleet.reportTemplates.length] : []

  const runReport = async (template: Fleet['reportTemplates'][number]) => {
    if (!selectedUnitId) return
    setRunningReportId(template.id)
    setReportError('')
    setReportTables([])
    try {
      const response = await fetch('/api/wialon/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceId: template.resourceId,
          templateId: template.id,
          objectId: Number(selectedUnitId),
          from: Math.floor(new Date(`${fromDate}T00:00:00`).getTime() / 1000),
          to: Math.floor(new Date(`${toDate}T23:59:59`).getTime() / 1000),
        }),
      })
      const result = await response.json()
      if (!response.ok || !result.ok) throw new Error(result.error || 'Não foi possível executar o relatório.')
      setReportTables(result.tables || [])
    } catch (err) {
      setReportError(err instanceof Error ? err.message : 'Falha ao gerar relatório.')
    } finally {
      setRunningReportId(null)
    }
  }

  const renderTab = () => {
    if (!fleet) return null
    switch (activeTab) {
      case 'units':
        return fleet.units.length ? <Table headers={['Unidade', 'Estado', 'Velocidade']} rows={fleet.units.map((unit) => [unit.name, <span className={`inline-flex items-center gap-1 ${unit.connected ? 'text-green-700' : 'text-red-600'}`}><span className={`h-2 w-2 rounded-full ${unit.connected ? 'bg-green-600' : 'bg-red-500'}`} />{unit.connected ? 'Online' : 'Offline'}</span>, `${unit.position?.speed ?? 0} km/h`])} /> : <Empty label="unidades" />
      case 'groups':
        return fleet.groups.length ? <Table headers={['Grupo', 'Unidades']} rows={fleet.groups.map((group) => [group.name, group.unitIds.map((id) => unitNames.get(id) || `#${id}`).join(', ') || 'Sem unidades'])} /> : <Empty label="grupos de unidades" />
      case 'users':
        return fleet.users.length ? <Table headers={['Utilizador', 'Último acesso']} rows={fleet.users.map((user) => [user.name, user.lastLogin ? new Date(user.lastLogin * 1000).toLocaleString('pt-MZ') : '—'])} /> : <Empty label="utilizadores" />
      case 'drivers':
        return fleet.drivers.length || fleet.driverGroups.length ? <div className="space-y-5">
          {fleet.drivers.length > 0 && <Table headers={['Motorista', 'Código', 'Telefone', 'Unidade atribuída', 'Recurso']} rows={fleet.drivers.map((driver) => [driver.name, driver.code || '—', driver.phone || '—', driver.assignedUnitId ? unitNames.get(driver.assignedUnitId) || `#${driver.assignedUnitId}` : 'Sem atribuição', driver.resourceName || '—'])} />}
          {fleet.driverGroups.length > 0 && <div><h3 className="mb-2 font-semibold text-[#515062]">Grupos de motoristas</h3><Table headers={['Grupo', 'Motoristas']} rows={fleet.driverGroups.map((group) => [group.name, group.driverIds.map((id) => fleet.drivers.find((driver) => driver.id === id)?.name || `#${id}`).join(', ') || 'Sem motoristas'])} /></div>}
        </div> : <Empty label="motoristas" />
      case 'routes':
        return fleet.routes.length ? <Table headers={['Rota', 'Unidades', 'Pontos', 'Horários', 'Viagens']} rows={fleet.routes.map((route) => [route.name, route.unitIds.map((id) => unitNames.get(id) || `#${id}`).join(', ') || '—', route.checkpoints.length, route.schedulesCount, route.ridesCount])} /> : <Empty label="rotas" />
      case 'notifications':
        return fleet.notifications.length ? <Table headers={['Notificação', 'Estado', 'Gatilho', 'Ações', 'Unidades', 'Ocorrências']} rows={fleet.notifications.map((notification) => [notification.name, notification.disabled ? 'Desativada' : 'Ativa', notification.triggerType || '—', notification.actionTypes.join(', ') || '—', notification.unitIds.map((id) => unitNames.get(id) || `#${id}`).join(', ') || '—', notification.alarmsCount])} /> : <Empty label="notificações configuradas" />
      case 'reports':
        return <div className="space-y-4">
          {!fleet.reportTemplates.length ? <Empty label="modelos de relatório" /> : <>
            <div className="grid gap-3 rounded-xl border border-[#E2E8E6] bg-[#F9F9F9] p-4 md:grid-cols-[1fr_1fr_1fr_auto]">
              <label className="text-xs font-semibold text-[#2FB394]">Unidade<select className="mt-1 block w-full rounded-lg border border-[#E2E8E6] bg-white p-2 text-sm" value={selectedUnitId} onChange={(event) => setSelectedUnitId(event.target.value)}>{fleet.units.map((unit) => <option value={unit.id} key={unit.id}>{unit.name}</option>)}</select></label>
              <label className="text-xs font-semibold text-[#2FB394]">De<input className="mt-1 block w-full rounded-lg border border-[#E2E8E6] bg-white p-2 text-sm" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} /></label>
              <label className="text-xs font-semibold text-[#2FB394]">Até<input className="mt-1 block w-full rounded-lg border border-[#E2E8E6] bg-white p-2 text-sm" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} /></label>
              <div className="flex items-end text-xs text-[#7D8B89]">Intervalo máximo: 90 dias</div>
            </div>
            {fleet.reportTemplates.map((template) => <div className="flex flex-col gap-3 rounded-xl border border-[#E2E8E6] bg-white p-4 sm:flex-row sm:items-center sm:justify-between" key={`${template.resourceId}-${template.id}`}>
              <div><p className="font-semibold text-[#515062]">{template.name}</p><p className="mt-1 text-xs text-[#7D8B89]">{template.resourceName}{template.type ? ` · ${template.type}` : ''}</p></div>
              <button className="rounded-lg bg-[#2FB394] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={!selectedUnitId || runningReportId !== null} onClick={() => void runReport(template)}>{runningReportId === template.id ? 'A gerar…' : 'Gerar relatório'}</button>
            </div>)}
          </>}
          {reportError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{reportError}</p>}
          {reportTables.map((table, index) => <div key={`${table.name}-${index}`} className="space-y-2"><h3 className="font-semibold text-[#515062]">{table.name}</h3>{table.rows.length ? <Table headers={table.headers.length ? table.headers : table.rows[0].map((_, i) => `Coluna ${i + 1}`)} rows={table.rows.map((row) => row)} /> : <p className="text-sm text-[#7D8B89]">Sem linhas neste período.</p>}{table.total.length > 0 && <p className="text-xs text-[#2FB394]">Totais: {table.total.join(' · ')}</p>}{table.truncated && <p className="text-xs text-[#7D8B89]">Foram apresentados os primeiros 250 registos.</p>}</div>)}
          {fleet.reportTemplates.length > 0 && fleet.units.length === 0 && <p className="text-sm text-amber-700">A conta não tem unidades disponíveis para executar relatórios.</p>}
        </div>
    }
  }

  return <section className="mt-5 rounded-2xl border border-[#C9D4D1] bg-white p-4 shadow-sm md:p-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div><h2 className="font-montserrat text-base font-bold text-[#515062]">Gestão da frota Wialon</h2><p className="mt-1 text-xs text-[#7D8B89]">Unidades, grupos, utilizadores, motoristas, rotas, notificações e relatórios.</p></div>
      <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E2E8E6] px-3 py-2 text-sm text-[#2FB394] disabled:opacity-50" onClick={() => void loadFleet(true)} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Atualizar</button>
    </div>
    {error ? <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-900"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><div><p>{error}</p><p className="mt-1 text-xs">Confirma se o token tem permissão de leitura para os recursos Wialon que pretendes consultar.</p></div></div> : <>
      {fleet && <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#7D8B89]"><span className="inline-flex items-center gap-1 rounded-full bg-[#EEF2F1] px-2.5 py-1"><Wifi className="h-3.5 w-3.5" />{fleet.account.name || 'Conta Wialon'}</span><span>Atualizado {new Date(fleet.updatedAt).toLocaleTimeString('pt-MZ')}</span></div>}
      <div className="mt-4 flex gap-1 overflow-x-auto border-b border-[#E2E8E6] pb-2">{tabs.map(({ id, label, icon: Icon }, index) => <button key={id} className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${activeTab === id ? 'bg-[#EEF2F1] text-[#515062]' : 'text-[#7D8B89] hover:bg-[#F9F9F9]'}`} onClick={() => setActiveTab(id)}><Icon className="h-4 w-4" />{label}{fleet && <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px]">{counts[index]}</span>}</button>)}</div>
      <div className="mt-4">{loading && !fleet ? <p className="p-8 text-center text-sm text-[#7D8B89]">A carregar dados Wialon…</p> : renderTab()}</div>
    </>}
  </section>
}
