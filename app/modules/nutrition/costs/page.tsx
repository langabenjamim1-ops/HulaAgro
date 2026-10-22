import { LiveRecordsPage } from '@/components/modules/live-records-page'

export default function NutritionCostsPage() {
  return <LiveRecordsPage title="Custos de nutrição" description="Custos de ração e alimentação registados na exploração." endpoint="/api/costs?cost_type=feed" columns={[{ key: 'record_date', label: 'Data', kind: 'date' }, { key: 'description', label: 'Descrição' }, { key: 'amount', label: 'Valor', kind: 'currency', unit: 'MZN' }, { key: 'currency', label: 'Moeda' }, { key: 'supplier_name', label: 'Fornecedor' }]} />
}
