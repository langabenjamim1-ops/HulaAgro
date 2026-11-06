import { WifiOff, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#EEF2F1] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="p-6 bg-white rounded-full shadow-lg">
            <WifiOff className="w-12 h-12 text-[#515062]" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-[#515062] mb-2">Sem Conexão</h1>
        <p className="text-[#2FB394] mb-6">
          Você está offline. Alguns recursos podem não estar disponíveis.
        </p>

        <div className="bg-white rounded-lg p-4 mb-6 border-l-4 border-[#515062]">
          <p className="text-sm text-gray-600">
            <strong>Dica:</strong> Você pode visualizar dados que foram carregados anteriormente.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 px-4 bg-[#515062] text-white rounded-lg font-semibold hover:bg-[#5F5E73] transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Tentar Novamente
          </button>

          <Link
            href="/"
            className="block py-3 px-4 border border-[#515062] text-[#515062] rounded-lg font-semibold hover:bg-[#EEF2F1] transition-colors"
          >
            Voltar ao Início
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Restaure sua conexão de internet para usar todos os recursos.
        </p>
      </div>
    </div>
  )
}
