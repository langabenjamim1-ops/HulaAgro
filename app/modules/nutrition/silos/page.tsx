import { LiveRecordsPage } from '@/components/modules/live-records-page'

export default function SilosPage() {
  return <LiveRecordsPage title="Silos e abastecimento" description="Movimentos de consumo ligados aos silos registados na nutrição." endpoint="/api/nutrition" columns={[{ key: 'record_date', label: 'Data', kind: 'date' }, { key: 'silo_id', label: 'Silo' }, { key: 'feed_type', label: 'Ração' }, { key: 'batch_id', label: 'Lote' }, { key: 'consumption_kg', label: 'Consumo', kind: 'number', unit: 'kg' }, { key: 'status', label: 'Estado' }]} emptyMessage="Ainda não há movimentos reais de ração associados aos silos." />
}
