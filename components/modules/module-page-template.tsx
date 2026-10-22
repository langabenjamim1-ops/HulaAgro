'use client'

import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'

interface ModuleItem {
  title: string
  description: string
  href: string
  icon: string
}

interface ModulePageTemplateProps {
  title: string
  subtitle: string
  icon: string
  items: ModuleItem[]
}

export function ModulePageTemplate({ title, subtitle, icon, items }: ModulePageTemplateProps) {
  return (
    <div className="w-full font-montserrat">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/dashboard" className="p-1 hover:bg-gray-100 rounded transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <span className="text-3xl">{icon}</span>
          </div>
          <h1 className="text-2xl font-montserrat font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 text-sm mt-1">{subtitle}</p>
        </div>
        <button className="px-4 py-2 bg-[#22C55E] text-white rounded hover:bg-[#16a34a] transition-colors font-montserrat font-semibold text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="group">
            <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-[#22C55E] transition-all cursor-pointer h-full flex flex-col items-center text-center">
              <div className="text-5xl mb-3">{item.icon}</div>
              <h3 className="font-montserrat font-semibold text-gray-900 text-xs mb-1 leading-tight">
                {item.title}
              </h3>
              <p className="text-xs text-gray-500 font-montserrat leading-tight">
                {item.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
