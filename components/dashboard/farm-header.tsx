'use client'

import { useState } from 'react'
import { Cloud, Calendar } from 'lucide-react'

export default function FarmHeader() {
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0])
  
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="bg-white border border-[#C7C2AB] p-3 sm:p-5 font-montserrat">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
        <div className="w-full sm:w-auto">
          <h1 className="text-lg sm:text-xl font-bold text-[#283106] font-montserrat">Seu Galpão</h1>
          <p className="text-xs text-[#777E5C] font-montserrat capitalize mt-1">{today}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          {/* Date Filter */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[#F5F4F1] border border-[#C7C2AB] rounded">
            <Calendar className="w-4 h-4 text-[#283106]" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="text-xs text-[#283106] font-medium bg-transparent outline-none font-montserrat"
            />
          </div>

          {/* Weather Info */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[#D1D8BD] border border-[#C7C2AB] rounded">
            <Cloud className="w-4 h-4 text-[#283106]" />
            <span className="text-xs font-medium text-[#283106] font-montserrat">22°C</span>
          </div>
        </div>
      </div>
    </div>
  )
}
