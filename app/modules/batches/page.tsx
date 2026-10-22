'use client'

import Link from 'next/link'
import { ArrowRight, Bird, Building2, Dna, List, Plus } from 'lucide-react'

const sections = [
  { title: 'Criar lote', description: 'Registe aves recebidas, tipo, origem e data de entrada.', href: '/modules/batches/create', icon: Plus, color: 'bg-[#EEF3DE] text-[#54652D]', action: 'Registar lote' },
  { title: 'Lista de lotes', description: 'Pesquise, filtre e acompanhe os lotes ativos e concluídos.', href: '/modules/batches/list', icon: List, color: 'bg-[#E9F1EC] text-[#3F7054]', action: 'Ver lotes' },
  { title: 'Galpões', description: 'Consulte instalações e capacidade de alojamento.', href: '/modules/batches/facilities', icon: Building2, color: 'bg-[#F5EEDF] text-[#916F2A]', action: 'Gerir galpões' },
  { title: 'Genética dos lotes', description: 'Associe uma linhagem genética a cada lote.', href: '/modules/batches/genetics', icon: Dna, color: 'bg-[#F2EAF4] text-[#80588D]', action: 'Associar genética' },
]

export default function BatchesPage() {
  return <div className="space-y-7">
    <section className="flex flex-col justify-between gap-5 rounded-2xl bg-[#283106] p-6 text-white shadow-sm sm:flex-row sm:items-center sm:p-8">
      <div className="max-w-2xl"><div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10"><Bird className="h-6 w-6" /></div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#D1D8BD]">Produção · Gestão</p><h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Gestão de lotes</h1><p className="mt-2 text-sm leading-6 text-[#E0E4D5]">Acompanhe o ciclo dos lotes, desde a entrada das aves até ao encerramento, com acesso rápido a cada tarefa.</p></div>
      <div className="flex shrink-0 flex-wrap gap-3"><Link href="/modules/batches/list" className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"><List className="h-4 w-4" />Ver lotes</Link><Link href="/modules/batches/create" className="inline-flex items-center gap-2 rounded-lg bg-[#D7E6A3] px-4 py-2.5 text-sm font-bold text-[#283106] transition hover:bg-white"><Plus className="h-4 w-4" />Novo lote</Link></div>
    </section>
    <section><div className="mb-4"><h2 className="text-lg font-bold tracking-tight text-[#283106]">Ações de gestão</h2><p className="mt-1 text-sm text-[#737A62]">Escolha uma tarefa para continuar.</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{sections.map((section) => { const Icon = section.icon; return <Link key={section.href} href={section.href} className="group rounded-xl border border-[#E2E5D9] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#A6B27D] hover:shadow-md"><div className={`flex h-11 w-11 items-center justify-center rounded-xl ${section.color}`}><Icon className="h-5 w-5" /></div><h3 className="mt-4 font-bold text-[#283106]">{section.title}</h3><p className="mt-2 min-h-[3rem] text-sm leading-5 text-[#727964]">{section.description}</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#5B6B31]">{section.action}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span></Link>})}</div></section>
  </div>
}
