'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Activity, AlertTriangle, Bell, BellOff, Bird, Boxes, ChartNoAxesCombined, ClipboardList, Egg, Menu, Percent, Settings, Stethoscope, Truck, Wallet, X } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Sidebar from '@/components/sidebar/sidebar'
import WialonMapPanel from '@/components/wialon/wialon-map-panel'
import { getClientJson } from '@/lib/client-data'

type Row = Record<string, unknown>
type Summary = { batches: Row[]; production: Row[]; daily: Row[]; costs: Row[]; nutrition: Row[]; alerts: Row[]; lastDay: Row[] }

const emptySummary: Summary = { batches: [], production: [], daily: [], costs: [], nutrition: [], alerts: [], lastDay: [] }
const localDate = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const numeric = (value: unknown) => Number(value) || 0
const dateOf = (row: Row) => String(row.record_date || '').slice(0, 10)
const sumBy = (rows: Row[], field: string) => rows.reduce((sum, row) => sum + numeric(row[field]), 0)
const shortDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString('pt-MZ', { day: '2-digit', month: '2-digit' })
const number = (value: number, digits = 0) => value.toLocaleString('pt-MZ', { minimumFractionDigits: digits, maximumFractionDigits: digits })
const previousDay = (date: string) => { const d = new Date(`${date}T12:00:00`); d.setDate(d.getDate() - 1); return localDate(d) }
const asArray = (value: unknown): Row[] => (Array.isArray(value) ? value : [])

const quickLinks = [
  { name: 'Gestão de lotes', href: '/modules/batches', icon: Bird },
  { name: 'Produção', href: '/modules/production', icon: Egg },
  { name: 'Saúde animal', href: '/modules/health', icon: Stethoscope },
  { name: 'Manejo diário', href: '/modules/daily-management', icon: ClipboardList },
  { name: 'Compras e stock', href: '/modules/purchases', icon: Boxes },
  { name: 'Custos', href: '/modules/costs', icon: Wallet },
  { name: 'Frota Wialon', href: '/modules/wialon', icon: Truck },
  { name: 'Análises', href: '/modules/analysis', icon: ChartNoAxesCombined },
]

const alertRank: Record<string, number> = { critical: 0, warning: 1, info: 2 }
const alertStyle: Record<string, { label: string; chip: string }> = {
  critical: { label: 'Crítico', chip: 'bg-[#FCEBEC] text-[#C0383F]' },
  warning: { label: 'Aviso', chip: 'bg-[#FDF1E3] text-[#B85F0A]' },
  info: { label: 'Informação', chip: 'bg-[#E8F0FB] text-[#3B6FB8]' },
}

/** Variação percentual. `upIsGood` define se subir é bom (verde) ou mau (vermelho). */
function Delta({ current, previous, upIsGood, label }: { current: number; previous: number | null; upIsGood: boolean; label: string }) {
  if (previous === null || previous === 0) return <p className="mt-1 text-xs text-[#98A5A2]">Sem dia anterior para comparar</p>
  const change = ((current - previous) / previous) * 100
  if (Math.abs(change) < 0.05) return <p className="mt-1 text-xs text-[#7D8987]">= igual {label}</p>
  const good = change > 0 === upIsGood
  return <p className={`mt-1 text-xs font-semibold ${good ? 'text-[#1E9E7E]' : 'text-[#D96970]'}`}>{change > 0 ? '▲' : '▼'} {number(Math.abs(change), 1)}% <span className="font-normal text-[#7D8987]">{label}</span></p>
}

