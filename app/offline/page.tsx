'use client'

import { WifiOff, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-[#EEF2F1] rounded-full flex items-center justify-center">
            <WifiOff className="w-10 h-10 text-[#515062]" />
          </div>
        </div>

        {/* Heading */}
        <div>
          <h1 className="text-3xl font-bold text-[#515062] mb-2">
            Sem Conexão
          </h1>
          <p className="text-[#2FB394] text-base">
            Você está offline no momento. Verifique sua conexão com a internet para continuar.
          </p>
        </div>

        {/* Tips */}
        <div className="bg-[#EEF2F1] rounded-lg p-4 space-y-3 text-sm text-left">
          <div className="flex gap-3">
            <span className="text-[#515062] font-semibold flex-shrink-0">1.</span>
            <p className="text-[#2FB394]">Verifique se o Wi-Fi está ativado</p>
          </div>
          <div className="flex gap-3">
            <span className="text-[#515062] font-semibold flex-shrink-0">2.</span>
            <p className="text-[#2FB394]">Tente se reconectar à rede</p>
          </div>
          <div className="flex gap-3">
            <span className="text-[#515062] font-semibold flex-shrink-0">3.</span>
            <p className="text-[#2FB394]">Reinicie seu roteador</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#515062] text-white rounded-lg font-medium hover:bg-[#5F5E73] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar Novamente
          </button>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-[#E8E8E8] text-[#515062] rounded-lg font-medium hover:bg-[#EEF2F1] transition-colors"
          >
            <Home className="w-4 h-4" />
            Voltar ao Início
          </Link>
        </div>

        {/* Info */}
        <div className="text-xs text-[#2FB394] space-y-2 pt-4 border-t border-[#E8E8E8]">
          <p>Dados em cache estão disponíveis quando conectado anteriormente.</p>
          <p>Alguns recursos podem estar limitados sem conexão.</p>
        </div>
      </div>
    </div>
  )
}
