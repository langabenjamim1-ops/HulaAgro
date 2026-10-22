import { LiveRecordsPage } from '@/components/modules/live-records-page'

export default function LossesPage() {
  return <LiveRecordsPage title="Perdas e mortalidade" description="Registos reais de mortalidade associados ao manejo diário dos lotes." endpoint="/api/daily-management" columns={[{ key: 'record_date', label: 'Data', kind: 'date' }, { key: 'batch_id', label: 'Lote' }, { key: 'mortality_count', label: 'Aves mortas', kind: 'number', unit: 'aves' }, { key: 'mortality_rate', label: 'Taxa', kind: 'number', unit: '%' }, { key: 'mortality_reason', label: 'Causa' }]} emptyMessage="Ainda não existem registos de mortalidade para analisar." />
}
