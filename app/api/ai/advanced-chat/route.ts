export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { generateGeminiContent, getGeminiText, toGeminiContents, type GeminiContent } from '@/lib/gemini'
import { farmAnalysisTools } from '@/lib/ai/tools'
import { getAuthenticatedFarmContext, getFarmData, getSystemStatus } from '@/lib/ai/farm-data'

const systemPrompt = `És o assistente de gestão avícola do HULA Agro. Responde em português claro, preferencialmente português usado em Moçambique. Podes dar orientação geral de maneio, produção, alimentação, saúde, ambiente e gestão.

Para qualquer pergunta sobre o aviário, os seus números, lotes, sensores ou estado de funcionamento do sistema, consulta a ferramenta apropriada antes de responder. Usa get_system_status para estado técnico e get_farm_data para dados do aviário. Baseia afirmações sobre esta exploração apenas no resultado das ferramentas. Se a consulta falhar ou a configuração estiver incompleta, explica isso claramente e não digas que os registos estão vazios. Distingue dados registados de recomendações gerais; menciona datas, unidades e período quando disponíveis. Não inventes leituras nem previsões. Dá recomendações práticas e concisas. Para diagnóstico ou tratamento de doença, recomenda avaliação de um veterinário e não prescrevas medicamentos.`

async function processToolCall(name: string, input: Record<string, unknown>, farmId: string, platformAdmin: boolean) {
  try {
    if (name === 'get_farm_data') {
      const topic = ['overview', 'production', 'health', 'environment', 'finance', 'stock'].includes(String(input.topic)) ? input.topic as 'overview' | 'production' | 'health' | 'environment' | 'finance' | 'stock' : 'overview'
      const result = await getFarmData({ topic, days: Number(input.days) || 30, batch_code: typeof input.batch_code === 'string' ? input.batch_code.slice(0, 80) : undefined }, farmId, platformAdmin)
      return JSON.stringify({ success: true, data: result })
    }
    if (name === 'get_system_status') return JSON.stringify({ success: true, data: await getSystemStatus(farmId, platformAdmin) })
    return JSON.stringify({ success: false, error: 'Ferramenta desconhecida.' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha desconhecida ao consultar dados.'
    return JSON.stringify({ success: false, error: message })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const messages = body?.messages
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 40 || messages.some((m: any) => !['user', 'assistant'].includes(m?.role) || typeof m?.content !== 'string' || m.content.length > 8000)) {
      return NextResponse.json({ error: 'Envie até 40 mensagens válidas, com no máximo 8.000 caracteres cada.' }, { status: 400 })
    }
    if (!process.env.GEMINI_API_KEY?.trim()) return NextResponse.json({ error: 'A IA não está configurada: falta GEMINI_API_KEY no servidor.' }, { status: 503 })
    let farmContext: { farmId: string; platformAdmin: boolean }
    try { farmContext = await getAuthenticatedFarmContext() }
    catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Inicie sessão para usar o assistente.' }, { status: 401 }) }

    let contents: GeminiContent[] = toGeminiContents(messages)
    const tools = [{ functionDeclarations: farmAnalysisTools.map((tool) => ({ name: tool.name, description: tool.description, parameters: tool.input_schema })) }]
    let candidate = await generateGeminiContent(contents, { systemInstruction: systemPrompt, tools, maxOutputTokens: 2048 })

    for (let turn = 0; turn < 5; turn++) {
      const calls = candidate.content?.parts?.filter((part) => part.functionCall) ?? []
      if (!calls.length || !candidate.content) break
      contents = [...contents, candidate.content, {
        role: 'user',
        parts: await Promise.all(calls.map(async (part) => ({
          functionResponse: {
            name: part.functionCall!.name,
            response: { result: await processToolCall(part.functionCall!.name, part.functionCall!.args ?? {}, farmContext.farmId, farmContext.platformAdmin) },
            ...(part.functionCall!.id ? { id: part.functionCall!.id } : {}),
          },
        }))),
      }]
      candidate = await generateGeminiContent(contents, { systemInstruction: systemPrompt, tools, maxOutputTokens: 2048 })
    }
    return NextResponse.json({ content: getGeminiText(candidate), role: 'assistant' })
  } catch (error) {
    console.error('[advanced-chat] request failed:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Não foi possível processar a mensagem.' }, { status: 502 })
  }
}
