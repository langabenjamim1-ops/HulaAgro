export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { generateGeminiContent, getGeminiText, toGeminiContents } from '@/lib/gemini'

const AVICULTURA_SYSTEM_PROMPT = `És um assistente especialista em avicultura, focado em ajudar agricultores do HULA Agro em Moçambique.

Ajuda com saúde das aves, nutrição, manejo diário, produção, genética, problemas comuns, custos e rentabilidade. Considera o clima tropical, a moeda Metical e a disponibilidade local de produtos.

Sê prático, direto e acessível. Recomenda práticas sustentáveis e alternativas com boa relação custo-benefício. Para questões fora da avicultura, redireciona gentilmente para temas relacionados. Responde em português de Moçambique.`

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
    }

    const candidate = await generateGeminiContent(toGeminiContents(messages), {
      systemInstruction: AVICULTURA_SYSTEM_PROMPT,
      maxOutputTokens: 1024,
    })

    return NextResponse.json({
      message: getGeminiText(candidate) || 'Não consegui gerar uma resposta.',
      stop_reason: candidate.finishReason,
    })
  } catch (error: any) {
    console.error('[AI Chat API] Gemini request failed:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process chat message' },
      { status: 500 },
    )
  }
}
