# Assistente de IA Avançado - HULA Agro

## Visão Geral

O assistente de IA foi significativamente melhorado com capacidades de análise de dados em tempo real da fazenda. Agora você pode fazer perguntas sobre seus dados reais e obter análises inteligentes baseadas em registros do banco de dados.

## 10 Funcionalidades Implementadas

### 1. Análise de Dados da Fazenda

O assistente pode consultar e analisar:
- **Lotes ativos** - Quantos lotes estão em criação
- **Contagem de aves** - Total de aves em cada lote
- **Status dos lotes** - Data de início, tipo de ave, etc

**Exemplos de perguntas:**
- "Quantas aves estão ativas atualmente?"
- "Qual é o status de todos os meus lotes?"
- "Qual lote tem mais aves?"

### 2. Inteligência de Ração

Calcula automaticamente:
- **Consumo de ração** - Total consumido nos últimos dias
- **FCR (Índice de Conversão Alimentar)** - kg de ração por kg de ganho
- **Ração necessária** - Para os próximos dias/semanas
- **Tendências de consumo** - Se está aumentando ou diminuindo

**Exemplos de perguntas:**
- "Quanto de ração será necessária nos próximos 14 dias?"
- "Qual é o FCR do meu lote?"
- "Como está o consumo de ração comparado a semana passada?"

### 3. Análise de Mortalidade

Detecta e analisa:
- **Mortalidade anormal** - Acima dos níveis esperados
- **Comparação entre lotes** - Qual tem melhor desempenho
- **Tendências** - Aumentando, diminuindo ou estável
- **Recomendações** - O que fazer para reduzir

**Exemplos de perguntas:**
- "Por que a mortalidade aumentou esta semana?"
- "Qual lote tem a melhor taxa de sobrevivência?"
- "A mortalidade está dentro do normal?"

### 4. Inteligência Financeira

Calcula automaticamente:
- **Receita** - De vendas e produtos
- **Despesas** - Alimento, medicamentos, etc
- **Lucro** - Ganho líquido
- **Margem de lucro** - Percentual de retorno
- **Custo por ave** - Quanto custa criar cada ave

**Exemplos de perguntas:**
- "Qual será o lucro esperado para este lote?"
- "Quanto estou gastando por ave?"
- "Como está a margem de lucro este mês?"

### 5. Relatórios Automatizados

Gera automaticamente:
- **Relatórios diários** - Resume o dia
- **Relatórios semanais** - Análise da semana
- **Relatórios mensais** - Resumo mensal
- **Relatórios de produção** - Focado em produtividade
- **Relatórios financeiros** - Análise de ganhos/perdas

Formatos suportados:
- Texto (na conversa)
- PDF (para impressão)
- Excel (para análise)

**Exemplos:**
- "Gere um relatório diário"
- "Quero um relatório semanal em PDF"
- "Crie um relatório financeiro em Excel"

### 6. Alertas Inteligentes

Sistema automático de alertas para:
- **Mortalidade alta** - Acima do esperado
- **Estoque baixo** - De ração ou medicamentos
- **Vacinações perdidas** - Fora do cronograma
- **Taxa de crescimento ruim** - Abaixo do esperado
- **Custos altos** - Despesas acima do orçamento

**Exemplos:**
- "Quais são os alertas críticos agora?"
- "Há algum problema na minha fazenda?"
- "Que medidas urgentes preciso tomar?"

### 7. Base de Conhecimento em Avicultura

O assistente responde a perguntas sobre:
- **Sintomas de doenças** - Identifica problemas de saúde
- **Cronogramas de vacinação** - Que vacinas aplicar
- **Recomendações de alimentação** - Qual ração usar
- **Manejo de frangos de corte** - Broilers
- **Manejo de poedeiras** - Galinhas poedeiras
- **Práticas de biossegurança** - Como proteger o rebanho

