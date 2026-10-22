import { LiveRecordsPage } from '@/components/modules/live-records-page'

export default function FacilitiesPage() {
  return <LiveRecordsPage title="Galpões e instalações" description="Instalações reais registadas e respetiva capacidade." endpoint="/api/facilities" columns={[{ key: 'name', label: 'Instalação' }, { key: 'facility_type', label: 'Tipo' }, { key: 'capacity', label: 'Capacidade', kind: 'number', unit: 'aves' }, { key: 'status', label: 'Estado' }, { key: 'last_maintenance', label: 'Última manutenção', kind: 'date' }]} emptyMessage="Ainda não existem instalações registadas." />
}
