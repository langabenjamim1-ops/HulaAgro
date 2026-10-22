import { LiveRecordsPage } from '@/components/modules/live-records-page'

export default function VentilationPage() {
  return <LiveRecordsPage title="Ventilação" description="Leituras de ventilação e ambiência registadas na exploração." endpoint="/api/environmental-monitoring?type=ventilation" columns={[{ key: 'record_date', label: 'Data', kind: 'date' }, { key: 'batch_id', label: 'Lote' }, { key: 'ventilation_status', label: 'Estado da ventilação' }, { key: 'temperature', label: 'Temperatura', kind: 'number', unit: '°C' }, { key: 'humidity', label: 'Humidade', kind: 'number', unit: '%' }, { key: 'notes', label: 'Observações' }]} />
}
