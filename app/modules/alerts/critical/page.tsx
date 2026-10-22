import { LiveRecordsPage } from '@/components/modules/live-records-page'

export default function CriticalAlertsPage() {
  return <LiveRecordsPage title="Alertas críticos" description="Alertas classificados como críticos nos registos reais da exploração." endpoint="/api/alerts?alert_type=critical&status=active" columns={[{ key: 'created_at', label: 'Data', kind: 'date' }, { key: 'alert_title', label: 'Alerta' }, { key: 'alert_message', label: 'Descrição' }, { key: 'alert_type', label: 'Prioridade' }, { key: 'status', label: 'Estado' }]} emptyMessage="Não há alertas críticos ativos registados." />
}
