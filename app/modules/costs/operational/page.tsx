import { LiveRecordsPage } from '@/components/modules/live-records-page'

export default function OperationalCostsPage() {
  return <LiveRecordsPage title="Custos operacionais" description="Custos operacionais reais registados na exploração." endpoint="/api/costs?cost_type=operational" columns={[{ key: 'record_date', label: 'Data', kind: 'date' }, { key: 'description', label: 'Descrição' }, { key: 'supplier_name', label: 'Fornecedor' }, { key: 'amount', label: 'Valor', kind: 'currency', unit: 'MZN' }, { key: 'currency', label: 'Moeda' }]} />
}
