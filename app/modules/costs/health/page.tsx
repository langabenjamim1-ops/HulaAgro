import { LiveRecordsPage } from '@/components/modules/live-records-page'

export default function HealthCostsPage() {
  return <LiveRecordsPage title="Custos de saúde" description="Despesas sanitárias reais registadas na exploração." endpoint="/api/costs?cost_type=health" columns={[{ key: 'record_date', label: 'Data', kind: 'date' }, { key: 'description', label: 'Descrição' }, { key: 'supplier_name', label: 'Fornecedor' }, { key: 'amount', label: 'Valor', kind: 'currency', unit: 'MZN' }, { key: 'currency', label: 'Moeda' }]} />
}
