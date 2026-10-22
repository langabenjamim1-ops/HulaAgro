'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | number
  percentage: number
  status: 'green' | 'yellow' | 'red'
  icon: React.ReactNode
  isCurrency?: boolean
}

export default function KPICard({ title, value, percentage, status, icon, isCurrency = false }: KPICardProps) {
  const statusColors = {
    green: 'bg-[#DFE0DC] border-[#C7C2AB]',
    yellow: 'bg-[#F5F4F1] border-[#D1D8BD]',
    red: 'bg-[#F5F4F1] border-[#A67C52]'
  }

  const percentageColors = {
    green: 'text-[#283106]',
    yellow: 'text-[#777E5C]',
    red: 'text-[#A67C52]'
  }

  const isPositive = percentage >= 0

  return (
    <div className={`${statusColors[status]} border p-3 sm:p-4 md:p-5 font-montserrat hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <div className="text-lg sm:text-2xl">{icon}</div>
        <div className={`flex items-center gap-0.5 ${percentageColors[status]}`}>
          {isPositive ? (
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
          ) : (
            <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
          )}
          <span className="text-xs font-semibold">{Math.abs(percentage)}%</span>
        </div>
      </div>
      <h3 className="text-xs text-[#777E5C] font-montserrat font-medium mb-1">{title}</h3>
      <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#283106] font-montserrat">
        {isCurrency && value !== '-' ? 'MZN ' : ''}{value}
      </p>
    </div>
  )
}
