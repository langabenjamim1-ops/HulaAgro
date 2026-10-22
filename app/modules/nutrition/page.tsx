import { BarChart3, Layers3, Package, Warehouse, Wheat } from 'lucide-react'
import { ModuleLanding, type ModuleLandingItem } from '@/components/modules/module-landing'

const items: ModuleLandingItem[] = [
  { title: 'Fases de criação', description: 'Organize as necessidades nutricionais por fase.', href: '/modules/nutrition/phases', icon: <Layers3 className="h-5 w-5" /> },
  { title: 'Consumo', description: 'Registe e compare consumo real por lote.', href: '/modules/nutrition/consumption', icon: <BarChart3 className="h-5 w-5" /> },
  { title: 'Custos de ração', description: 'Acompanhe custos e preços das rações.', href: '/modules/nutrition/costs', icon: <Package className="h-5 w-5" /> },
  { title: 'Silos', description: 'Consulte capacidade, conteúdo e reposição.', href: '/modules/nutrition/silos', icon: <Warehouse className="h-5 w-5" /> },
]

export default function NutritionPage() {
  return <ModuleLanding eyebrow="Alimentação animal" title="Ração e nutrição" description="Planeie a alimentação das aves e acompanhe consumo, fases nutricionais e abastecimento dos silos." icon={<Wheat className="h-6 w-6" />} items={items} primaryAction={{ label: 'Registar consumo', href: '/modules/nutrition/consumption' }} />
}
