'use client'

import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { ProductionDashboard } from '@/components/production/production-dashboard'

export default function OverviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link href="/modules/production-analysis" className="text-[#515062] hover:text-[#5F5E73] flex items-center gap-2 mb-4">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </Link>
        <h1 className="text-3xl font-bold text-[#515062]">Análise de Produção em Tempo Real</h1>
        <p className="text-[#2FB394] mt-2">Monitoramento inteligente da sua operação avícola</p>
      </div>

      <ProductionDashboard />
    </div>
  )
}
