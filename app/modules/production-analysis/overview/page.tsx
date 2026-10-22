'use client'

import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { ProductionDashboard } from '@/components/production/production-dashboard'

export default function OverviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link href="/modules/production-analysis" className="text-[#283106] hover:text-[#3D4A2C] flex items-center gap-2 mb-4">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </Link>
        <h1 className="text-3xl font-bold text-[#283106]">Análise de Produção em Tempo Real</h1>
        <p className="text-[#6b7d3f] mt-2">Monitoramento inteligente da sua operação avícola</p>
      </div>

      <ProductionDashboard />
    </div>
  )
}
