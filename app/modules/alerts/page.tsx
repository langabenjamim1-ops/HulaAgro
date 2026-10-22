import { AlertTriangle, BellRing, History, Lightbulb } from 'lucide-react'
import { ModuleLanding, type ModuleLandingItem } from '@/components/modules/module-landing'

const items: ModuleLandingItem[] = [
  { title: 'Alertas críticos', description: 'Reveja ocorrências que precisam de resposta imediata.', href: '/modules/alerts/critical', icon: <BellRing className="h-5 w-5" /> },
  { title: 'Desvios técnicos', description: 'Compare valores registados com as metas definidas.', href: '/modules/alerts/deviations', icon: <AlertTriangle className="h-5 w-5" /> },
  { title: 'Sugestões de ajuste', description: 'Consulte recomendações para melhorar os resultados.', href: '/modules/alerts/suggestions', icon: <Lightbulb className="h-5 w-5" /> },
  { title: 'Histórico de decisões', description: 'Acompanhe ações tomadas e os respetivos resultados.', href: '/modules/alerts/decisions', icon: <History className="h-5 w-5" /> },
]

export default function AlertsPage() {
  return <ModuleLanding eyebrow="Acompanhamento operacional" title="Alertas e decisões" description="Identifique desvios, priorize situações críticas e mantenha o histórico das ações tomadas." icon={<AlertTriangle className="h-6 w-6" />} items={items} primaryAction={{ label: 'Ver alertas críticos', href: '/modules/alerts/critical' }} />
}
