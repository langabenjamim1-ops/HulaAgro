import { LiveRecordsPage } from '@/components/modules/live-records-page'

export default function DeviationsPage() {
  return <LiveRecordsPage title="Desvios técnicos" description="Desvios efetivamente registados em relação aos parâmetros definidos." endpoint="/api/deviations" columns={[{ key: 'deviation_date', label: 'Data', kind: 'date' }, { key: 'batch_id', label: 'Lote' }, { key: 'deviation_type', label: 'Parâmetro' }, { key: 'expected_value', label: 'Esperado', kind: 'number' }, { key: 'actual_value', label: 'Registado', kind: 'number' }, { key: 'deviation_percentage', label: 'Desvio', kind: 'number', unit: '%' }, { key: 'status', label: 'Estado' }]} />
}