export default function DashboardClient() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [data, setData] = useState<Summary>(emptySummary)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const from = localDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000))
    getClientJson<Partial<Summary>>(`/api/dashboard/summary?from=${from}`)
      .then((summary) => setData({
        batches: asArray(summary.batches), production: asArray(summary.production), daily: asArray(summary.daily),
        costs: asArray(summary.costs), nutrition: asArray(summary.nutrition), alerts: asArray(summary.alerts), lastDay: asArray(summary.lastDay),
      }))
      .catch((error) => console.error('Falha ao carregar o resumo do painel:', error))
      .finally(() => setLoading(false))
  }, [])

  const metrics = useMemo(() => {
    const today = localDate()
    const activeBatches = data.batches.filter((row) => row.status === 'active')
    const activeBirds = sumBy(activeBatches, 'birds_count')
    // A taxa de postura usa só as poedeiras; se não houver lotes de poedeiras, usa todos os lotes ativos.
    const layerBirds = sumBy(activeBatches.filter((row) => String(row.bird_type || '').toLowerCase() === 'layers'), 'birds_count') || activeBirds

    // Produção: se hoje ainda não há registos, mostra o último dia com registos.
    const allProduction = [...data.production, ...data.lastDay]
    const hasToday = data.production.some((row) => dateOf(row) === today)
    const refDate = hasToday ? today : allProduction.map(dateOf).filter(Boolean).sort().pop() || today
    const isToday = refDate === today
    const prevDate = previousDay(refDate)

    const prodOn = (date: string) => data.production.filter((row) => dateOf(row) === date)
    const dailyOn = (date: string) => data.daily.filter((row) => dateOf(row) === date)
    const refProduction = allProduction.filter((row) => dateOf(row) === refDate)
    const prevProduction = prodOn(prevDate)
    const hasPrev = prevProduction.length > 0

    const eggs = sumBy(refProduction, 'eggs_produced')
    const prevEggs = hasPrev ? sumBy(prevProduction, 'eggs_produced') : null
    const rate = layerBirds > 0 ? (eggs / layerBirds) * 100 : 0
    const prevRate = hasPrev && layerBirds > 0 ? (sumBy(prevProduction, 'eggs_produced') / layerBirds) * 100 : null

    // A mortalidade pode estar registada na produção e na gestão diária: usa-se o maior dos dois valores por dia para não contar a mesma ave duas vezes.
    const mortalityOn = (date: string) => Math.max(sumBy(allProduction.filter((row) => dateOf(row) === date), 'mortality_count'), sumBy(dailyOn(date), 'mortality_count'))
    const mortality = mortalityOn(refDate)
    const prevMortality = hasPrev ? mortalityOn(prevDate) : null
    const weekDates = Array.from({ length: 7 }, (_, index) => { const d = new Date(); d.setDate(d.getDate() - index); return localDate(d) })
    const weekMortality = weekDates.reduce((sum, date) => sum + mortalityOn(date), 0)
    const weekMortalityRate = activeBirds > 0 ? (weekMortality / activeBirds) * 100 : 0

    const costsOn = (date: string) => sumBy(data.costs.filter((row) => dateOf(row) === date), 'amount')
    const todayCosts = costsOn(today)
    const yesterdayCosts = data.costs.some((row) => dateOf(row) === previousDay(today)) ? costsOn(previousDay(today)) : null
    const weekCosts = sumBy(data.costs, 'amount')

    return { activeBirds, refDate, isToday, eggs, prevEggs, rate, prevRate, mortality, prevMortality, weekMortality, weekMortalityRate, todayCosts, yesterdayCosts, weekCosts, hasProduction: refProduction.length > 0 }
  }, [data])

  const charts = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - (6 - index)); return localDate(date) })
    return days.map((date) => ({
      day: new Date(`${date}T12:00:00`).toLocaleDateString('pt-MZ', { weekday: 'short', day: '2-digit' }),
      ovos: data.production.filter((row) => dateOf(row) === date).reduce((sum, row) => sum + numeric(row.eggs_produced), 0),
      ração: data.nutrition.filter((row) => dateOf(row) === date).reduce((sum, row) => sum + numeric(row.consumption_kg), 0),
    }))
  }, [data])

  const alerts = useMemo(() => [...data.alerts].sort((a, b) => (alertRank[String(a.alert_type)] ?? 3) - (alertRank[String(b.alert_type)] ?? 3)), [data.alerts])
  const criticalCount = alerts.filter((row) => row.alert_type === 'critical').length
  const warningCount = alerts.filter((row) => row.alert_type === 'warning').length

  const dayLabel = metrics.isToday ? 'hoje' : `em ${shortDate(metrics.refDate)}`
  const compareLabel = metrics.isToday ? 'vs ontem' : 'vs dia anterior'
  const lastRecordNote = !metrics.isToday && metrics.hasProduction ? `Último registo: ${shortDate(metrics.refDate)}` : null
  const cardBase = 'rounded-2xl border border-[#EFEFEF] bg-white p-5 shadow-[0_2px_14px_rgba(65,65,77,0.05)]'

  return <div className="fixed inset-0 flex bg-[#F7F8F7] font-montserrat text-[#3F3E4D]">
    <div className="hidden h-full lg:block"><Sidebar /></div>
    {mobileOpen && <div className="fixed inset-0 z-50 flex lg:hidden"><button aria-label="Fechar navegação" className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} /><div className="relative h-full"><button onClick={() => setMobileOpen(false)} aria-label="Fechar menu" className="absolute right-2 top-2 z-10 rounded bg-[#5F5E73] p-2 text-white"><X className="h-4 w-4" /></button><Sidebar /></div></div>}
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#E2E8E6] bg-white px-4 shadow-sm sm:px-6 lg:px-8"><div className="flex items-center gap-3"><button className="rounded-lg p-2 hover:bg-[#F9F9F9] lg:hidden" aria-label="Abrir navegação" onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></button><span className="text-sm font-bold">HULA Agro</span><span className="text-sm text-[#7D8B89]">/</span><span className="text-sm text-[#7D8B89]">Painel de gestão</span></div><Link href="/modules/configuration" className="rounded-lg p-2 text-[#7D8B89] hover:bg-[#F9F9F9]" aria-label="Configurações"><Settings className="h-5 w-5" /></Link></header>
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8"><div className="mx-auto max-w-[1680px] space-y-6">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-ink">{new Intl.DateTimeFormat('pt-MZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}</p><h1 className="mt-2 text-2xl font-bold tracking-tight text-[#3F3E4D] sm:text-3xl">Resumo da exploração</h1><p className="mt-2 text-sm text-[#7D8987]">Indicadores calculados a partir dos registos do sistema.</p></div><Link href="/modules/batches/create" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover">+ Novo lote</Link></section>

        {!loading && (alerts.length > 0
          ? <section className={`rounded-2xl border p-4 sm:p-5 ${criticalCount > 0 ? 'border-[#F3C9CC] bg-[#FFF7F7]' : 'border-[#F2DDBF] bg-[#FFFAF2]'}`} aria-label="Alertas ativos">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2"><Bell className={`h-5 w-5 ${criticalCount > 0 ? 'text-[#C0383F]' : 'text-[#B85F0A]'}`} /><h2 className="font-bold">{alerts.length} {alerts.length === 1 ? 'alerta ativo' : 'alertas ativos'}</h2><span className="text-xs text-[#7D8987]">{criticalCount > 0 && `${criticalCount} crítico${criticalCount > 1 ? 's' : ''}`}{criticalCount > 0 && warningCount > 0 && ' · '}{warningCount > 0 && `${warningCount} aviso${warningCount > 1 ? 's' : ''}`}</span></div>
                <Link href="/modules/alerts" className="text-sm font-semibold text-brand-ink hover:underline">Ver todos</Link>
              </div>
              <ul className="mt-3 space-y-2">{alerts.slice(0, 3).map((alert, index) => { const style = alertStyle[String(alert.alert_type)] ?? alertStyle.info; return <li key={String(alert.id ?? index)} className="flex items-start gap-3 rounded-xl bg-white/80 p-3"><span className={`mt-0.5 shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold ${style.chip}`}>{style.label}</span><div className="min-w-0"><p className="text-sm font-semibold">{String(alert.alert_title || 'Alerta')}</p>{Boolean(alert.alert_message) && <p className="line-clamp-2 text-xs text-[#7D8987]">{String(alert.alert_message)}</p>}</div></li> })}</ul>
              {alerts.length > 3 && <p className="mt-2 text-xs text-[#7D8987]">e mais {alerts.length - 3} por ver.</p>}
            </section>
          : <section className="flex items-center gap-2 rounded-2xl border border-[#D5EFE6] bg-[#F3FBF8] px-4 py-3 text-sm text-[#1E7F66]"><BellOff className="h-4 w-4" />Sem alertas ativos neste momento.</section>)}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <article className={cardBase}><div className="flex items-start justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDF1E3] text-[#B85F0A]"><Bird className="h-5 w-5" /></div>{loading && <span className="text-xs text-[#98A5A2]">A carregar</span>}</div><p className="mt-4 text-xs font-medium text-[#7D8987]">Aves alojadas em lotes ativos</p><p className="mt-1 text-2xl font-bold tracking-tight">{loading ? '—' : number(metrics.activeBirds)}</p></article>

          <article className={cardBase}><div className="flex items-start justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E1F7F0] text-[#1E9E7E]"><Egg className="h-5 w-5" /></div>{loading && <span className="text-xs text-[#98A5A2]">A carregar</span>}</div><p className="mt-4 text-xs font-medium text-[#7D8987]">Ovos registados {dayLabel}</p><p className="mt-1 text-2xl font-bold tracking-tight">{loading ? '—' : metrics.hasProduction ? number(metrics.eggs) : '—'}</p>{!loading && (metrics.hasProduction ? <Delta current={metrics.eggs} previous={metrics.prevEggs} upIsGood label={compareLabel} /> : <p className="mt-1 text-xs text-[#98A5A2]">Ainda sem registos de postura</p>)}{lastRecordNote && <p className="mt-1 text-xs text-[#B85F0A]">{lastRecordNote}</p>}</article>

          <article className={cardBase}><div className="flex items-start justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F0FB] text-[#3B6FB8]"><Percent className="h-5 w-5" /></div>{loading && <span className="text-xs text-[#98A5A2]">A carregar</span>}</div><p className="mt-4 text-xs font-medium text-[#7D8987]">Taxa de postura {dayLabel}</p><p className="mt-1 text-2xl font-bold tracking-tight">{loading ? '—' : metrics.hasProduction && metrics.activeBirds > 0 ? `${number(metrics.rate, 1)}%` : '—'}</p>{!loading && metrics.hasProduction && metrics.activeBirds > 0 && <Delta current={metrics.rate} previous={metrics.prevRate} upIsGood label={compareLabel} />}<p className="mt-1 text-xs text-[#98A5A2]">Ovos ÷ aves em lotes ativos</p></article>

          <article className={cardBase}><div className="flex items-start justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FCEBEC] text-[#D96970]"><AlertTriangle className="h-5 w-5" /></div>{loading && <span className="text-xs text-[#98A5A2]">A carregar</span>}</div><p className="mt-4 text-xs font-medium text-[#7D8987]">Mortalidade {dayLabel}</p><p className="mt-1 text-2xl font-bold tracking-tight">{loading ? '—' : number(metrics.mortality)}</p>{!loading && <Delta current={metrics.mortality} previous={metrics.prevMortality} upIsGood={false} label={compareLabel} />}{!loading && <p className="mt-1 text-xs text-[#98A5A2]">7 dias: {number(metrics.weekMortality)} aves ({number(metrics.weekMortalityRate, 2)}%)</p>}</article>

          <article className={cardBase}><div className="flex items-start justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0E9FB] text-[#7A55B8]"><Wallet className="h-5 w-5" /></div>{loading && <span className="text-xs text-[#98A5A2]">A carregar</span>}</div><p className="mt-4 text-xs font-medium text-[#7D8987]">Custos registados hoje</p><p className="mt-1 text-2xl font-bold tracking-tight">{loading ? '—' : `MZN ${number(metrics.todayCosts, 2)}`}</p>{!loading && <Delta current={metrics.todayCosts} previous={metrics.yesterdayCosts} upIsGood={false} label="vs ontem" />}{!loading && <p className="mt-1 text-xs text-[#98A5A2]">7 dias: MZN {number(metrics.weekCosts, 2)}</p>}</article>
        </section>

        <section className="grid gap-4 xl:grid-cols-2"><article className={cardBase}><div className="mb-4"><h2 className="font-bold">Produção de ovos</h2><p className="mt-1 text-xs text-[#7D8987]">Registos dos últimos sete dias</p></div>{charts.every((item) => !item.ovos) ? <div className="flex h-56 items-center justify-center rounded-lg bg-[#F7F9F8] text-sm text-[#7D8987]">Ainda não há dados de postura neste período.</div> : <ResponsiveContainer width="100%" height={240}><LineChart data={charts} margin={{ left: -18, right: 8, top: 8 }}><CartesianGrid stroke="#E8EEEC" vertical={false} /><XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip /><Line type="monotone" dataKey="ovos" name="Ovos" stroke="var(--primary)" strokeWidth={3} dot={{ r: 3 }} /></LineChart></ResponsiveContainer>}</article>
          <article className={cardBase}><div className="mb-4"><h2 className="font-bold">Consumo de ração</h2><p className="mt-1 text-xs text-[#7D8987]">Consumo diário em kg · últimos sete dias</p></div>{charts.every((item) => !item['ração']) ? <div className="flex h-56 items-center justify-center rounded-lg bg-[#F7F9F8] text-sm text-[#7D8987]">Ainda não há dados de consumo neste período.</div> : <ResponsiveContainer width="100%" height={240}><BarChart data={charts} margin={{ left: -18, right: 8, top: 8 }}><CartesianGrid stroke="#E8EEEC" vertical={false} /><XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip /><Bar dataKey="ração" name="Ração (kg)" fill="var(--chart-2)" radius={[5,5,0,0]} /></BarChart></ResponsiveContainer>}</article></section>
        <section><div className="mb-3 flex items-center gap-2"><Activity className="h-4 w-4 text-brand-ink" /><h2 className="font-bold">Acesso rápido</h2></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{quickLinks.map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} className="group flex items-center gap-3 rounded-2xl border border-[#EFEFEF] bg-white p-4 shadow-sm transition hover:border-primary/40 hover:shadow-md"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-tint text-brand-ink"><Icon className="h-5 w-5" /></span><span className="text-sm font-semibold text-[#515062]">{item.name}</span><span className="ml-auto text-[#7D8B89] transition group-hover:translate-x-1">→</span></Link>})}</div></section>
        <section><div className="mb-3 flex items-center gap-2"><Truck className="h-4 w-4 text-brand-ink" /><h2 className="font-bold">Frota e telemetria</h2></div><WialonMapPanel /></section>
      </div></main>
    </div>
  </div>
}