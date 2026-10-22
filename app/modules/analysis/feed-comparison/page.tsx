import { LiveRecordsPage } from '@/components/modules/live-records-page'

export default function FeedComparisonPage() {
  return <LiveRecordsPage title="Comparação de rações" description="Consumos reais agrupados por tipo de ração e lote." endpoint="/api/nutrition" columns={[{ key: 'record_date', label: 'Data', kind: 'date' }, { key: 'feed_type', label: 'Ração' }, { key: 'nutrition_phase', label: 'Fase' }, { key: 'batch_id', label: 'Lote' }, { key: 'consumption_kg', label: 'Consumo', kind: 'number', unit: 'kg' }, { key: 'theoretical_consumption_kg', label: 'Consumo teórico', kind: 'number', unit: 'kg' }]} emptyMessage="Ainda não há registos de nutrição para comparar rações." />
}
