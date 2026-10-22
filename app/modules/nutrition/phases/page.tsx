import { LiveRecordsPage } from '@/components/modules/live-records-page'

export default function PhasesPage() {
  return <LiveRecordsPage title="Fases nutricionais" description="Fases de alimentação encontradas nos registos reais de nutrição." endpoint="/api/nutrition" columns={[{ key: 'nutrition_phase', label: 'Fase' }, { key: 'feed_type', label: 'Ração' }, { key: 'record_date', label: 'Data', kind: 'date' }, { key: 'batch_id', label: 'Lote' }, { key: 'consumption_kg', label: 'Consumo', kind: 'number', unit: 'kg' }, { key: 'status', label: 'Estado' }]} emptyMessage="Ainda não há registos nutricionais com fases associadas." />
}
