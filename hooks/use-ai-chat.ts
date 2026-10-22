import { useState, useCallback } from 'react';

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

interface ChatContext {
  batchData?: Record<string, any>;
  sensorData?: Record<string, any>;
  productionData?: Record<string, any>;
  healthData?: Record<string, any>;
}

interface UseAIChatReturn {
  conversationId: string | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string, context?: ChatContext) => Promise<void>;
  setConversationId: (id: string | null) => void;
  clearMessages: () => void;
}

export function useAIChat(): UseAIChatReturn {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (message: string, context?: ChatContext) => {
      try {
        setError(null);
        setIsLoading(true);

        // Adicionar mensagem do usuário localmente
        const userMessage: Message = {
          role: 'user',
          content: message,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMessage]);

        // Enviar para API
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversationId,
            message,
            context,
          }),
        });

        if (!response.ok) {
          throw new Error('Erro ao enviar mensagem');
        }

        const data = await response.json();

        // Atualizar conversationId se novo
        if (!conversationId) {
          setConversationId(data.conversationId);
        }

        // Adicionar resposta do assistente
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.message,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        console.error('Erro no chat:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setError(null);
  }, []);

  return {
    conversationId,
    messages,
    isLoading,
    error,
    sendMessage,
    setConversationId,
    clearMessages,
  };
}
