import { LiveRecordsPage } from '@/components/modules/live-records-page'

export default function HumidityPage() {
  return <LiveRecordsPage title="Humidade" description="Leituras reais de humidade registadas por data e lote." endpoint="/api/environmental-monitoring?type=humidity" columns={[{ key: 'record_date', label: 'Data', kind: 'date' }, { key: 'batch_id', label: 'Lote' }, { key: 'humidity', label: 'Humidade', kind: 'number', unit: '%' }, { key: 'temperature', label: 'Temperatura', kind: 'number', unit: '°C' }, { key: 'air_quality', label: 'Qualidade do ar' }]} />
}
