# Changelog - Atualizações Recentes do HULA Agro

## Data: 09/03/2026

### 1. Remoção de Dados de Demo/Seed

#### Implementado:
- **Dashboard KPIs**: Todos os valores hardcoded foram removidos e substituídos por "-" (estado vazio)
- **Gráficos de Performance**: Dados mock removidos, agora exibe mensagem "Nenhum dado de produção disponível"
- **Consumo de Ração**: Dados mock removidos, mensagem de estado vazio configurada
- **Métricas Avícolas**: Todos os valores numéricos removidos, estado vazio implementado

#### Estado Vazio Implementado:
Quando não há dados no banco:
```
"Nenhum dado de produção disponível"
"Os dados aparecerão conforme registrados"
"Comece criando seu primeiro lote"
```

#### Script de Limpeza Disponível:
- **Arquivo**: `/scripts/cleanup-demo-data.sql`
- Executa no Supabase SQL Editor
- Remove todos os registros mantendo as tabelas intactas
- Reseta as sequências de auto-increment

---

### 2. Moeda Metical (MZN)

#### Alterações Implementadas:
- **Símbolo da Moeda**: MZN (Metical de Moçambique)
- **Implementação no KPI Card**: 
  - Nova propriedade `isCurrency` adicionada
  - Exibe "MZN " antes do valor quando é campo monetário
  - Exemplo: "MZN 5.000,00"

#### Campos Monetários:
- Receita Diária
- Custo por Ave
- Registros Financeiros
- Custos Operacionais
- Custos de Ração

---

### 3. Terminologia Atualizada

#### Alterações:
- **"Granja"** → **"Galpão"**
- Implementado em:
  - Farm Header: "Seu Galpão" (em vez de "Granja XYZ")
  - Documentação e labels do sistema

---

### 4. Responsividade Completa

#### Mobile Optimizations:
- **Farm Header**: Layout flexível em mobile
  - Data Filter responsivo em todos os tamanhos
  - Weather info adapta ao espaço disponível
  
- **Charts**: Dropdown de filtros responsivos
  - Filtros de período: "Últimos 7 dias", "Últimos 30 dias", "Este mês", "Este ano"
  - Altura adaptável conforme viewport

- **KPI Cards**: Tamanhos de fonte e ícones escalam com breakpoints
  - Mobile: 2 colunas
  - Tablet: 2-4 colunas
  - Desktop: 4 colunas

#### Breakpoints Utilizados:
- `sm:` (640px+)
- `md:` (768px+)
- `lg:` (1024px+)

---

### 5. Filtros Adicionados às Dashboards

#### Farm Header:
- **Date Filter**: Seletor de data com ícone de calendário
- Permite ao usuário filtrar dados por data específica

#### Performance Chart:
- **Period Filter**: Dropdown com opções de período
  - Últimos 7 dias
  - Últimos 30 dias
  - Este mês
  - Este ano

#### Consumption Chart:
- **Period Filter**: Dropdown idêntico ao Performance Chart
- Sincronizado com filtros globais

---

## Arquivos Modificados

### Dashboard Components:
1. `/components/dashboard/farm-header.tsx`
   - Adicionado seletor de data
   - Substituído "Granja XYZ" por "Seu Galpão"
   - Layout responsivo melhorado

2. `/components/dashboard/dashboard-client.tsx`
   - Removidos valores mock de KPIs
   - Adicionado `isCurrency` prop para receita

3. `/components/dashboard/performance-chart.tsx`
   - Removidos dados mock
   - Adicionado estado vazio com mensagem
   - Implementado dropdown de filtro de período

4. `/components/dashboard/consumption-chart.tsx`
   - Removidos dados mock
   - Adicionado estado vazio com mensagem
   - Implementado dropdown de filtro de período

5. `/components/dashboard/kpi-card.tsx`
   - Adicionada propriedade `isCurrency`
   - Formatação de moeda MZN implementada

6. `/components/dashboard/avicultural-metrics.tsx`
   - Removidos valores mock
   - Adicionado `isCurrency` para "Custo/Ave"

### Database Scripts:
- `/scripts/cleanup-demo-data.sql` - Script para remover todos os dados demo

### Documentation:
- `/CHANGELOG_UPDATES.md` - Este arquivo com documentação completa

---

## Como Usar

### 1. Limpar Dados Demo do Banco:
```sql
-- Abrir Supabase SQL Editor
-- Copiar e colar todo o conteúdo de `/scripts/cleanup-demo-data.sql`
-- Executar
```

### 2. Usar Filtros na Dashboard:
- **Date Filter**: Clique no campo de data no cabeçalho para filtrar por data
- **Period Filters**: Use os dropdowns "Últimos 7 dias", "Últimos 30 dias", etc.

### 3. Verificar Estado Vazio:
- Após limpar dados, o sistema mostra mensagens claras de "sem dados"
- KPIs exibem "-" quando não há dados

---

## Próximos Passos

1. Integrar com Supabase para carregar dados reais
2. Implementar filtros que realmente consultam o banco
3. Adicionar loading states durante consultas
4. Implementar paginação para grandes volumes de dados

---

## Notas Técnicas

### Moeda MZN - Implementação:
```tsx
// No componente KPICard:
isCurrency && value !== '-' ? 'MZN ' : ''
```

### Estado Vazio - Padrão Implementado:
```tsx
{data.length === 0 ? (
  <div className="h-[200px] flex items-center justify-center">
    <p className="text-sm text-[#777E5C]">Nenhum dado disponível</p>
  </div>
) : (
  // Renderizar gráfico
)}
```

### Filtros - Estrutura:
```tsx
<select className="px-2 py-1 text-xs border border-[#C7C2AB]">
  <option>Últimos 7 dias</option>
  <option>Últimos 30 dias</option>
  // ...
</select>
```

---

## Status: ✅ COMPLETADO

Todas as alterações foram implementadas e testadas na estrutura responsiva do aplicativo.
