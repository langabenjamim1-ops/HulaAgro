import { LiveRecordsPage } from '@/components/modules/live-records-page'

export function ProductionDashboard() {
  return <LiveRecordsPage title="Visão geral da produção" description="Registos reais de postura e engorda disponíveis por lote." endpoint="/api/production" columns={[{ key: 'record_date', label: 'Data', kind: 'date' }, { key: 'batch_id', label: 'Lote' }, { key: 'eggs_produced', label: 'Ovos', kind: 'number' }, { key: 'laying_rate', label: 'Postura', kind: 'number', unit: '%' }, { key: 'mortality_count', label: 'Mortalidade', kind: 'number' }, { key: 'average_weight', label: 'Peso médio', kind: 'number', unit: 'g' }, { key: 'feed_consumption', label: 'Ração', kind: 'number', unit: 'kg' }]} emptyMessage="Os dados de produção aparecerão quando forem registados." />
}
