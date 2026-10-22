import ReactMarkdown from 'react-markdown'
import { Bot, User } from 'lucide-react'

interface MessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date
}

export function MessageBubble({ role, content, timestamp }: MessageBubbleProps) {
  const isUser = role === 'user'

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#D1D8BD] flex items-center justify-center">
          <Bot className="w-4 h-4 text-[#283106]" />
        </div>
      )}

      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
          isUser
            ? 'bg-[#283106] text-white rounded-br-none'
            : 'bg-white text-gray-900 border border-[#E8E8E8] rounded-bl-none'
        }`}
      >
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown
            components={{
              p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2" {...props} />,
              ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-2" {...props} />,
              li: ({ node, ...props }) => <li className="mb-1" {...props} />,
              code: ({ node, className, children, ...props }) => {
                const isBlock = Boolean(className?.includes('language-'))
                return isBlock ? (
                  <code className="block overflow-x-auto rounded bg-gray-100 p-2 text-sm" {...props}>{children}</code>
                ) : (
                  <code className="rounded bg-gray-100 px-1 py-0.5 text-sm" {...props}>{children}</code>
                )
              },
              a: ({ node, ...props }) => (
                <a className="text-[#283106] underline hover:opacity-80" {...props} />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>

        {timestamp && (
          <p className={`text-xs mt-2 ${isUser ? 'text-gray-300' : 'text-gray-500'}`}>
            {timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#283106] flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  )
}
