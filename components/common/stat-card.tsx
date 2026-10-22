import React from "react"
import { Card, CardContent } from '@/components/ui/card'

interface StatCardProps {
  label: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon?: React.ReactNode
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple'
}

const colorClasses = {
  blue: 'from-blue-50 to-blue-100 text-blue-600',
  green: 'from-green-50 to-green-100 text-green-600',
  orange: 'from-orange-50 to-orange-100 text-orange-600',
  red: 'from-red-50 to-red-100 text-red-600',
  purple: 'from-purple-50 to-purple-100 text-purple-600',
}

const changeClasses = {
  positive: 'text-green-600',
  negative: 'text-red-600',
  neutral: 'text-slate-600',
}

export function StatCard({
  label,
  value,
  change,
  changeType = 'neutral',
  icon,
  color = 'blue',
}: StatCardProps) {
  return (
    <Card className={`border-0 shadow-lg bg-gradient-to-br ${colorClasses[color]}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-slate-600 font-medium">{label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
            {change && (
              <p className={`text-xs ${changeClasses[changeType]} mt-2`}>{change}</p>
            )}
          </div>
          {icon && <div className="opacity-20">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  )
}
