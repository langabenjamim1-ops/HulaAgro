'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function ConsumptionChart() {
  // Empty data - will be populated from database
  const data: { day: string; racao: number }[] = []

  return (
    <div className="bg-white border border-[#C7C2AB] p-3 sm:p-5 font-montserrat">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-[#283106] font-montserrat">Consumo de Ração</h3>
        </div>
        <select className="px-2 py-1 text-xs border border-[#C7C2AB] bg-white text-[#283106] rounded font-montserrat">
          <option>Últimos 7 dias</option>
          <option>Últimos 30 dias</option>
          <option>Este mês</option>
          <option>Este ano</option>
        </select>
      </div>
      
      {data.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center text-center">
          <div>
            <p className="text-sm text-[#777E5C] font-montserrat">Nenhum dado de consumo disponível</p>
            <p className="text-xs text-[#B0A89A] mt-1">Os dados apareceão conforme registrados</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="4 2" stroke="#D1D8BD" vertical={false} />
            <XAxis dataKey="day" stroke="#777E5C" style={{ fontSize: '10px' }} />
            <YAxis stroke="#777E5C" style={{ fontSize: '10px' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #C7C2AB' }}
              formatter={(value) => [`${value} kg`, 'Consumo']}
              labelStyle={{ fontSize: '11px' }}
            />
            <Bar dataKey="racao" fill="#777E5C" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
