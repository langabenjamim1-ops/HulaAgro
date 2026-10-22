export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { generateGeminiContent, getGeminiText, toGeminiContents } from '@/lib/gemini'

const systemPrompt = `Você é um especialista em avicultura (criação de galinhas, galos e outros pássaros) com vasta experiência em gestão de fazendas avícolas. 
Fornece orientações práticas e baseadas em conhecimento técnico sobre:
- Bem-estar animal e alojamento
- Nutrição e alimentação de aves
- Saúde e prevenção de doenças
- Produção de ovos e carne
- Reprodução e genética
- Economia e gestão da fazenda
- Qualidade da água
- Controle ambiental (temperatura, umidade, ventilação)
- Biossegurança
- Gestão de resíduos

Sempre forneça respostas práticas, baseadas em evidências científicas, e adequadas ao contexto brasileiro de avicultura.
Se a pergunta não for sobre avicultura, responda educadamente que você é especialista em avicultura e recomende consultar outros recursos.`

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set')
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      )
    }

    const candidate = await generateGeminiContent(toGeminiContents(messages), {
      systemInstruction: systemPrompt,
      maxOutputTokens: 1024,
    })
    const text = getGeminiText(candidate)

    return NextResponse.json({
      content: text,
      role: 'assistant',
    })
  } catch (error) {
    console.error('[v0] Error in avicultura-chat API:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}
