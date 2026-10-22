import { LiveRecordsPage } from '@/components/modules/live-records-page'

export default function FeedConsumptionPage() {
  return <LiveRecordsPage title="Consumo de ração" description="Consumo de ração real registado por lote, data e tipo de ração." endpoint="/api/nutrition" columns={[{ key: 'record_date', label: 'Data', kind: 'date' }, { key: 'batch_id', label: 'Lote' }, { key: 'feed_type', label: 'Ração' }, { key: 'consumption_kg', label: 'Consumo', kind: 'number', unit: 'kg' }, { key: 'consumption_per_bird', label: 'Por ave', kind: 'number', unit: 'g' }, { key: 'status', label: 'Estado' }]} />
}
