import { Activity, Bird, ChartNoAxesCombined, Egg, Layers3 } from 'lucide-react'
import { ModuleLanding, type ModuleLandingItem } from '@/components/modules/module-landing'

const items: ModuleLandingItem[] = [
  { title: 'Poedeiras', description: 'Registe ovos, taxa de postura e mortalidade diária.', href: '/modules/production/layers', icon: <Egg className="h-5 w-5" /> },
  { title: 'Frangos de corte', description: 'Acompanhe peso médio e consumo de ração.', href: '/modules/production/broilers', icon: <Bird className="h-5 w-5" /> },
  { title: 'Bandos', description: 'Consulte os bandos e o respetivo ciclo produtivo.', href: '/modules/production/flocks', icon: <Layers3 className="h-5 w-5" /> },
  { title: 'Classificação', description: 'Registe e consulte as classes de ovos e aves.', href: '/modules/production/classification', icon: <Activity className="h-5 w-5" /> },
  { title: 'Taxa de postura', description: 'Veja a evolução da postura ao longo do tempo.', href: '/modules/production/laying-rate', icon: <ChartNoAxesCombined className="h-5 w-5" /> },
]

export default function ProductionPage() {
  return <ModuleLanding eyebrow="Produção avícola" title="Produção" description="Registe os resultados diários e acompanhe o desempenho dos lotes de postura e de corte." icon={<Activity className="h-6 w-6" />} items={items} primaryAction={{ label: 'Registar postura', href: '/modules/production/layers' }} />
}
