type GeminiPart = {
  text?: string
  inlineData?: { mimeType: string; data: string }
  functionCall?: { name: string; args?: Record<string, unknown>; id?: string }
  functionResponse?: { name: string; response: Record<string, unknown>; id?: string }
}

export type GeminiContent = {
  role: 'user' | 'model'
  parts: GeminiPart[]
}

type GeminiOptions = {
  systemInstruction?: string
  tools?: Array<Record<string, unknown>>
  maxOutputTokens?: number
}

export type GeminiCandidate = {
  content?: GeminiContent
  finishReason?: string
}

export async function generateGeminiContent(
  contents: GeminiContent[],
  options: GeminiOptions = {},
): Promise<GeminiCandidate> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured')

  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents,
        ...(options.systemInstruction
          ? { systemInstruction: { parts: [{ text: options.systemInstruction }] } }
          : {}),
        ...(options.tools ? { tools: options.tools } : {}),
        generationConfig: { maxOutputTokens: options.maxOutputTokens ?? 1024 },
      }),
      cache: 'no-store',
    },
  )

  const result = await response.json()
  if (!response.ok) {
    throw new Error(`Gemini API request failed: ${result?.error?.message || `HTTP ${response.status}`}`)
  }

  return result?.candidates?.[0] ?? { content: { role: 'model', parts: [] } }
}

export function toGeminiContents(messages: Array<{ role: string; content: unknown }>): GeminiContent[] {
  return messages
    .filter((message) => ['user', 'assistant', 'model'].includes(message.role))
    .map((message) => ({
      role: message.role === 'user' ? 'user' : 'model',
      parts: [{ text: typeof message.content === 'string' ? message.content : JSON.stringify(message.content ?? '') }],
    }))
}

export function getGeminiText(candidate: GeminiCandidate): string {
  return candidate.content?.parts
    ?.map((part) => part.text)
    .filter((text): text is string => Boolean(text))
    .join('\n') ?? ''
}
