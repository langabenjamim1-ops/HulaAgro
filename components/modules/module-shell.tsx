'use client'

import { ReactNode, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ChevronRight, Menu, X } from 'lucide-react'
import Sidebar from '@/components/sidebar/sidebar'
import { ModuleInsights } from '@/components/modules/module-insights'

const routeLabels: Record<string, string> = {
  batches: 'Lotes', production: 'Produção', 'production-analysis': 'Análise da produção', analysis: 'Análises',
  health: 'Sanidade', environment: 'Ambiência', alerts: 'Alertas', hr: 'Recursos humanos', purchases: 'Compras',
  costs: 'Custos', nutrition: 'Nutrição', 'daily-management': 'Manejo diário', configuration: 'Configurações',
  'ai-predictions': 'Previsões com IA', wialon: 'Frota Wialon', supplies: 'Abastecimentos',
}

export function ModuleShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const pathParts = pathname.split('/').filter(Boolean).slice(1)
  const breadcrumbs = pathParts.map((part) => routeLabels[part] || part.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()))

  return <div className="fixed inset-0 flex min-h-0 bg-[#F6F7F3] font-montserrat text-[#283106]">
    <div className="hidden h-full lg:block"><Sidebar /></div>
    {mobileOpen && <div className="fixed inset-0 z-50 flex lg:hidden"><button aria-label="Fechar navegação" className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} /><div className="relative h-full"><button onClick={() => setMobileOpen(false)} aria-label="Fechar menu" className="absolute right-2 top-2 z-10 rounded bg-[#3D4A2C] p-2 text-white"><X className="h-4 w-4" /></button><Sidebar /></div></div>}
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-[#E4E7DC] bg-white/95 px-4 shadow-sm backdrop-blur sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3"><button className="rounded-lg p-2 hover:bg-[#F1F3EB] lg:hidden" aria-label="Abrir navegação" onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></button><div className="flex min-w-0 items-center gap-2 text-sm"><span className="shrink-0 font-bold tracking-tight">HULA Agro</span><ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#A2A78D]" /><span className="truncate text-[#68734C]">{breadcrumbs.join(' / ') || 'Gestão integrada'}</span></div></div>
        <div className="hidden items-center gap-3 sm:flex"><span className="text-xs text-[#7A8067]">{new Intl.DateTimeFormat('pt-MZ', { weekday: 'short', day: '2-digit', month: 'short' }).format(new Date())}</span><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E9EEDC] text-sm font-bold text-[#53602E]">H</span></div>
      </header>
      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8"><div className="mx-auto w-full max-w-[1680px]"><div className="module-route-content min-w-0">{children}</div><ModuleInsights /></div></main>
    </div>
  </div>
}
