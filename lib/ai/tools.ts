export const farmAnalysisTools = [
  {
    name: 'get_farm_data',
    description: 'Consultar dados reais deste aviário por tema. Use para lotes, produção, mortalidade, saúde, ambiente, sensores Wialon, custos, compras ou stock. Nunca invente resultados.',
    input_schema: {
      type: 'object',
      properties: {
        topic: { type: 'string', enum: ['overview', 'production', 'health', 'environment', 'finance', 'stock'], description: 'Tema dos dados; overview é um resumo geral.' },
        days: { type: 'number', description: 'Período até 365 dias; padrão 30.' },
        batch_code: { type: 'string', description: 'Código opcional de lote.' },
      },
      required: [],
    },
  },
  {
    name: 'get_system_status',
    description: 'Verificar estado técnico da aplicação, configuração Gemini, ligação à base Supabase e, para administradores da plataforma, ligação global Wialon. Use quando perguntarem se o sistema está a funcionar ou ligado.',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
]
