import { Activity, Bug, ClipboardPlus, Syringe, Thermometer, Timer } from 'lucide-react'
import { ModuleLanding, type ModuleLandingItem } from '@/components/modules/module-landing'

const items: ModuleLandingItem[] = [
  { title: 'Registos de saúde', description: 'Acompanhe ocorrências, tratamentos e recuperação.', href: '/modules/health/records', icon: <ClipboardPlus className="h-5 w-5" /> },
  { title: 'Vacinação', description: 'Registe aplicações e consulte o histórico vacinal.', href: '/modules/health/vaccination', icon: <Syringe className="h-5 w-5" /> },
  { title: 'Doenças', description: 'Consulte doenças e mantenha medidas preventivas.', href: '/modules/health/diseases', icon: <Bug className="h-5 w-5" /> },
  { title: 'Medicamentos', description: 'Organize medicamentos, validade e stock.', href: '/modules/health/medicines', icon: <Thermometer className="h-5 w-5" /> },
  { title: 'Quarentena', description: 'Acompanhe períodos de isolamento e liberação.', href: '/modules/health/quarantine', icon: <Timer className="h-5 w-5" /> },
]

export default function HealthPage() {
  return <ModuleLanding eyebrow="Sanidade e biossegurança" title="Saúde animal" description="Centralize os registos sanitários, vacinação e tratamentos para acompanhar a saúde dos lotes." icon={<Activity className="h-6 w-6" />} items={items} primaryAction={{ label: 'Novo registo sanitário', href: '/modules/health/records' }} />
}
