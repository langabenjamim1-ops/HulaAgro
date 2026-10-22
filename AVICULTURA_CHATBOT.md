# Assistente de Avicultura - Chatbot com IA

## Visão Geral

O chatbot de avicultura é um assistente inteligente integrado ao HULA Agro, especializado em ajudar agricultores com questões sobre criação de aves. Utiliza a API do Anthropic (Claude 3.5 Sonnet) para fornecer respostas contextualizadas e práticas.

## Características

### 1. **Disponibilidade Global**
- Chatbot flutuante aparece em todas as páginas do sistema
- Acesso rápido via botão no canto inferior direito
- Design minimalista que não interfere com o conteúdo principal

### 2. **Áreas de Especialização**
O assistente é treinado para ajudar com:

- **Saúde das Aves**: Identificação de doenças, sinais de stress, recomendações de tratamento
- **Nutrição**: Tipos de ração, dosagens, cronogramas de alimentação
- **Manejo Diário**: Ventilação, temperatura, umidade, limpeza
- **Produção**: Otimização de postura, conversão alimentar, ganho de peso
- **Genética**: Seleção de raças, cruzamentos, melhoramento
- **Problemas Comuns**: Soluções para anomalias comportamentais
- **Economia**: Análise de custos, prejuízos, rentabilidade

### 3. **Contexto Local**
As respostas considerams:
- Localização em Moçambique
- Clima tropical/subtropical (calor significativo)
- Disponibilidade local de produtos
- Economia em Meticais (MT)
- Soluções práticas e sustentáveis

## Como Usar

### Abrir o Chatbot
1. Clique no botão verde "💬" no canto inferior direito da tela
2. O chatbot se abrirá com uma mensagem de boas-vindas

### Fazer uma Pergunta
1. Digite sua pergunta sobre avicultura no campo de input
2. Pressione **Enter** ou clique no botão **Enviar** (→)
3. Aguarde a resposta do assistente

### Exemplos de Perguntas

```
"Como controlar Newcastle Disease?"
"Qual é a melhor ração para poedeiras?"
"Qual deve ser a temperatura no aviário?"
"Sinais de falta de bem-estar nas aves?"
"Como calcular o custo de produção?"
```

### Fechar o Chatbot
Clique no botão **X** no canto superior direito do painel

## Estrutura Técnica

### Arquivos

- **`/app/api/ai/avicultura/route.ts`**: Endpoint da API que conecta com Anthropic
- **`/components/ai/avicultura-chatbot.tsx`**: Componente React do chatbot flutuante
- **`/app/layout.tsx`**: Integração do chatbot no layout raiz

### Fluxo de Funcionamento

```
Usuário digita pergunta
        ↓
Chatbot envia para /api/ai/avicultura
        ↓
API conecta com Claude 3.5 Sonnet
        ↓
Claude responde com especialidade em avicultura
        ↓
Resposta renderizada em Markdown no chatbot
```

### Configuração Necessária

**Variável de Ambiente Requerida:**
```
ANTHROPIC_API_KEY=sk-ant-...
```

## Limites e Considerações

### Tokens
- **Máximo de tokens por resposta**: 1.024 caracteres
- **Histórico**: Limitado ao contexto da conversa atual
- **Custo**: Dependente do volume de requisições

### Comportamento
- Respostas focadas em avicultura
- Redireciona perguntas fora do escopo
- Suporta Markdown para formatação (títulos, listas, etc)
- Animação de "digitação" durante processamento

## Melhorias Futuras

1. **Persistência de Conversas**: Salvar histórico no Supabase
2. **Upload de Imagens**: Análise de fotos para diagnóstico
3. **Integração com Dados**: Acesso aos sensores IoT e histórico da fazenda
4. **Recomendações Personalizadas**: Baseadas nos dados específicos do usuário
5. **Multi-idioma**: Suporte para inglês e outras línguas
6. **Análise de Documentos**: Processar guias de manejo e receitas

## Troubleshooting

### Chatbot não responde
1. Verifique se `ANTHROPIC_API_KEY` está configurada
2. Confira a quota da API no painel da Anthropic
3. Verifique a conexão de internet

### Respostas lentass
1. O modelo Claude 3.5 pode levar alguns segundos
2. Verifique a carga do servidor
3. Reduza o tamanho das perguntas se possível

### Erros de CORS
- Já tratados no backend com `export const dynamic = 'force-dynamic'`
- Se persistirem, confira as headers de resposta

## Exemplo de Uso

```javascript
// Cliente (React)
const handleSendMessage = async () => {
  const response = await fetch('/api/ai/avicultura', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'user', content: 'Como evitar saudade nas aves?' }
      ]
    })
  })
  const data = await response.json()
  console.log(data.message)
}
```

## Suporte e Feedback

Para reportar problemas ou sugerir melhorias:
1. Abra uma issue no repositório do projeto
2. Descreva o comportamento esperado vs. obtido
3. Forneça exemplos de perguntas que falharam
