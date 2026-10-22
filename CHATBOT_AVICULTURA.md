# Assistente Avícola - Chatbot com IA

## Visão Geral

O HULA Agro agora possui um **Assistente Avícola com IA integrada**, disponível como um chatbot flutuante em todas as páginas do sistema.

O assistente é especializado em avicultura e fornece orientações práticas baseadas em conhecimento técnico sobre:

### Tópicos Abordados
- **Bem-estar animal** - Alojamento, comportamento e manejo
- **Nutrição e alimentação** - Rações, suplementos e planos alimentares
- **Saúde e prevenção** - Doenças comuns, vacinação e tratamentos
- **Produção** - Otimização de ovos e carne
- **Reprodução e genética** - Seleção e melhoramento
- **Gestão da fazenda** - Economia, planejamento e eficiência
- **Qualidade da água** - Importância e tratamento
- **Controle ambiental** - Temperatura, umidade, ventilação
- **Biossegurança** - Prevenção de contaminação
- **Gestão de resíduos** - Descarte responsável

## Como Acessar

### Botão Flutuante
O chatbot aparece como um botão verde circular no canto inferior direito de todas as páginas:
- **Ícone**: MessageCircle
- **Posição**: Canto inferior direito
- **Sempre acessível**: Sim, em todas as páginas

### Abrir o Chat
1. Clique no botão flutuante verde no canto inferior direito
2. A janela de chat abrirá
3. Digite sua pergunta sobre avicultura
4. Pressione Enter ou clique no botão Enviar

## Recursos

### Interface Intuitiva
- **Design limpo** - Integrado com o tema HULA Agro
- **Animações suaves** - Transições fluidas
- **Responsive** - Funciona em mobile e desktop
- **Mensagens numeradas** - Histórico visual claro

### Funcionalidades
- **Histórico de conversa** - Mantém contexto da conversa
- **Auto-scroll** - Rola automaticamente para a última mensagem
- **Indicador de digitação** - Mostra quando o assistente está respondendo
- **Dicas rápidas** - Sugestões de perguntas iniciais
- **Teclado otimizado** - Enter envia mensagens

### Qualidade das Respostas
- **Baseado em Claude 3.5 Sonnet** - Modelo de IA de última geração
- **Especializado em avicultura** - Prompt de sistema focado
- **Contexto brasileiro** - Respostas adaptadas ao Brasil
- **Praticamente orientado** - Dicas aplicáveis na prática

## Configuração Técnica

### Arquivos Criados

#### `/app/api/avicultura-chat/route.ts`
- Endpoint da API que processa as mensagens
- Integração com Claude via Anthropic SDK
- System prompt especializado em avicultura

#### `/components/ai/avicultura-chatbot.tsx`
- Componente principal do chatbot
- Interface flutuante com chat window
- Gerenciamento de estado das mensagens
- Sugestões iniciais de perguntas

#### `/components/ai/chat-bubble.tsx`
- Componente reutilizável para bolhas de mensagem
- Estilos diferentes para user e assistant
- Renderização com indicadores

### Layout Integration
O componente está integrado no `app/layout.tsx`:
```tsx
import { AviculturaChatbot } from '@/components/ai/avicultura-chatbot'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <AviculturaChatbot /> {/* Disponível em todas as páginas */}
        <Analytics />
      </body>
    </html>
  )
}
```

## Variáveis de Ambiente Necessárias

```env
ANTHROPIC_API_KEY=sk-ant-...
```

**Como obter:**
1. Acesse [console.anthropic.com](https://console.anthropic.com)
2. Crie uma conta ou faça login
3. Navegue para "API Keys"
4. Copie sua chave
5. Adicione a variável ao seu ambiente Vercel

## Exemplos de Uso

### Pergunta sobre saúde
**Usuário:** "Como identificar saudade em galinhas?"
**Assistente:** Explica sintomas, causas e tratamentos específicos

### Pergunta sobre nutrição
**Usuário:** "Qual ração usar para poedeiras em produção?"
**Assistente:** Recomenda composição nutricional, marcas locais e planos alimentares

### Pergunta sobre ambiente
**Usuário:** "Qual a temperatura ideal para galpão?"
**Assistente:** Fornece faixas por fase de desenvolvimento com dicas práticas

### Pergunta sobre economia
**Usuário:** "Como reduzir custos de produção?"
**Assistente:** Analisa pontos de economia sem sacrificar bem-estar

## Performance

- **Resposta rápida**: Geralmente < 3 segundos
- **Não interfere**: Não impacta performance do site
- **Load lazy**: Carrega apenas quando necessário
- **Otimizado**: Usa streaming de respostas

## Personalização

### Adicionar tópicos
Edite o `systemPrompt` em `/app/api/avicultura-chat/route.ts`:
```typescript
const systemPrompt = `Você é um especialista em avicultura...
[adicione novos tópicos aqui]`
```

### Mudar cores
No `/components/ai/avicultura-chatbot.tsx`, altere as classes Tailwind:
- `bg-[#283106]` - Cor verde principal
- `bg-[#f0f2ed]` - Cor de fundo
- `border-[#E8E8E8]` - Cor de borda

### Ajustar tamanho
```tsx
<div className="w-96 h-[600px]"> {/* Altere width e height */}
```

## Troubleshooting

### Chatbot não aparece
- Verifique se `AviculturaChatbot` está importado no layout.tsx
- Verifique se a API está respondendo em `/api/avicultura-chat`

### Respostas lentas
- Verifique sua quota de API do Anthropic
- Confira se `ANTHROPIC_API_KEY` está configurada
- Verifique conexão com internet

### Erro "AI service not configured"
- Adicione `ANTHROPIC_API_KEY` às variáveis de ambiente
- Reinicie o servidor após adicionar a variável

## Próximas Melhorias

- [ ] Persistência de histórico em banco de dados
- [ ] Análise de dados da fazenda do usuário
- [ ] Recomendações personalizadas baseadas em histórico
- [ ] Integração com módulos de produção
- [ ] Sugestões de ações baseadas em dados
- [ ] Exportação de conversas em PDF

## Suporte

Para problemas ou sugestões sobre o Assistente Avícola:
1. Verifique a seção Troubleshooting acima
2. Revise o histórico de conversas para contexto
3. Teste com uma pergunta simples primeiro
4. Contate o suporte técnico se necessário
