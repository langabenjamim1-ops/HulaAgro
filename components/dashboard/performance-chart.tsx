'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function PerformanceChart() {
  // Empty data - will be populated from database
  const data: { day: string; ovos: number }[] = []

  return (
    <div className="bg-white border border-[#C9D4D1] p-3 sm:p-5 font-montserrat">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-[#515062] font-montserrat">Produção últimos 7 dias</h3>
        </div>
        <select className="px-2 py-1 text-xs border border-[#C9D4D1] bg-white text-[#515062] rounded font-montserrat">
          <option>Últimos 7 dias</option>
          <option>Últimos 30 dias</option>
          <option>Este mês</option>
          <option>Este ano</option>
        </select>
      </div>
      
      {data.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center text-center">
          <div>
            <p className="text-sm text-[#7D8B89] font-montserrat">Nenhum dado de produção disponível</p>
            <p className="text-xs text-[#B0A89A] mt-1">Comece criando seu primeiro lote</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="4 2" stroke="#D5DEDC" vertical={false} />
            <XAxis dataKey="day" stroke="#7D8B89" style={{ fontSize: '10px' }} />
            <YAxis stroke="#7D8B89" style={{ fontSize: '10px' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #C9D4D1' }}
              formatter={(value) => [`${value} ovos`, 'Produção']}
              labelStyle={{ fontSize: '11px' }}
            />
            <Line 
              type="monotone" 
              dataKey="ovos" 
              stroke="#515062" 
              strokeWidth={2}
              dot={{ fill: '#515062', r: 3 }}
              activeDot={{ r: 4.5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
