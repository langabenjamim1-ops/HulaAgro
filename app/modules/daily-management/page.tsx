import { ClipboardList, Droplets, Scale, Skull, CalendarDays } from 'lucide-react'
import { ModuleLanding, type ModuleLandingItem } from '@/components/modules/module-landing'

const items: ModuleLandingItem[] = [
  { title: 'Registos diários', description: 'Registe as tarefas e observações de cada dia.', href: '/modules/daily-management/records', icon: <ClipboardList className="h-5 w-5" /> },
  { title: 'Mortalidade', description: 'Acompanhe perdas e respetiva taxa por lote.', href: '/modules/daily-management/mortality', icon: <Skull className="h-5 w-5" /> },
  { title: 'Consumo de água', description: 'Registe e compare o consumo de água.', href: '/modules/daily-management/water', icon: <Droplets className="h-5 w-5" /> },
  { title: 'Peso médio', description: 'Acompanhe o peso e a uniformidade das aves.', href: '/modules/daily-management/weight', icon: <Scale className="h-5 w-5" /> },
]

export default function DailyManagementPage() {
  return <ModuleLanding eyebrow="Rotina da exploração" title="Manejo diário" description="Mantenha os registos operacionais atualizados para acompanhar a saúde, o consumo e a evolução de cada lote." icon={<CalendarDays className="h-6 w-6" />} items={items} primaryAction={{ label: 'Abrir registos diários', href: '/modules/daily-management/records' }} />
}
