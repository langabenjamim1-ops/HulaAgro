import Link from 'next/link'
import { ArrowRight, ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'

export interface ModuleLandingItem {
  title: string
  description: string
  href: string
  icon: ReactNode
}

interface ModuleLandingProps {
  eyebrow: string
  title: string
  description: string
  icon: ReactNode
  items: ModuleLandingItem[]
  primaryAction?: { label: string; href: string }
}

export function ModuleLanding({ eyebrow, title, description, icon, items, primaryAction }: ModuleLandingProps) {
  return (
    <div className="space-y-7 pb-8">
      <section className="flex flex-col justify-between gap-5 rounded-2xl bg-[#515062] p-6 text-white shadow-sm sm:flex-row sm:items-center sm:p-8">
        <div className="max-w-2xl">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">{icon}</div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#D5DEDC]">{eyebrow}</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-[#E2E8E6]">{description}</p>
        </div>
        {primaryAction && <Link href={primaryAction.href} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#CDEFE7] px-4 py-2.5 text-sm font-bold text-[#515062] transition hover:bg-white">{primaryAction.label}<ChevronRight className="h-4 w-4" /></Link>}
      </section>
      <section>
        <div className="mb-4"><h2 className="text-lg font-bold tracking-tight text-[#515062]">Áreas de trabalho</h2><p className="mt-1 text-sm text-[#2FB394]">Aceda às ferramentas e aos registos deste módulo.</p></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => <Link key={item.href} href={item.href} className="group rounded-xl border border-[#E2E8E6] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#7D8B89] hover:shadow-md"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E3F5F0] text-[#2FB394]">{item.icon}</div><h3 className="mt-4 font-bold text-[#515062]">{item.title}</h3><p className="mt-2 min-h-[2.5rem] text-sm leading-5 text-[#7D8B89]">{item.description}</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#2FB394]">Abrir área<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span></Link>)}
        </div>
      </section>
    </div>
  )
}
