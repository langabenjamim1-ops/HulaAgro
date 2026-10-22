'use client'

import { WifiOff, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-[#f0f2ed] rounded-full flex items-center justify-center">
            <WifiOff className="w-10 h-10 text-[#283106]" />
          </div>
        </div>

        {/* Heading */}
        <div>
          <h1 className="text-3xl font-bold text-[#283106] mb-2">
            Sem Conexão
          </h1>
          <p className="text-[#6b7d3f] text-base">
            Você está offline no momento. Verifique sua conexão com a internet para continuar.
          </p>
        </div>

        {/* Tips */}
        <div className="bg-[#f0f2ed] rounded-lg p-4 space-y-3 text-sm text-left">
          <div className="flex gap-3">
            <span className="text-[#283106] font-semibold flex-shrink-0">1.</span>
            <p className="text-[#6b7d3f]">Verifique se o Wi-Fi está ativado</p>
          </div>
          <div className="flex gap-3">
            <span className="text-[#283106] font-semibold flex-shrink-0">2.</span>
            <p className="text-[#6b7d3f]">Tente se reconectar à rede</p>
          </div>
          <div className="flex gap-3">
            <span className="text-[#283106] font-semibold flex-shrink-0">3.</span>
            <p className="text-[#6b7d3f]">Reinicie seu roteador</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#283106] text-white rounded-lg font-medium hover:bg-[#3D4A2C] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar Novamente
          </button>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-[#E8E8E8] text-[#283106] rounded-lg font-medium hover:bg-[#f0f2ed] transition-colors"
          >
            <Home className="w-4 h-4" />
            Voltar ao Início
          </Link>
        </div>

        {/* Info */}
        <div className="text-xs text-[#6b7d3f] space-y-2 pt-4 border-t border-[#E8E8E8]">
          <p>Dados em cache estão disponíveis quando conectado anteriormente.</p>
          <p>Alguns recursos podem estar limitados sem conexão.</p>
        </div>
      </div>
    </div>
  )
}
