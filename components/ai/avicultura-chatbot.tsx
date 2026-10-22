'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function AviculturaChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Olá! Sou o assistente inteligente do HULA Agro com acesso aos dados reais da sua fazenda. Posso analisar:\n\n• Dados de lotes e contagem de aves\n• Taxas de mortalidade e saúde\n• Consumo de ração e FCR\n• Registros de vacinação\n• Análise financeira\n• Gerar relatórios\n\nComo posso ajudar? Pergunte sobre qualquer aspecto da sua criação!',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/advanced-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Falha ao obter resposta')
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.content || data.message,
        },
      ])
    } catch (error) {
      console.error('[v0] Chat error:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            error instanceof Error ? error.message : 'Não foi possível obter uma resposta. Tente novamente.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) {
  return (
    <button
      onClick={() => setIsOpen(true)}
      className="fixed bottom-6 right-6 w-14 h-14 bg-[#283106] text-white rounded-full shadow-lg hover:shadow-xl hover:bg-[#3D4A2C] transition-all duration-200 flex items-center justify-center z-40 group"
      title="Assistente de Avicultura"
    >
      <MessageCircle className="w-6 h-6 animate-pulse" />
      <div className="absolute bottom-full right-0 mb-3 px-3 py-2 bg-[#283106] text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
        Assistente Avícola
      </div>
    </button>
  )
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-24px)] h-[600px] bg-white rounded-xl shadow-2xl border border-[#E8E8E8] flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#283106] to-[#3D4A2C] text-white px-4 py-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg">Assistente Avícola</h3>
        <p className="text-xs opacity-90">Gestão do aviário e estado do sistema</p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f0f2ed]">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div
              className={`max-w-xs px-4 py-3 rounded-lg shadow-sm ${
                msg.role === 'user'
                  ? 'bg-[#283106] text-white rounded-br-none'
                  : 'bg-white border border-[#E8E8E8] text-[#283106] rounded-bl-none'
              }`}
            >
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-[#E8E8E8] text-[#283106] px-4 py-2 rounded-lg rounded-bl-none">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-[#283106] animate-bounce" />
                <div
                  className="w-2 h-2 rounded-full bg-[#283106] animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-[#283106] animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#E8E8E8] p-4 bg-[#f0f2ed] space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Pergunte sobre sua fazenda..."
            className="flex-1 px-4 py-2 border border-[#E8E8E8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#283106] focus:border-transparent text-sm bg-white"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="p-2 bg-[#283106] text-white rounded-lg hover:bg-[#3D4A2C] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Quick suggestions */}
        {messages.length <= 2 && (
          <div className="space-y-1">
            <p className="text-xs text-[#6b7d3f] font-medium">Exemplos:</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Como controlar saudade?',
                'Qual ração para poedeiras?',
                'Temperatura ideal?',
                'Sintomas de doença?',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion)
                  }}
                  className="text-xs bg-white border border-[#B0C88C] text-[#283106] px-2 py-1 rounded hover:bg-[#F5F5F0] transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
