'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown, ChevronRight, ArrowRight } from 'lucide-react'

export default function ModulesOverview() {
  const [expandedModule, setExpandedModule] = useState<string | null>(null)

  const mainModules = [
    {
      id: 'producao',
      title: 'Gestão de Lotes',
      image: '/images/batches.jpg',
      description: 'Gerenciar lotes de aves',
      submenus: [
        { title: 'Gestão de Lotes', image: '/images/lotes-management.jpg', href: '/modules/batches', description: 'Criar e gerenciar lotes' },
        { title: 'Produção', image: '/images/production.jpg', href: '/modules/production', description: 'Acompanhar produção' },
        { title: 'Análise Produção', image: '/images/analysis.jpg', href: '/modules/production-analysis', description: 'Análises detalhadas' },
      ]
    },
    {
      id: 'saude',
      title: 'Saúde',
      image: '/images/health.jpg',
      description: 'Saúde e bem-estar',
      submenus: [
        { title: 'Sanidade', image: '/images/sanidade-health.jpg', href: '/modules/health', description: 'Controle sanitário' },
        { title: 'Ambiência', image: '/images/ambiencia.jpg', href: '/modules/environment', description: 'Ambiente da granja' },
        { title: 'Alertas', image: '/images/alertas.jpg', href: '/modules/alerts', description: 'Alertas do sistema' },
      ]
    },
    {
      id: 'administrativo',
      title: 'Administrativo',
      image: '/images/hr.jpg',
      description: 'Gestão administrativa',
      submenus: [
        { title: 'Recursos Humanos', image: '/images/recursos-humanos.jpg', href: '/modules/hr', description: 'Equipe e folha' },
        { title: 'Compras', image: '/images/compras-supplies.jpg', href: '/modules/purchases', description: 'Compras e estoque' },
        { title: 'Custos', image: '/images/custos-financial.jpg', href: '/modules/costs', description: 'Análise financeira' },
      ]
    },
    {
      id: 'frota',
      title: 'Frota Wialon',
      image: '/images/hr.jpg',
      description: 'Unidades, rotas e gestão da frota',
      submenus: [
        { title: 'Gestão da Frota', image: '/images/hr.jpg', href: '/modules/wialon', description: 'Mapa, motoristas, notificações e relatórios' },
      ],
    },
  ]

  return (
    <div className="w-full font-montserrat space-y-4">
      {/* Main Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mainModules.map((module) => (
          <div key={module.id}>
            <button
              onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
              className="w-full text-left"
            >
              <div className="bg-white border border-[#C7C2AB] hover:border-[#283106] transition-all cursor-pointer h-full flex flex-col overflow-hidden hover:shadow-lg group">
                {/* Module Image */}
                <div className="relative w-full h-40 sm:h-48 overflow-hidden bg-[#D1D8BD]">
                  <Image
                    src={module.image}
                    alt={module.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                </div>

                {/* Module Info */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-montserrat font-bold text-[#283106] text-sm sm:text-base mb-1">
                      {module.title}
                    </h3>
                    <p className="text-xs text-[#777E5C] font-normal">
                      {module.description}
                    </p>
                  </div>

                  {/* Expand Indicator */}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs font-medium text-[#283106]">
                      {module.submenus.length} módulos
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#777E5C] transition-transform ${
                        expandedModule === module.id ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>
              </div>
            </button>

            {/* Submenus - Expanded */}
            {expandedModule === module.id && (
              <div className="mt-3 space-y-3 lg:col-span-1">
                {module.submenus.map((submenu, idx) => (
                  <Link
                    key={idx}
                    href={submenu.href}
                    className="block group/submenu"
                  >
                    <div className="bg-white border border-[#D1D8BD] hover:border-[#283106] hover:shadow-md transition-all overflow-hidden">
                      <div className="flex gap-3">
                        {/* Submenu Image */}
                        <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden bg-[#D1D8BD]">
                          <Image
                            src={submenu.image}
                            alt={submenu.title}
                            fill
                            className="object-cover group-hover/submenu:scale-110 transition-transform duration-300"
                          />
                        </div>

                        {/* Submenu Info */}
                        <div className="p-3 flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <h4 className="font-montserrat font-semibold text-[#283106] text-xs sm:text-sm leading-tight group-hover/submenu:text-[#777E5C] transition-colors">
                              {submenu.title}
                            </h4>
                            <p className="text-xs text-[#777E5C] mt-1 line-clamp-2">
                              {submenu.description}
                            </p>
                          </div>

                          {/* Arrow Icon */}
                          <div className="flex justify-end mt-2">
                            <ArrowRight className="w-4 h-4 text-[#777E5C] group-hover/submenu:text-[#283106] transition-colors" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
