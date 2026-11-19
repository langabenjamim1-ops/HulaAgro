'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import PageHeader from '@/components/common/page-header'
import { BatchProductionPanel } from '@/components/batches/batch-production-panel'
import { BatchIndicators } from '@/components/batches/batch-indicators'

export default function BatchRecordsPage() {
  const params = useParams()
  const batchId = String(params.id)
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="space-y-4 sm:space-y-6 font-montserrat">
      <div className="flex items-center gap-2">
        <Link href={`/modules/batches/${batchId}`} aria-label="Voltar ao lote">
          <ArrowLeft className="h-5 w-5 cursor-pointer text-[#515062] hover:text-[#7D8B89]" />
        </Link>
        <PageHeader title="Registos do lote" description="Postura, consumo e pesagens" />
      </div>
      <BatchIndicators batchId={batchId} refreshKey={refreshKey} />
      <BatchProductionPanel batchId={batchId} onChange={() => setRefreshKey((key) => key + 1)} />
    </div>
  )
}