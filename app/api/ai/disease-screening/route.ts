import { NextRequest, NextResponse } from 'next/server'
import { generateGeminiContent, getGeminiText } from '@/lib/gemini'

export const dynamic = 'force-dynamic'

const prompt = `Analisa a fotografia para triagem visual de aves. Não declares um diagnóstico definitivo nem inventes sintomas que não sejam visíveis. Devolve em português um resumo curto com: observações visuais, nível de atenção (baixo, moderado ou elevado), limitações da imagem e próximos passos seguros. Se a imagem não mostrar aves com clareza, diz isso. Recomenda contacto com veterinário para sinais de doença, mortalidade anormal ou agravamento. Esta triagem não substitui avaliação veterinária.`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const image = typeof body?.image === 'string' ? body.image : ''
    const match = image.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/)
    if (!match) return NextResponse.json({ error: 'Envia uma imagem JPG, PNG ou WebP válida.' }, { status: 400 })
    if (match[2].length > 5_000_000) return NextResponse.json({ error: 'A imagem excede o limite de 3,5 MB.' }, { status: 413 })
    const candidate = await generateGeminiContent([{ role: 'user', parts: [{ text: prompt }, { inlineData: { mimeType: match[1], data: match[2] } }] }], { maxOutputTokens: 600 })
    const analysis = getGeminiText(candidate)
    if (!analysis) return NextResponse.json({ error: 'A análise não devolveu resultados. Tenta novamente.' }, { status: 502 })
    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('[AI disease screening] Request failed:', error)
    return NextResponse.json({ error: 'Não foi possível analisar a imagem. Confirma a configuração do serviço de IA e tenta novamente.' }, { status: 502 })
  }
}
