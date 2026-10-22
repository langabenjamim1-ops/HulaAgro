import { LiveRecordsPage } from '@/components/modules/live-records-page'

export default function LayersPage() {
  return <LiveRecordsPage title="Produção de poedeiras" description="Consulta os registos de produção associados às poedeiras." endpoint="/api/production?cohort=layers" columns={[{ key: 'record_date', label: 'Data', kind: 'date' }, { key: 'batch_id', label: 'Lote' }, { key: 'eggs_produced', label: 'Ovos', kind: 'number' }, { key: 'laying_rate', label: 'Taxa de postura', kind: 'number', unit: '%' }, { key: 'mortality_count', label: 'Mortalidade', kind: 'number', unit: 'aves' }, { key: 'notes', label: 'Observações' }]} emptyMessage="Ainda não existem registos de produção de poedeiras." />
}
