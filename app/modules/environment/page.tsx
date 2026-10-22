import { Activity, Droplets, Fan, Thermometer, Wifi, Zap } from 'lucide-react'
import { ModuleLanding, type ModuleLandingItem } from '@/components/modules/module-landing'

const items: ModuleLandingItem[] = [
  { title: 'Sensores Wialon', description: 'Veja os sensores configurados nas unidades Wialon e as leituras mais recentes.', href: '/modules/environment/wialon', icon: <Wifi className="h-5 w-5" /> },
  { title: 'Temperatura', description: 'Registe a temperatura e acompanhe os limites por galpão.', href: '/modules/environment/temperature', icon: <Thermometer className="h-5 w-5" /> },
  { title: 'Humidade', description: 'Acompanhe a humidade e a qualidade do ambiente.', href: '/modules/environment/humidity', icon: <Droplets className="h-5 w-5" /> },
  { title: 'Ventilação', description: 'Consulte o estado dos sistemas de ventilação.', href: '/modules/environment/ventilation', icon: <Fan className="h-5 w-5" /> },
  { title: 'Energia', description: 'Registe e analise o consumo energético.', href: '/modules/environment/energy', icon: <Zap className="h-5 w-5" /> },
]

export default function EnvironmentPage() {
  return <ModuleLanding eyebrow="Ambiência e instalações" title="Monitorização ambiental" description="Acompanhe as condições do galpão para manter um ambiente estável e adequado às aves." icon={<Activity className="h-6 w-6" />} items={items} primaryAction={{ label: 'Registar leitura', href: '/modules/environment/temperature' }} />
}
