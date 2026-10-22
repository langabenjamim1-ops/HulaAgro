import { BriefcaseBusiness, CalendarDays, Clock3, FileText, Star, Users, Wallet } from 'lucide-react'
import { ModuleLanding, type ModuleLandingItem } from '@/components/modules/module-landing'

const items: ModuleLandingItem[] = [
  { title: 'Funcionários', description: 'Consulte e atualize os dados da equipa.', href: '/modules/hr/employees', icon: <Users className="h-5 w-5" /> },
  { title: 'Utilizadores e acessos', description: 'Reveja as contas de acesso ao sistema.', href: '/modules/hr/users', icon: <BriefcaseBusiness className="h-5 w-5" /> },
  { title: 'Folha salarial', description: 'Acompanhe períodos e estado dos pagamentos.', href: '/modules/hr/payroll', icon: <Wallet className="h-5 w-5" /> },
  { title: 'Férias e ausências', description: 'Registe pedidos e acompanhe aprovações.', href: '/modules/hr/vacation', icon: <CalendarDays className="h-5 w-5" /> },
  { title: 'Contratos', description: 'Consulte os contratos e respetivos prazos.', href: '/modules/hr/contracts', icon: <FileText className="h-5 w-5" /> },
  { title: 'Avaliações', description: 'Acompanhe avaliações de desempenho.', href: '/modules/hr/evaluations', icon: <Star className="h-5 w-5" /> },
  { title: 'Banco de horas', description: 'Consulte saldos e registos de horas.', href: '/modules/hr/time-bank', icon: <Clock3 className="h-5 w-5" /> },
]

export default function HRPage() {
  return <ModuleLanding eyebrow="Equipa e administração" title="Recursos humanos" description="Organize os dados da equipa, acompanhe pagamentos e mantenha os processos de pessoal num só lugar." icon={<Users className="h-6 w-6" />} items={items} primaryAction={{ label: 'Ver funcionários', href: '/modules/hr/employees' }} />
}
