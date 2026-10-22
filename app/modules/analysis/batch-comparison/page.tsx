import { LiveRecordsPage } from '@/components/modules/live-records-page'

export default function BatchComparisonPage() {
  return <LiveRecordsPage title="Comparação entre lotes" description="Registos de produção reais organizados por lote para comparação." endpoint="/api/production" columns={[{ key: 'record_date', label: 'Data', kind: 'date' }, { key: 'batch_id', label: 'Lote' }, { key: 'eggs_produced', label: 'Ovos', kind: 'number' }, { key: 'laying_rate', label: 'Postura', kind: 'number', unit: '%' }, { key: 'mortality_count', label: 'Mortalidade', kind: 'number', unit: 'aves' }, { key: 'average_weight', label: 'Peso médio', kind: 'number', unit: 'g' }, { key: 'feed_consumption', label: 'Ração', kind: 'number', unit: 'kg' }]} emptyMessage="Ainda não há registos de produção para comparar lotes." />
}
