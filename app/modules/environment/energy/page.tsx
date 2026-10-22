import { LiveRecordsPage } from '@/components/modules/live-records-page'

export default function EnergyPage() {
  return <LiveRecordsPage title="Energia" description="Consumo energético medido e registado na exploração." endpoint="/api/environmental-monitoring?type=energy" columns={[{ key: 'record_date', label: 'Data', kind: 'date' }, { key: 'batch_id', label: 'Lote' }, { key: 'energy_consumption', label: 'Consumo energético', kind: 'number', unit: 'kWh' }, { key: 'notes', label: 'Observações' }]} emptyMessage="Ainda não existem leituras de energia. Adiciona registos ambientais para os consultar aqui." />
}
