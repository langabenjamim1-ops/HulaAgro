import PageHeader from '@/components/common/page-header'
import { GeneticsStandardsEditor } from '@/components/batches/genetics-standards-editor'

export default function GeneticsStandardsPage() {
  return <div className="space-y-6 font-montserrat">
    <PageHeader title="Padrões das linhagens" description="Peso e postura alvo por idade, a partir do manual do fabricante." />
    <GeneticsStandardsEditor />
  </div>
}