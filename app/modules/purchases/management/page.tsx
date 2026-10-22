import { LiveRecordsPage } from '@/components/modules/live-records-page'

export default function ManagementPage() {
  return <LiveRecordsPage title="Gestão de compras" description="Consulta de compras reais registadas na exploração." endpoint="/api/purchases" columns={[{ key: 'purchase_date', label: 'Data', kind: 'date' }, { key: 'supplier_name', label: 'Fornecedor' }, { key: 'product_type', label: 'Tipo' }, { key: 'quantity', label: 'Quantidade', kind: 'number' }, { key: 'unit', label: 'Unidade' }, { key: 'total_cost', label: 'Total', kind: 'currency', unit: 'MZN' }, { key: 'status', label: 'Estado' }]} />
}
