import { LiveRecordsPage } from '@/components/modules/live-records-page'

export default function GeneticsComparisonPage() {
  return <LiveRecordsPage title="Comparação genética" description="Lotes e resultados reais associados às linhagens registadas." endpoint="/api/batches" columns={[{ key: 'batch_code', label: 'Lote' }, { key: 'bird_type', label: 'Tipo de produção' }, { key: 'genetics', label: 'Genética' }, { key: 'birds_count', label: 'Aves alojadas', kind: 'number' }, { key: 'start_date', label: 'Data de início', kind: 'date' }, { key: 'status', label: 'Estado' }]} emptyMessage="Ainda não há lotes para comparar por genética." />
}
