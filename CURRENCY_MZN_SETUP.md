# Configuração de Moeda - Metical (MZN)

## 🌍 Padrão Monetário do Sistema

Este documento descreve como o sistema HULA Agro está configurado para usar **Metical (MZN)** como moeda padrão.

### Configuração no globals.css

Adicione variáveis CSS para formatação de moeda:

```css
:root {
  /* Moeda e Formatação */
  --currency: 'MZN';
  --currency-symbol: 'MT';
  --decimal-separator: ',';
  --thousands-separator: '.';
}
```

### Função Helper para Formatação de Metical

Crie um arquivo: `/lib/currency.ts`

```typescript
export const formatMetical = (value: number): string => {
  return new Intl.NumberFormat('pt-MZ', {
    style: 'currency',
    currency: 'MZN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const parseMetical = (str: string): number => {
  // Remove símbolos e converte para número
  return parseFloat(str.replace(/[^\d,-]/g, '').replace(',', '.'));
};

// Exemplos de uso:
// formatMetical(15000.50) → "15 000,50 MT"
// formatMetical(1234567.89) → "1 234 567,89 MT"
```

### Tabelas com Valores em Metical

Todas as tabelas a seguir armazenam valores em **Metical**:

#### 1. **purchases** (Compras)
```sql
unit_price_mzn DECIMAL(12,2)      -- Preço unitário: 500,00 MT
total_price_mzn DECIMAL(12,2)     -- Total: 5.000,00 MT
```

#### 2. **costs** (Custos)
```sql
amount_mzn DECIMAL(12,2)           -- Valor do custo: 250.000,00 MT
-- Tipos: feed, operational, health, utilities
```

#### 3. **employees** (Funcionários)
```sql
salary_mzn DECIMAL(12,2)           -- Salário mensal: 15.000,00 MT
```

#### 4. **farms** (Granjas)
```sql
currency VARCHAR(3)                -- Sempre "MZN"
```

### Exemplo de Implementação em Componente React

```typescript
// components/dashboard/cost-display.tsx
import { formatMetical } from '@/lib/currency';

interface CostItem {
  id: string;
  cost_type: string;
  amount_mzn: number;
  cost_date: string;
}

export function CostDisplay({ costs }: { costs: CostItem[] }) {
  return (
    <div className="space-y-2">
      {costs.map((cost) => (
        <div key={cost.id} className="flex justify-between">
          <span className="text-sm text-[#777E5C]">{cost.cost_type}</span>
          <span className="font-semibold text-[#283106]">
            {formatMetical(cost.amount_mzn)}
          </span>
        </div>
      ))}
    </div>
  );
}
```

### Exemplo: Server Action para Salvar Custo

```typescript
// lib/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';

export async function saveCost(formData: {
  farm_id: string;
  cost_type: string;
  amount_mzn: number;
  description: string;
  cost_date: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('costs')
    .insert([
      {
        farm_id: formData.farm_id,
        cost_type: formData.cost_type,
        amount_mzn: formData.amount_mzn,
        description: formData.description,
        cost_date: formData.cost_date,
      },
    ])
    .select();

  if (error) throw error;
  return data;
}
```

### Exemplo: Query Agregada (Custo Total)

```sql
SELECT
  cost_type,
  SUM(amount_mzn) as total_mzn,
  COUNT(*) as count
FROM costs
WHERE cost_date >= DATE_TRUNC('month', NOW())
GROUP BY cost_type
ORDER BY total_mzn DESC;
```

### Padrões de Display em Cards

```typescript
// Componente KPI com Metical
<div className="bg-white border border-[#C7C2AB] p-4">
  <p className="text-xs text-[#777E5C]">Custo de Ração Mês</p>
  <p className="text-2xl font-bold text-[#283106]">
    {formatMetical(1250000.50)}
  </p>
  <p className="text-xs text-[#777E5C] mt-1">+12% vs mês anterior</p>
</div>
```

### Validação em Formulários

```typescript
// Validar entrada de valores em Metical
const validateMetical = (value: string): boolean => {
  const num = parseMetical(value);
  return !isNaN(num) && num >= 0;
};

// Exemplo de input
<input
  type="text"
  placeholder="0,00 MT"
  onChange={(e) => {
    if (validateMetical(e.target.value)) {
      // Salvar valor
    }
  }}
/>
```

### 📱 Localização Portuguesa (Moçambique)

O sistema usa `pt-MZ` para:
- Formatação de números: `15 000,50` (espaço como separador de milhares)
- Símbolo de moeda: `MT` após o valor
- Data: DD/MM/YYYY

```typescript
// Exemplos de formatação automática
15000.50    → 15 000,50 MT
1234567.89  → 1 234 567,89 MT
100         → 100,00 MT
```

### 🔄 Conversão de Outras Moedas (se necessário)

Se precisar converter de outras moedas para Metical:

```typescript
const USD_TO_MZN_RATE = 63.5; // Taxa aproximada
const EUR_TO_MZN_RATE = 70.5; // Taxa aproximada

export const convertToMetical = (amount: number, currency: 'USD' | 'EUR'): number => {
  const rates = {
    USD: USD_TO_MZN_RATE,
    EUR: EUR_TO_MZN_RATE,
  };
  return amount * rates[currency];
};
```

### ✅ Checklist de Implementação

- [ ] Arquivo `/lib/currency.ts` criado com funções de formatação
- [ ] Variáveis CSS adicionadas ao `globals.css`
- [ ] Base de dados resetada com script `setup-supabase-clean.sql`
- [ ] Componentes atualizados para usar `formatMetical()`
- [ ] Server Actions preparadas para salvar valores MZN
- [ ] Validação de formulários implementada
- [ ] Dashboard exibe valores em Metical corretamente

---

**Moeda Padrão:** Metical (MZN)
**Localização:** Português (Moçambique) - pt-MZ
**Data:** 2026-03-09
