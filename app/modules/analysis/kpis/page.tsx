import { LiveRecordsPage } from '@/components/modules/live-records-page'

export default function KPIsPage() {
  return <LiveRecordsPage title="Indicadores zootécnicos" description="Consulta indicadores calculados a partir dos registos reais de produção." endpoint="/api/production" columns={[{ key: 'record_date', label: 'Data', kind: 'date' }, { key: 'batch_id', label: 'Lote' }, { key: 'eggs_produced', label: 'Ovos', kind: 'number' }, { key: 'laying_rate', label: 'Taxa de postura', kind: 'number', unit: '%' }, { key: 'mortality_count', label: 'Mortalidade', kind: 'number' }, { key: 'average_weight', label: 'Peso médio', kind: 'number', unit: 'g' }, { key: 'feed_consumption', label: 'Ração', kind: 'number', unit: 'kg' }]} emptyMessage="Os indicadores aparecem depois de registar dados de produção." />
}
