import { LiveRecordsPage } from '@/components/modules/live-records-page'

export default function FlocksPage() {
  return <LiveRecordsPage title="Bandos em produção" description="Lotes reais registados e o respetivo estado operacional." endpoint="/api/batches" columns={[{ key: 'batch_code', label: 'Lote' }, { key: 'bird_type', label: 'Tipo' }, { key: 'birds_count', label: 'Aves alojadas', kind: 'number' }, { key: 'start_date', label: 'Data de início', kind: 'date' }, { key: 'end_date', label: 'Data de encerramento', kind: 'date' }, { key: 'status', label: 'Estado' }]} emptyMessage="Ainda não existem lotes registados." />
}
