"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ClipboardList,
  Sprout,
  Thermometer,
  ShoppingCart,
  Truck,
  Bell,
  Sparkles,
  Stethoscope,
  ChevronsLeft,
  ChevronsRight,
  Menu,
  X,
  LogOut,
  Leaf,
  type LucideIcon,
} from "lucide-react"

/* ------------------------------------------------------------------ */
/* Navegação — ajuste os hrefs para as rotas reais em app/modules/*    */
/* ------------------------------------------------------------------ */

type NavItem = { label: string; href: string; icon: LucideIcon; badge?: string }
type NavGroup = { title: string; items: NavItem[] }

const NAV: NavGroup[] = [
  {
    title: "Geral",
    items: [{ label: "Painel", href: "/", icon: LayoutDashboard }],
  },
  {
    title: "Operações",
    items: [
      { label: "Gestão diária", href: "/modules/daily-management", icon: ClipboardList },
      { label: "Produção", href: "/modules/production", icon: Sprout },
      { label: "Ambiente", href: "/modules/environmental-monitoring", icon: Thermometer },
      { label: "Compras e insumos", href: "/modules/supplies", icon: ShoppingCart },
      { label: "Frota", href: "/modules/fleet", icon: Truck },
    ],
  },
  {
    title: "Inteligência",
    items: [
      { label: "Alertas", href: "/modules/alerts", icon: Bell },
      { label: "Previsões IA", href: "/modules/ai-predictions", icon: Sparkles, badge: "IA" },
      { label: "Doenças", href: "/modules/disease", icon: Stethoscope },
    ],
  },
]

const STORAGE_KEY = "hulaagro:sidebar-collapsed"

/* ------------------------------------------------------------------ */
/* Sidebar                                                             */
/* ------------------------------------------------------------------ */

function SidebarContent({
  collapsed,
  onToggle,
  onNavigate,
  showToggle,
}: {
  collapsed: boolean
  onToggle?: () => void
  onNavigate?: () => void
  showToggle: boolean
}) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/")

  return (
    <div className="flex h-full flex-col bg-slate-950 text-slate-300">
      {/* Marca */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/5 px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
          <Leaf className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-white">HULA AGRO</p>
            <p className="truncate text-[11px] text-slate-500">Gestão avícola</p>
          </div>
        )}
      </div>

      {/* Itens */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5" aria-label="Navegação principal">
        {NAV.map((group) => (
          <div key={group.title}>
            {!collapsed ? (
              <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                {group.title}
              </p>
            ) : (
              <div className="mx-3 mb-2 h-px bg-white/5" />
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.href)
                const Icon = item.icon
                return (
                  <li key={item.href} className="group/item relative">
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={[
                        "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        collapsed ? "justify-center" : "",
                        active
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "text-slate-400 hover:bg-white/5 hover:text-white",
                      ].join(" ")}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-emerald-400" />
                      )}
                      <Icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                      {!collapsed && item.badge && (
                        <span className="ml-auto rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                          {item.badge}
                        </span>
                      )}
                    </Link>

                    {/* Tooltip quando recolhido */}
                    {collapsed && (
                      <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover/item:opacity-100">
                        {item.label}
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Rodapé: utilizador + recolher */}
      <div className="shrink-0 space-y-2 border-t border-white/5 p-3">
        <div className={["flex items-center gap-3 rounded-lg p-2", collapsed ? "justify-center" : ""].join(" ")}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-white">
            FU
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-medium text-white">Farm user</p>
                <p className="truncate text-[11px] text-slate-500">Administrador</p>
              </div>
              <button
                type="button"
                aria-label="Terminar sessão"
                className="rounded-md p-1.5 text-slate-500 hover:bg-white/5 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-white/5 hover:text-white"
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            {!collapsed && "Recolher"}
          </button>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Shell: sidebar fixa no desktop, gaveta no telemóvel                 */
/* ------------------------------------------------------------------ */

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "1")
    } catch {}
  }, [])

  const toggle = () =>
    setCollapsed((c) => {
      const next = !c
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0")
      } catch {}
      return next
    })

  useEffect(() => setMobileOpen(false), [pathname])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 lg:flex-row">
      {/* Desktop */}
      <aside
        className={[
          "hidden shrink-0 transition-[width] duration-200 lg:block",
          collapsed ? "w-[72px]" : "w-64",
        ].join(" ")}
      >
        <SidebarContent collapsed={collapsed} onToggle={toggle} showToggle />
      </aside>

      {/* Mobile: barra superior + gaveta */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-white px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menu"
          className="rounded-md p-2 text-slate-700 hover:bg-slate-100"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold text-slate-900">HULA AGRO</span>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Fechar menu"
              className="absolute right-3 top-4 z-10 rounded-md p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent collapsed={false} showToggle={false} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Conteúdo com scroll próprio (o body tem overflow-hidden) */}
      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}