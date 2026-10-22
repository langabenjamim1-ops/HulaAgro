'use client'

import { MessageCircle } from 'lucide-react'

interface ChatBubbleProps {
  message: string
  role: 'user' | 'assistant'
}

export function ChatBubble({ message, role }: ChatBubbleProps) {
  const isUser = role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs md:max-w-sm lg:max-w-md px-4 py-3 rounded-lg ${
          isUser
            ? 'bg-[#283106] text-white rounded-br-none'
            : 'bg-white text-[#283106] border border-[#E8E8E8] rounded-bl-none'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message}</p>
        {!isUser && (
          <div className="flex items-center gap-1 mt-2 text-xs opacity-60">
            <MessageCircle className="w-3 h-3" />
            <span>Assistente Avícola</span>
          </div>
        )}
      </div>
    </div>
  )
}
