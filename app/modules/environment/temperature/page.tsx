import { LiveRecordsPage } from '@/components/modules/live-records-page'

export default function TemperaturePage() {
  return <LiveRecordsPage title="Temperatura" description="Leituras reais de temperatura registadas na exploração." endpoint="/api/environmental-monitoring?type=temperature" columns={[{ key: 'record_date', label: 'Data', kind: 'date' }, { key: 'batch_id', label: 'Lote' }, { key: 'temperature', label: 'Temperatura', kind: 'number', unit: '°C' }, { key: 'humidity', label: 'Humidade', kind: 'number', unit: '%' }, { key: 'ventilation_status', label: 'Ventilação' }, { key: 'notes', label: 'Observações' }]} emptyMessage="Ainda não existem leituras de temperatura." />
}
