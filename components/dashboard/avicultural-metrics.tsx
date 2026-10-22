'use client'

import KPICard from './kpi-card'
import { TrendingUp, Zap, Thermometer, Wallet } from 'lucide-react'

export default function AviculturalMetrics() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 font-montserrat">
      <KPICard
        title="FCR (Conversão Alimentar)"
        value="-"
        percentage={0}
        status="green"
        icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#283106]" />}
      />
      <KPICard
        title="Postura %"
        value="-"
        percentage={0}
        status="green"
        icon={<Zap className="w-4 h-4 sm:w-5 sm:h-5 text-[#283106]" />}
      />
      <KPICard
        title="Temperatura Média"
        value="-"
        percentage={0}
        status="green"
        icon={<Thermometer className="w-4 h-4 sm:w-5 sm:h-5 text-[#283106]" />}
      />
      <KPICard
        title="Custo/Ave"
        value="-"
        percentage={0}
        status="green"
        icon={<Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-[#283106]" />}
        isCurrency
      />
    </div>
  )
}
