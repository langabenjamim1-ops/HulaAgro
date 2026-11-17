'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity,
  Bell,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  Egg,
  Fuel,
  Layers,
  LayoutDashboard,
  Settings,
  ShoppingCart,
  Sparkles,
  Stethoscope,
  Store,
  Thermometer,
  TrendingUp,
  Truck,
  Users,
  Wallet,
  Wheat,
  type LucideIcon,
} from 'lucide-react'

type NavItem = { label: string; href: string; icon: LucideIcon; badge?: string; match?: string }
type NavGroup = { title: string; items: NavItem[] }

// Rotas baseadas nas pastas de app/modules/*
const NAV: NavGroup[] = [
  {
    title: 'Geral',
    items: [{ label: 'Painel', href: '/dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'Produção',
    items: [
      { label: 'Lotes', href: '/modules/batches', icon: Layers },
      { label: 'Produção', href: '/modules/production', icon: Egg },
      { label: 'Análise da produção', href: '/modules/production-analysis/overview', match: '/modules/production-analysis', icon: TrendingUp },
      { label: 'Manejo diário', href: '/modules/daily-management/records', match: '/modules/daily-management', icon: ClipboardList },
      { label: 'Nutrição', href: '/modules/nutrition', icon: Wheat },
    ],
  },
  {
    title: 'Sanidade e ambiente',
    items: [
      { label: 'Sanidade', href: '/modules/health', icon: Stethoscope },
      { label: 'Ambiência', href: '/modules/environment', icon: Thermometer },
      { label: 'Alertas', href: '/modules/alerts', icon: Bell },
    ],
  },
  {
    title: 'Gestão',
    items: [
      { label: 'Custos', href: '/modules/costs', icon: Wallet },
      { label: 'Compras', href: '/modules/purchases', icon: ShoppingCart },
      { label: 'Abastecimentos', href: '/modules/supplies', icon: Fuel },
      { label: 'Recursos humanos', href: '/modules/hr', icon: Users },
      { label: 'Frota Wialon', href: '/modules/wialon', icon: Truck },
    ],
  },
  {
    title: 'Inteligência',
    items: [
      { label: 'Análises', href: '/modules/analysis', icon: Activity },
      { label: 'Previsões com IA', href: '/modules/ai-predictions', icon: Sparkles, badge: 'IA' },
    ],
  },
  {
    title: 'Marketplace',
    items: [{ label: 'Comprar e vender', href: '/modules/marketplace', icon: Store }],
  },
]

const SETTINGS: NavItem = { label: 'Configurações', href: '/modules/configuration', icon: Settings }
const STORAGE_KEY = 'hulaagro:sidebar-collapsed'

/*
 * Paleta (a mesma do ModuleShell):
 *  fundo        #3D4A2C   texto/ícones  #E9EEDC   texto suave #A2A78D
 *  item ativo   #53602E   realce        #F1F3EB   bordas      white/10
 */

// Scrollbar transparente: invisível em repouso, fina e discreta ao passar o rato.
const SCROLLBAR = [
  '[scrollbar-width:thin]',
  '[scrollbar-color:transparent_transparent]',
  'hover:[scrollbar-color:rgba(233,238,220,0.3)_transparent]',
  '[&::-webkit-scrollbar]:w-1.5',
  '[&::-webkit-scrollbar-track]:bg-transparent',
  '[&::-webkit-scrollbar-thumb]:rounded-full',
  '[&::-webkit-scrollbar-thumb]:bg-transparent',
  'hover:[&::-webkit-scrollbar-thumb]:bg-[#E9EEDC]/30',
].join(' ')

type SidebarProps = {
  /** Desktop: permite recolher para só ícones. Na gaveta móvel passe false. */
  collapsible?: boolean
  /** Chamado ao clicar num link (usado para fechar a gaveta móvel). */
  onNavigate?: () => void
}

export default function Sidebar({ collapsible = true, onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const [collapsedState, setCollapsedState] = useState(false)
  const collapsed = collapsible && collapsedState

  useEffect(() => {
    try {
      setCollapsedState(localStorage.getItem(STORAGE_KEY) === '1')
    } catch {}
  }, [])

  const toggle = () =>
    setCollapsedState((current) => {
      const next = !current
      try {
        localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
      } catch {}
      return next
    })

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')

  const renderItem = (item: NavItem) => {
    const active = isActive(item.match ?? item.href)
    const Icon = item.icon
    return (
      <li key={item.href}>
        <Link
          href={item.href}
          onClick={onNavigate}
          title={collapsed ? item.label : undefined}
          aria-current={active ? 'page' : undefined}
          className={[
            'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            collapsed ? 'justify-center' : '',
            active ? 'bg-[#53602E] text-white shadow-sm' : 'text-[#E9EEDC]/80 hover:bg-white/10 hover:text-white',
          ].join(' ')}
        >
          {active && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[#F1F3EB]" />}
          <Icon className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="truncate">{item.label}</span>}
          {!collapsed && item.badge && (
            <span className="ml-auto rounded-md bg-[#E9EEDC]/20 px-1.5 py-0.5 text-[10px] font-semibold text-[#F1F3EB]">
              {item.badge}
            </span>
          )}
        </Link>
      </li>
    )
  }

  return (
    <aside
      className={[
        'flex h-full shrink-0 flex-col bg-[#3D4A2C] text-[#E9EEDC] transition-[width] duration-200',
        collapsed ? 'w-[72px]' : collapsible ? 'w-64' : 'w-72 max-w-[85vw]',
      ].join(' ')}
    >
      {/* Marca */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E9EEDC] text-[#3D4A2C]">
          <Egg className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-bold tracking-tight text-white">HULA AGRO</p>
            <p className="truncate text-[11px] text-[#A2A78D]">Gestão avícola</p>
          </div>
        )}
      </div>

      {/* Navegação (scrollbar transparente) */}
      <nav
        className={['flex-1 space-y-5 overflow-y-auto px-3 py-4', SCROLLBAR].join(' ')}
        aria-label="Navegação principal"
      >
        {NAV.map((group) => (
          <div key={group.title}>
            {!collapsed ? (
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#A2A78D]">
                {group.title}
              </p>
            ) : (
              <div className="mx-3 mb-2 h-px bg-white/10" />
            )}
            <ul className="space-y-0.5">{group.items.map(renderItem)}</ul>
          </div>
        ))}
      </nav>

      {/* Rodapé */}
      <div className="shrink-0 space-y-1 border-t border-white/10 p-3">
        <ul>{renderItem(SETTINGS)}</ul>
        {collapsible && (
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[#A2A78D] transition-colors hover:bg-white/10 hover:text-white"
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            {!collapsed && 'Recolher menu'}
          </button>
        )}
      </div>
    </aside>
  )
}