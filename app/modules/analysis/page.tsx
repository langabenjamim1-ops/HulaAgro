import { BarChart3, Dna, GitCompareArrows, Wheat } from 'lucide-react'
import { ModuleLanding, type ModuleLandingItem } from '@/components/modules/module-landing'

const items: ModuleLandingItem[] = [
  { title: 'Comparar lotes', description: 'Compare crescimento, mortalidade e produção entre lotes.', href: '/modules/analysis/batch-comparison', icon: <GitCompareArrows className="h-5 w-5" /> },
  { title: 'Comparar rações', description: 'Analise consumo e desempenho por tipo de ração.', href: '/modules/analysis/feed-comparison', icon: <Wheat className="h-5 w-5" /> },
  { title: 'Comparar genéticas', description: 'Avalie resultados por linhagem genética.', href: '/modules/analysis/genetics-comparison', icon: <Dna className="h-5 w-5" /> },
  { title: 'KPIs zootécnicos', description: 'Acompanhe os principais indicadores da exploração.', href: '/modules/analysis/kpis', icon: <BarChart3 className="h-5 w-5" /> },
]

export default function AnalysisPage() {
  return <ModuleLanding eyebrow="Desempenho da exploração" title="Análises e comparações" description="Transforme os registos de produção em comparações claras para apoiar as decisões de manejo." icon={<BarChart3 className="h-6 w-6" />} items={items} />
}
