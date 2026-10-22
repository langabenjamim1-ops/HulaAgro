import { LiveRecordsPage } from '@/components/modules/live-records-page'

export default function BroilersPage() {
  return <LiveRecordsPage title="Produção de frangos de corte" description="Consulta os registos de peso e consumo associados aos frangos de corte." endpoint="/api/production?cohort=broilers" columns={[{ key: 'record_date', label: 'Data', kind: 'date' }, { key: 'batch_id', label: 'Lote' }, { key: 'average_weight', label: 'Peso médio', kind: 'number', unit: 'g' }, { key: 'feed_consumption', label: 'Consumo de ração', kind: 'number', unit: 'kg' }, { key: 'notes', label: 'Observações' }]} emptyMessage="Ainda não existem registos de produção de frangos de corte." />
}
