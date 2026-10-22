'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Activity, AlertTriangle, Bird, Boxes, ChartNoAxesCombined, ClipboardList, Egg, Menu, Settings, Stethoscope, Truck, Wallet, X } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Sidebar from '@/components/sidebar/sidebar'
import WialonMapPanel from '@/components/wialon/wialon-map-panel'
import { getClientJson } from '@/lib/client-data'

type Row = Record<string, unknown>
const localDate = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const numeric = (value: unknown) => Number(value) || 0

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

export default function DashboardClient() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [data, setData] = useState<{ batches: Row[]; production: Row[]; daily: Row[]; costs: Row[]; nutrition: Row[] }>({ batches: [], production: [], daily: [], costs: [], nutrition: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const from = localDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000))
    getClientJson<Partial<typeof data>>(`/api/dashboard/summary?from=${from}`)
      .then((summary) => setData({
        batches: Array.isArray(summary.batches) ? summary.batches : [], production: Array.isArray(summary.production) ? summary.production : [],
        daily: Array.isArray(summary.daily) ? summary.daily : [], costs: Array.isArray(summary.costs) ? summary.costs : [], nutrition: Array.isArray(summary.nutrition) ? summary.nutrition : [],
      }))
      .catch((error) => console.error('Falha ao carregar o resumo do painel:', error))
      .finally(() => setLoading(false))
  }, [])

  const metrics = useMemo(() => {
    const today = localDate()
    const todaysProduction = data.production.filter((row) => String(row.record_date || '') === today)
    const todaysDaily = data.daily.filter((row) => String(row.record_date || '') === today)
    const todaysCosts = data.costs.filter((row) => String(row.record_date || '') === today)
    return {
      activeBirds: data.batches.filter((row) => row.status === 'active').reduce((sum, row) => sum + numeric(row.birds_count), 0),
      eggs: todaysProduction.reduce((sum, row) => sum + numeric(row.eggs_produced), 0),
      mortality: [...todaysProduction, ...todaysDaily].reduce((sum, row) => sum + numeric(row.mortality_count), 0),
      costs: todaysCosts.reduce((sum, row) => sum + numeric(row.amount), 0),
    }
  }, [data])

  const charts = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - (6 - index)); return localDate(date) })
    return days.map((date) => ({
      day: new Date(`${date}T12:00:00`).toLocaleDateString('pt-MZ', { weekday: 'short', day: '2-digit' }),
      ovos: data.production.filter((row) => String(row.record_date || '') === date).reduce((sum, row) => sum + numeric(row.eggs_produced), 0),
      ração: data.nutrition.filter((row) => String(row.record_date || '') === date).reduce((sum, row) => sum + numeric(row.consumption_kg), 0),
    }))
  }, [data])

  const cards = [
    { label: 'Aves alojadas em lotes ativos', value: metrics.activeBirds.toLocaleString('pt-MZ'), icon: Bird, tone: 'bg-[#E3F4F0] text-[#269B86]' },
    { label: 'Ovos registados hoje', value: metrics.eggs.toLocaleString('pt-MZ'), icon: Egg, tone: 'bg-[#E7F3F0] text-[#269B86]' },
    { label: 'Mortalidade registada hoje', value: metrics.mortality.toLocaleString('pt-MZ'), icon: AlertTriangle, tone: 'bg-[#FCEBEC] text-[#D96970]' },
    { label: 'Custos registados hoje', value: `MZN ${metrics.costs.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}`, icon: Wallet, tone: 'bg-[#ECEBF0] text-[#555461]' },
  ]

  return <div className="fixed inset-0 flex bg-[#F7F8F7] font-montserrat text-[#41414D]">
    <div className="hidden h-full lg:block"><Sidebar /></div>
    {mobileOpen && <div className="fixed inset-0 z-50 flex lg:hidden"><button aria-label="Fechar navegação" className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} /><div className="relative h-full"><button onClick={() => setMobileOpen(false)} aria-label="Fechar menu" className="absolute right-2 top-2 z-10 rounded bg-[#3D4A2C] p-2 text-white"><X className="h-4 w-4" /></button><Sidebar /></div></div>}
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#E4E7DC] bg-white px-4 shadow-sm sm:px-6 lg:px-8"><div className="flex items-center gap-3"><button className="rounded-lg p-2 hover:bg-[#F1F3EB] lg:hidden" aria-label="Abrir navegação" onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></button><span className="text-sm font-bold">HULA Agro</span><span className="text-sm text-[#9AA087]">/</span><span className="text-sm text-[#68734C]">Painel de gestão</span></div><Link href="/modules/configuration" className="rounded-lg p-2 text-[#68734C] hover:bg-[#F1F3EB]" aria-label="Configurações"><Settings className="h-5 w-5" /></Link></header>
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8"><div className="mx-auto max-w-[1680px] space-y-6">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2E9F8B]">{new Intl.DateTimeFormat('pt-MZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}</p><h1 className="mt-2 text-2xl font-bold tracking-tight text-[#41414D] sm:text-3xl">Resumo da exploração</h1><p className="mt-2 text-sm text-[#7D8987]">Indicadores calculados a partir dos registos do sistema.</p></div><Link href="/modules/batches/create" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2EAD96] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#269B86]">+ Novo lote</Link></section>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => { const Icon = card.icon; return <article key={card.label} className="rounded-xl border border-[#E2E8E6] bg-white p-5 shadow-[0_2px_12px_rgba(65,65,77,0.04)]"><div className="flex items-start justify-between"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.tone}`}><Icon className="h-5 w-5" /></div>{loading && <span className="text-xs text-[#98A5A2]">A carregar</span>}</div><p className="mt-4 text-xs font-medium text-[#7D8987]">{card.label}</p><p className="mt-1 text-2xl font-bold tracking-tight text-[#41414D]">{loading ? '—' : card.value}</p></article>})}</section>
        <section className="grid gap-4 xl:grid-cols-2"><article className="rounded-xl border border-[#E2E8E6] bg-white p-5 shadow-[0_2px_12px_rgba(65,65,77,0.04)]"><div className="mb-4"><h2 className="font-bold">Produção de ovos</h2><p className="mt-1 text-xs text-[#7D8987]">Registos dos últimos sete dias</p></div>{charts.every((item) => !item.ovos) ? <div className="flex h-56 items-center justify-center rounded-lg bg-[#F7F9F8] text-sm text-[#7D8987]">Ainda não há dados de postura neste período.</div> : <ResponsiveContainer width="100%" height={240}><LineChart data={charts} margin={{ left: -18, right: 8, top: 8 }}><CartesianGrid stroke="#E8EEEC" vertical={false} /><XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip /><Line type="monotone" dataKey="ovos" name="Ovos" stroke="#2EAD96" strokeWidth={3} dot={{ r: 3 }} /></LineChart></ResponsiveContainer>}</article>
          <article className="rounded-xl border border-[#E2E8E6] bg-white p-5 shadow-[0_2px_12px_rgba(65,65,77,0.04)]"><div className="mb-4"><h2 className="font-bold">Consumo de ração</h2><p className="mt-1 text-xs text-[#7D8987]">Consumo diário em kg · últimos sete dias</p></div>{charts.every((item) => !item['ração']) ? <div className="flex h-56 items-center justify-center rounded-lg bg-[#F7F9F8] text-sm text-[#7D8987]">Ainda não há dados de consumo neste período.</div> : <ResponsiveContainer width="100%" height={240}><BarChart data={charts} margin={{ left: -18, right: 8, top: 8 }}><CartesianGrid stroke="#E8EEEC" vertical={false} /><XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip /><Bar dataKey="ração" name="Ração (kg)" fill="#9AABA9" radius={[5,5,0,0]} /></BarChart></ResponsiveContainer>}</article></section>
        <section><div className="mb-3 flex items-center gap-2"><Activity className="h-4 w-4 text-[#687B2A]" /><h2 className="font-bold">Acesso rápido</h2></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{quickLinks.map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} className="group flex items-center gap-3 rounded-xl border border-[#E2E5D9] bg-white p-4 shadow-sm transition hover:border-[#A6B27D] hover:shadow-md"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EEF3DE] text-[#54652D]"><Icon className="h-5 w-5" /></span><span className="text-sm font-semibold text-[#343B22]">{item.name}</span><span className="ml-auto text-[#8E9873] transition group-hover:translate-x-1">→</span></Link>})}</div></section>
        <section><div className="mb-3 flex items-center gap-2"><Truck className="h-4 w-4 text-[#687B2A]" /><h2 className="font-bold">Frota e telemetria</h2></div><WialonMapPanel /></section>
      </div></main>
    </div>
  </div>
}
