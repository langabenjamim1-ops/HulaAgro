import { LiveRecordsPage } from '@/components/modules/live-records-page'

export default function ClassificationPage() {
  return <LiveRecordsPage title="Classificação de bandos" description="Resultados reais de classificação registados por lote." endpoint="/api/flock-classification" columns={[{ key: 'classification_date', label: 'Data', kind: 'date' }, { key: 'batch_id', label: 'Lote' }, { key: 'classification_type', label: 'Tipo' }, { key: 'total_birds', label: 'Aves classificadas', kind: 'number' }, { key: 'grading_results', label: 'Resultado' }, { key: 'notes', label: 'Observações' }]} emptyMessage="Ainda não existem classificações registadas." />
}
