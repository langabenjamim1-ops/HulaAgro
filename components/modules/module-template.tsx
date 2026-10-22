'use client'

import { ArrowLeft, Plus, Settings } from 'lucide-react'
import Link from 'next/link'

interface ModuleTemplateProps {
  title: string
  description: string
  icon: string
  features: string[]
}

export default function ModuleTemplate({
  title,
  description,
  icon,
  features,
}: ModuleTemplateProps) {
  return (
    <div className="w-full font-montserrat">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <span className="text-4xl">{icon}</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-2 font-montserrat">{description}</p>
        </div>
        <button className="px-6 py-3 bg-[#22C55E] text-white rounded-lg hover:bg-[#16a34a] transition-colors font-montserrat font-bold flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Novo
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4 mb-12">
        {features.map((feature) => (
          <div
            key={feature}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-[#22C55E] transition-all cursor-pointer"
          >
            <h3 className="font-montserrat font-bold text-gray-900">{feature}</h3>
            <p className="text-sm text-gray-500 mt-2">Gerenciar {feature.toLowerCase()}</p>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-gray-200 rounded-xl p-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">{icon}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bem-vindo ao módulo {title}
          </h2>
          <p className="text-gray-600">
            Selecione uma ação acima ou use o menu lateral para começar
          </p>
        </div>
      </div>
    </div>
  )
}
