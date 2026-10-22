import Link from 'next/link'
import { ArrowLeft, MessageCircle } from 'lucide-react'

export const metadata = {
  title: 'Teste do Chatbot de Avicultura',
  description: 'Página para testar o assistente de avicultura com IA',
}

export default function TestChatbotPage() {
  return (
    <div className="min-h-screen bg-[#f0f2ed] p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/dashboard"
            className="p-2 hover:bg-white rounded transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#283106]" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#283106]">
              Assistente de Avicultura
            </h1>
            <p className="text-[#6b7d3f]">
              Teste o chatbot com IA integrada para avicultura
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg border border-[#E8E8E8] p-6 mb-6">
          <h2 className="text-xl font-bold text-[#283106] mb-4">
            Como usar o chatbot
          </h2>
          <ol className="space-y-3 text-[#6b7d3f]">
            <li className="flex gap-3">
              <span className="font-bold text-[#283106] min-w-fit">1.</span>
              <span>
                Observe o botão verde <strong>💬</strong> no canto inferior
                direito da tela
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-[#283106] min-w-fit">2.</span>
              <span>
                Clique nele para abrir o painel do assistente de avicultura
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-[#283106] min-w-fit">3.</span>
              <span>
                Escreva sua pergunta sobre criação de aves e pressione Enter
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-[#283106] min-w-fit">4.</span>
              <span>Aguarde a resposta do assistente com IA</span>
            </li>
          </ol>
        </div>

        {/* Quick Tips */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg border border-[#E8E8E8] p-6">
            <h3 className="font-bold text-[#283106] mb-3">
              📋 Tópicos que o assistente domina
            </h3>
            <ul className="space-y-2 text-sm text-[#6b7d3f]">
              <li>✓ Saúde e doenças das aves</li>
              <li>✓ Nutrição e alimentação</li>
              <li>✓ Manejo e ambiente</li>
              <li>✓ Produção e rentabilidade</li>
              <li>✓ Soluções para Moçambique</li>
              <li>✓ Custos e análise económica</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg border border-[#E8E8E8] p-6">
            <h3 className="font-bold text-[#283106] mb-3">
              💡 Exemplos de perguntas
            </h3>
            <ul className="space-y-2 text-sm text-[#6b7d3f]">
              <li>
                "Como controlar New castle Disease?" <br />
                <span className="text-xs opacity-75">Diagnóstico e tratamento</span>
              </li>
              <li>
                "Qual a melhor ração para poedeiras?" <br />
                <span className="text-xs opacity-75">Nutrição específica</span>
              </li>
              <li>
                "Como reduzir custos de produção?" <br />
                <span className="text-xs opacity-75">Análise económica</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="bg-white rounded-lg border border-[#E8E8E8] p-6 mb-6">
          <h3 className="text-lg font-bold text-[#283106] mb-4">
            ✨ Características principais
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#F5F5F0] rounded-lg">
              <div className="text-2xl mb-2">🤖</div>
              <h4 className="font-semibold text-[#283106] mb-1">IA Inteligente</h4>
              <p className="text-sm text-[#6b7d3f]">
                Usa Claude 3.5 Sonnet para respostas precisas
              </p>
            </div>

            <div className="p-4 bg-[#F5F5F0] rounded-lg">
              <div className="text-2xl mb-2">🌍</div>
              <h4 className="font-semibold text-[#283106] mb-1">Contexto Local</h4>
              <p className="text-sm text-[#6b7d3f]">
                Especializado em Moçambique e avicultura tropical
              </p>
            </div>

            <div className="p-4 bg-[#F5F5F0] rounded-lg">
              <div className="text-2xl mb-2">⚡</div>
              <h4 className="font-semibold text-[#283106] mb-1">Sempre Disponível</h4>
              <p className="text-sm text-[#6b7d3f]">
                Acesso rápido em qualquer página do HULA Agro
              </p>
            </div>
          </div>
        </div>

        {/* System Integration */}
        <div className="bg-white rounded-lg border border-[#E8E8E8] p-6">
          <h3 className="text-lg font-bold text-[#283106] mb-4">
            🔗 Integração com o HULA Agro
          </h3>
          <p className="text-[#6b7d3f] mb-4">
            O assistente está integrado em todo o sistema HULA Agro e está
            pronto para ajudar:
          </p>
          <div className="space-y-2 text-sm text-[#6b7d3f]">
            <p>✓ Na dashboard principal</p>
            <p>✓ Em todas as páginas de módulos</p>
            <p>✓ Enquanto trabalha com dados de produção</p>
            <p>✓ Para consultas rápidas sobre manejo</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#283106] text-white rounded-lg hover:bg-[#3D4A2C] transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Voltar à Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
