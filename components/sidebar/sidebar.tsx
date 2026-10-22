'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ChevronDown, ChevronRight, BarChart3, Bird, Heart, Briefcase, Settings, Truck, Package, Activity, ClipboardList, Stethoscope, SlidersHorizontal, Brain, Wallet, Boxes, Camera, Building2, Store } from 'lucide-react'

const menuItems = [
  { id: 'producao', label: 'PRODUÇÃO', icon: Bird, items: [
    { name: 'Gestão de Lotes', href: '/modules/batches', icon: Bird, children: [['Criar lote','/modules/batches/create'],['Lista de lotes','/modules/batches/list'],['Galpões','/modules/batches/facilities'],['Genética dos lotes','/modules/batches/genetics']] },
    { name: 'Produção', href: '/modules/production', icon: Activity, children: [['Frangos de corte','/modules/production/broilers'],['Poedeiras','/modules/production/layers'],['Bandos','/modules/production/flocks'],['Classificação','/modules/production/classification'],['Taxa de postura','/modules/production/laying-rate']] },
    { name: 'Análise da produção', href: '/modules/production-analysis/overview', icon: BarChart3, children: [['Visão geral','/modules/production-analysis/overview'],['Consumo de ração','/modules/production-analysis/feed-consumption'],['Relatórios','/modules/production-analysis/reports']] },
    { name: 'Análises e comparações', href: '/modules/analysis', icon: BarChart3, children: [['Lote vs lote','/modules/analysis/batch-comparison'],['Ração A vs B','/modules/analysis/feed-comparison'],['Genética A vs B','/modules/analysis/genetics-comparison'],['KPIs zootécnicos','/modules/analysis/kpis']] },
  ] },
  { id: 'saude', label: 'SAÚDE E BEM-ESTAR', icon: Heart, items: [
    { name: 'Sanidade', href: '/modules/health', icon: Stethoscope, children: [['Registos de saúde','/modules/health/records'],['Doenças','/modules/health/diseases'],['Medicamentos','/modules/health/medicines'],['Vacinação','/modules/health/vaccination'],['Quarentena','/modules/health/quarantine']] },
    { name: 'Ambiência', href: '/modules/environment', icon: Activity, children: [['Sensores Wialon','/modules/environment/wialon'],['Temperatura','/modules/environment/temperature'],['Humidade','/modules/environment/humidity'],['Ventilação','/modules/environment/ventilation'],['Energia','/modules/environment/energy']] },
    { name: 'Alertas', href: '/modules/alerts', icon: Heart, children: [['Desvios técnicos','/modules/alerts/deviations'],['Sugestões','/modules/alerts/suggestions'],['Histórico de decisões','/modules/alerts/decisions'],['Alertas críticos','/modules/alerts/critical']] },
    { name: 'Deteção de doenças', href: '/modules/disease-detection', icon: Stethoscope },
    { name: 'Câmaras OSIRIS (teste)', href: '/modules/osiris-cameras', icon: Camera },
  ] },
  { id: 'administrativo', label: 'ADMINISTRAÇÃO', icon: Briefcase, items: [
    { name: 'Recursos Humanos', href: '/modules/hr', icon: Briefcase, children: [['Funcionários','/modules/hr/employees'],['Lista de funcionários','/modules/hr/employees/list'],['Utilizadores','/modules/hr/users'],['Folha salarial','/modules/hr/payroll'],['Férias','/modules/hr/vacation'],['Contratos','/modules/hr/contracts'],['Avaliações','/modules/hr/evaluations'],['Banco de horas','/modules/hr/time-bank']] },
    { name: 'Compras', href: '/modules/purchases', icon: Package, children: [['Gestão de compras','/modules/purchases/management'],['Produtos','/modules/purchases/products'],['Fornecedores','/modules/purchases/suppliers'],['Categorias','/modules/purchases/categories'],['Marcas','/modules/purchases/brands'],['Custos de embalagem','/modules/purchases/packaging-costs']] },
    { name: 'Custos', href: '/modules/costs', icon: Wallet, children: [['Ração','/modules/costs/feed'],['Saúde','/modules/costs/health'],['Perdas','/modules/costs/losses'],['Operacionais','/modules/costs/operational']] },
    { name: 'Crédito e cobranças', href: '/modules/credit-alerts', icon: Wallet },
    { name: 'Abastecimentos', href: '/modules/supplies', icon: Boxes },
  ] },
  { id: 'operacoes', label: 'OPERAÇÕES', icon: ClipboardList, items: [
    { name: 'Manejo diário', href: '/modules/daily-management', icon: ClipboardList, children: [['Registos diários','/modules/daily-management/records'],['Mortalidade','/modules/daily-management/mortality'],['Peso','/modules/daily-management/weight'],['Água','/modules/daily-management/water']] },
    { name: 'Ração e nutrição', href: '/modules/nutrition', icon: Package, children: [['Fases','/modules/nutrition/phases'],['Consumo','/modules/nutrition/consumption'],['Custos','/modules/nutrition/costs'],['Silos','/modules/nutrition/silos']] },
  ] },
  { id: 'sistema', label: 'SISTEMA', icon: Settings, items: [
    { name: 'Configurações', href: '/modules/configuration', icon: SlidersHorizontal, children: [['Parâmetros','/modules/configuration/parameters'],['Tipos de produção','/modules/configuration/types'],['Genéticas','/modules/configuration/genetics'],['Rações','/modules/configuration/feed']] },
    { name: 'Gestão de clientes', href: '/modules/configuration/customers', icon: Building2 },
    { name: 'Previsões com IA', href: '/modules/ai-predictions', icon: Brain },
  ] },
  { id: 'frota', label: 'FROTA WIALON', icon: Truck, items: [
    { name: 'Gestão da frota', href: '/modules/wialon', icon: Truck },
  ] },
  { id: 'mercado', label: 'MARKETPLACE', icon: Store, items: [
    { name: 'Comprar e vender', href: '/modules/marketplace', icon: Store },
  ] },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<string[]>(['producao','saude','administrativo','operacoes','sistema','frota'])
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const toggle = (value: string, setter: (updater: (previous: string[]) => string[]) => void) => setter((previous) => previous.includes(value) ? previous.filter((item) => item !== value) : [...previous, value])
  const isActive = (href: string) => pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`))

  return <aside className="flex h-full w-72 shrink-0 flex-col overflow-hidden border-r border-[#3D4A2C] bg-[#283106] font-montserrat text-white">
    <div className="border-b border-[#3D4A2C] p-5"><Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80"><Image src="/logo-hula-agro.png" alt="HULA Agro" width={40} height={40} className="h-10 w-10" /><div><h1 className="text-base font-bold">HULA Agro</h1><p className="text-xs text-[#D1D8BD]">Gestão Integrada</p></div></Link></div>
    <Link href="/dashboard" className={`flex items-center gap-3 border-l-4 px-5 py-3 text-sm font-medium ${pathname === '/dashboard' ? 'border-[#D1D8BD] text-white' : 'border-transparent text-[#C7C2AB] hover:text-white'}`}><BarChart3 className="h-5 w-5" />Dashboard</Link>
    <nav className="flex-1 overflow-y-auto py-2">
      {menuItems.map((section) => { const SectionIcon = section.icon; return <section key={section.id}>
        <button onClick={() => toggle(section.id, setExpandedSections)} className="flex w-full items-center justify-between gap-2 px-5 py-2.5 text-left text-xs font-bold tracking-wide text-white hover:bg-[#3D4A2C]"><span className="flex items-center gap-2"><SectionIcon className="h-4 w-4" />{section.label}</span>{expandedSections.includes(section.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</button>
        {expandedSections.includes(section.id) && <div className="pb-1">{section.items.map((item) => { const ItemIcon = item.icon; const open = expandedItems.includes(item.href) || isActive(item.href) || item.children?.some(([,href]) => pathname === href); return <div key={item.href}>
          <div className={`group flex items-center border-l-2 ${isActive(item.href) ? 'border-[#D1D8BD] bg-[#3D4A2C]' : 'border-transparent'}`}>
            <Link href={item.href} className="flex min-w-0 flex-1 items-center gap-2.5 py-2 pl-8 pr-2 text-[13px] text-[#E1E3D8] hover:text-white"><ItemIcon className="h-4 w-4 shrink-0" /><span className="truncate">{item.name}</span></Link>
            {item.children && <button aria-label={`${open ? 'Fechar' : 'Abrir'} ${item.name}`} onClick={() => toggle(item.href, setExpandedItems)} className="px-3 py-2 text-[#C7C2AB] hover:text-white">{open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}</button>}
          </div>
          {item.children && open && <div className="pb-1">{item.children.map(([label,href]) => <Link key={href} href={href} className={`block border-l-2 py-1.5 pl-[3.15rem] pr-3 text-xs ${pathname === href ? 'border-[#D1D8BD] text-white' : 'border-transparent text-[#C7C2AB] hover:text-white'}`}>{label}</Link>)}</div>}
        </div>})}</div>}
      </section>})}
    </nav>
  </aside>
}
