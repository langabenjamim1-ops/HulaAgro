import { LiveRecordsPage } from '@/components/modules/live-records-page'

export default function ConsumptionPage() {
  return <LiveRecordsPage title="Consumo de ração" description="Consulta os registos reais de consumo e compara-os por lote e data." endpoint="/api/nutrition" columns={[{ key: 'record_date', label: 'Data', kind: 'date' }, { key: 'batch_id', label: 'Lote' }, { key: 'nutrition_phase', label: 'Fase' }, { key: 'feed_type', label: 'Ração' }, { key: 'consumption_kg', label: 'Consumo', kind: 'number', unit: 'kg' }, { key: 'theoretical_consumption_kg', label: 'Consumo teórico', kind: 'number', unit: 'kg' }, { key: 'status', label: 'Estado' }]} />
}
