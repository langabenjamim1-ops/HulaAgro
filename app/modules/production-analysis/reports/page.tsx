import { LiveRecordsPage } from '@/components/modules/live-records-page'

export default function ReportsPage() {
  return <LiveRecordsPage title="Relatórios de produção" description="Registos reais de produção disponíveis para análise." endpoint="/api/production" columns={[{ key: 'record_date', label: 'Data', kind: 'date' }, { key: 'batch_id', label: 'Lote' }, { key: 'eggs_produced', label: 'Ovos', kind: 'number' }, { key: 'laying_rate', label: 'Taxa de postura', kind: 'number', unit: '%' }, { key: 'mortality_count', label: 'Mortalidade', kind: 'number' }, { key: 'average_weight', label: 'Peso médio', kind: 'number', unit: 'g' }]} emptyMessage="Ainda não há registos de produção para compor relatórios." />
}