**Exemplos:**
- "Como identificar coccidiose?"
- "Qual é o cronograma de vacinação para frangos de corte?"
- "Como melhorar a qualidade dos ovos?"

### 8. Ações Sugeridas

Para cada análise, o assistente fornece:
- **Observações** - O que foi encontrado nos dados
- **Riscos** - Potenciais problemas identificados
- **Recomendações** - Ações práticas sugeridas
- **Nível de prioridade** - Crítica, Alta, Média, Baixa

**Exemplo de resposta estruturada:**
```
Observações:
- Mortalidade aumentou 12% esta semana
- Consumo de ração está 5% acima do normal

Riscos:
- Possível infecção respiratória
- Ambiente com temperatura inadequada

Recomendações:
1. Aumentar ventilação (CRÍTICA)
2. Revisar qualidade da ração
3. Aplicar medicação preventiva

Prioridade: ALTA
```

### 9. Resumos de Dashboard

Gera automaticamente resumos como:
- "Mortalidade aumentou 12% comparado à semana passada"
- "Consumo de ração está 8% acima do esperado"
- "Margem de lucro projetada é 18% para este lote"
- "Você tem 3 alertas críticos"
- "Próxima vacinação deve ser em 5 dias"

### 10. Arquitetura de Function Calling

O assistente usa ferramentas/funções inteligentemente:

**Funções disponíveis:**
- `getFlockData()` - Dados dos lotes
- `getMortalityAnalysis()` - Análise de mortalidade
- `getFeedAnalysis()` - Análise de ração
- `getInventoryStatus()` - Status do estoque
- `getHealthStatus()` - Registros de saúde
- `getFinancialAnalysis()` - Análise financeira
- `generateReport()` - Gerar relatórios
- `getSmartAlerts()` - Alertas inteligentes

O Claude automaticamente escolhe qual ferramenta usar baseado na sua pergunta.

## Exemplos de Uso

### Exemplo 1: Análise de Mortalidade
**Você:** "Por que a mortalidade aumentou esta semana?"

**IA:** 
- Consulta os dados de mortalidade
- Analisa as tendências
- Responde com observações, riscos e recomendações

### Exemplo 2: Planejamento de Ração
**Você:** "Quanto de ração precisarei para os próximos 30 dias?"

**IA:**
- Pega os dados de consumo atual
- Calcula o consumo diário médio
- Projeta para 30 dias
- Recomenda quando comprar

### Exemplo 3: Relatório Mensal
**Você:** "Gere um relatório mensal em PDF"

**IA:**
- Coleta todos os dados da fazenda
- Calcula métricas (receita, despesas, lucro)
- Gera o relatório estruturado
- Fornece insights e recomendações

### Exemplo 4: Alertas Críticos
**Você:** "Há algum problema urgente na minha fazenda?"

**IA:**
- Analisa mortalidade, estoque, cronogramas
- Identifica anomalias
- Lista alertas por prioridade
- Sugere ações imediatas

## Tecnologia

- **Modelo:** Claude 3.5 Sonnet (Anthropic)
- **Database:** Supabase PostgreSQL
- **Function Calling:** Antropic Tools
- **Framework:** Next.js 16

## Como Usar

1. **Abra o Chat** - Clique no botão verde (💬) no canto inferior direito
2. **Faça uma Pergunta** - Sobre dados, saúde, ração, finanças, etc
3. **IA Analisa** - Automaticamente consulta seu banco de dados
4. **Receba Insights** - Com observações, riscos e recomendações
5. **Tome Ação** - Implemente as recomendações sugeridas

## Configuração

Apenas uma variável de ambiente é necessária:
```
ANTHROPIC_API_KEY=sk-ant-v0-...
```

Obtenha em: [console.anthropic.com](https://console.anthropic.com)

## Próximas Melhorias

- Integração com gráficos em tempo real
- Previsões com Machine Learning
- Alertas por email/SMS
- Integração com histórico de custos
- Análise de biossegurança
- Sugestões baseadas em IA para otimizar custos
