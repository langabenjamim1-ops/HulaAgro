'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MessageSquare, Plus, Trash2 } from 'lucide-react'

interface Conversation {
  id: string
  title: string
  created_at: string
}

interface ConversationsSidebarProps {
  activeId?: string
  onNewChat?: () => void
}

export function ConversationsSidebar({ activeId, onNewChat }: ConversationsSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/ai/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      }
    } catch (error) {
      console.error('Erro ao buscar conversas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja deletar esta conversa?')) return

    try {
      const response = await fetch(`/api/ai/conversations/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setConversations(conversations.filter((c) => c.id !== id))
      }
    } catch (error) {
      console.error('Erro ao deletar conversa:', error)
    }
  }

  return (
    <div className="w-64 bg-white border-r border-[#E8E8E8] flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-[#E8E8E8]">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#283106] text-white rounded-lg hover:bg-[#3D4A2C] transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Nova Conversa
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500 text-sm">Carregando...</div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">Nenhuma conversa ainda</div>
        ) : (
          <div className="space-y-2 p-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  activeId === conversation.id
                    ? 'bg-[#F5F5F0] border-l-4 border-[#283106]'
                    : 'hover:bg-[#F5F5F0]'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-[#283106] flex-shrink-0" />
                <Link
                  href={`/modules/ai-consultiva?conversation=${conversation.id}`}
                  className="flex-1 truncate text-sm text-gray-900 hover:text-[#283106]"
                  title={conversation.title}
                >
                  {conversation.title}
                </Link>
                <button
                  onClick={() => handleDelete(conversation.id)}
                  className="hidden group-hover:flex p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
