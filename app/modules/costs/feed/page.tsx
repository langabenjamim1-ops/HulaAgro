import { LiveRecordsPage } from '@/components/modules/live-records-page'

export default function FeedCostsPage() {
  return <LiveRecordsPage title="Custos de ração" description="Custos reais de ração registados para a exploração." endpoint="/api/costs?cost_type=feed" columns={[{ key: 'record_date', label: 'Data', kind: 'date' }, { key: 'description', label: 'Descrição' }, { key: 'supplier_name', label: 'Fornecedor' }, { key: 'amount', label: 'Valor', kind: 'currency', unit: 'MZN' }, { key: 'currency', label: 'Moeda' }]} />
}
