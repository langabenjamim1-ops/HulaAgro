import { LiveRecordsPage } from '@/components/modules/live-records-page'

export default function LayingRatePage() {
  return <LiveRecordsPage title="Taxa de postura" description="Taxas e produção de ovos calculadas a partir dos registos reais." endpoint="/api/production" columns={[{ key: 'record_date', label: 'Data', kind: 'date' }, { key: 'batch_id', label: 'Lote' }, { key: 'eggs_produced', label: 'Ovos', kind: 'number' }, { key: 'laying_rate', label: 'Taxa de postura', kind: 'number', unit: '%' }, { key: 'mortality_count', label: 'Mortalidade', kind: 'number' }]} emptyMessage="Ainda não existem registos de postura para calcular a taxa." />
}
