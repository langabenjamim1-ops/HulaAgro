import { Settings2, Dna, SlidersHorizontal, Wheat, Bird } from 'lucide-react'
import { ModuleLanding, type ModuleLandingItem } from '@/components/modules/module-landing'

const items: ModuleLandingItem[] = [
  { title: 'Genéticas', description: 'Mantenha as linhagens disponíveis para os lotes.', href: '/modules/configuration/genetics', icon: <Dna className="h-5 w-5" /> },
  { title: 'Tipos de produção', description: 'Configure categorias de produção da exploração.', href: '/modules/configuration/types', icon: <Bird className="h-5 w-5" /> },
  { title: 'Parâmetros técnicos', description: 'Consulte e ajuste parâmetros zootécnicos.', href: '/modules/configuration/parameters', icon: <SlidersHorizontal className="h-5 w-5" /> },
  { title: 'Tipos de ração', description: 'Organize as rações e as fases de utilização.', href: '/modules/configuration/feed', icon: <Wheat className="h-5 w-5" /> },
]

export default function ConfigurationPage() {
  return <ModuleLanding eyebrow="Administração do sistema" title="Configuração técnica" description="Defina os dados de referência usados nos registos e análises da exploração." icon={<Settings2 className="h-6 w-6" />} items={items} />
}
