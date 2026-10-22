# ARQUITETURA TÉCNICA - HULA AGRO

## 1. VISÃO GERAL

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 16)                 │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  React Components (TSX/TSX)                         │ │
│  │  - Pages (Client & Server)                          │ │
│  │  - Components (Shadcn/UI + Custom)                  │ │
│  │  - State Management (useState, useEffect)           │ │
│  │  - SWR for Data Fetching                            │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              API ROUTES (Next.js Route Handlers)         │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  - GET  /api/[resource] - Listar                    │ │
│  │  - POST /api/[resource] - Criar                     │ │
│  │  - PUT  /api/[resource]/[id] - Atualizar           │ │
│  │  - DELETE /api/[resource]/[id] - Deletar           │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│         BANCO DE DADOS (Supabase - PostgreSQL)           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  Tables:                                            │ │
│  │  - farms, batches, production_records              │ │
│  │  - health_records, cost_records, employees         │ │
│  │  - medications, diseases, purchases, supplies      │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 2. ESTRUTURA DE PASTAS

```
/app
  /api
    /batches
      - route.ts        (GET, POST)
      /[id]
        - route.ts      (PUT, DELETE)
    /production
    /health
    /costs
    /employees
  /modules
    /batches
      - page.tsx        (Index/Menu)
      /create
        - page.tsx      (Create Form)
      /list
        - page.tsx      (List with Table)
      /[id]
        /edit
          - page.tsx    (Edit Form)
      /facilities
      /genetics
    /production
      - page.tsx        (Index)
      /layers
      /broilers
      /classification
      /laying-rate
    /health
      - page.tsx        (Index)
      /medicines
      /diseases
      /quarantine
      /vaccination
      /records
    /hr
      - page.tsx        (Index)
      /employees
        /list
      /payroll
      /vacation
      /contracts
    /costs
    /purchases
    /supplies
    /production-analysis

/components
  /ui                   (Shadcn/UI)
  /crud
    - crud-table.tsx
    - form-section.tsx
    - confirm-dialog.tsx
  /common
    - page-header.tsx

/lib
  - supabaseClient.ts
  - types.ts
  - formatters.ts

/styles
  - globals.css

/public
  - images/
  - icons/
```

---

## 3. PADRÃO DE PÁGINA

### Página de Lista (Client Component)

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Plus, Filter } from 'lucide-react'
import CRUDTable from '@/components/crud/crud-table'
import ConfirmDialog from '@/components/crud/confirm-dialog'

interface Item {
  id: string
  [field: string]: any
}

export default function ListPage() {
  const [records, setRecords] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    fetchRecords()
  }, [])

  async function fetchRecords() {
    try {
      setLoading(true)
      const response = await fetch('/api/endpoint')
      const data = await response.json()
      setRecords(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('[v0] Error:', error)
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      await fetch(`/api/endpoint/${deleteId}`, { method: 'DELETE' })
      await fetchRecords()
      setDeleteId(null)
    } catch (error) {
      console.error('[v0] Error:', error)
    }
  }

  const columns = [
    { key: 'field1', label: 'Label 1' },
    { key: 'field2', label: 'Label 2', render: (v: any) => formatValue(v) },
  ]

  return (
    <div className="space-y-4">
      <PageHeader title="Título" description="Descrição" />
      
      <CRUDTable
        columns={columns}
        data={records}
        onDelete={setDeleteId}
        loading={loading}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Confirmar Exclusão"
        description="Tem certeza?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
```

### Página de Criação

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FormSection, { FormInput, FormSelect } from '@/components/crud/form-section'

export default function CreatePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ /* ... */ })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    try {
      setLoading(true)
      const response = await fetch('/api/endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/modules/xxx/list')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormSection title="Dados">
        <FormInput
          label="Campo"
          value={formData.field}
          onChange={(e) => setFormData({ ...formData, field: e.target.value })}
        />
      </FormSection>
      <button type="submit" disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  )
}
```

---

## 4. PADRÃO DE API ROUTE

```typescript
// /app/api/[resource]/route.ts

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('table_name')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[v0] Error:', error)
      return NextResponse.json([], { status: 200 })
    }

    return NextResponse.json(data || [], { status: 200 })
  } catch (error) {
    console.error('[v0] Error:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from('table_name')
      .insert([body])
      .select()

    if (error) throw error

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('[v0] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create record' },
      { status: 500 }
    )
  }
}

// /app/api/[resource]/[id]/route.ts

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from('table_name')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[v0] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update record' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('table_name')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('[v0] Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete record' },
      { status: 500 }
    )
  }
}
```

---

## 5. BANCO DE DADOS - SCHEMA

```sql
-- Batches
CREATE TABLE batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID,
  batch_code VARCHAR(50) NOT NULL,
  bird_type VARCHAR(50),
  birds_count INTEGER,
  genetics VARCHAR(100),
  facility_location VARCHAR(100),
  status VARCHAR(20),
  start_date DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Production Records
CREATE TABLE production_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES batches(id),
  record_date DATE,
  eggs_produced INTEGER,
  laying_rate DECIMAL(5, 2),
  mortality_count INTEGER,
  feed_consumption DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Health Records
CREATE TABLE health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES batches(id),
  record_date DATE,
  health_status VARCHAR(50),
  medication_name VARCHAR(100),
  disease_detected VARCHAR(100),
  birds_affected INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Medications
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_name VARCHAR(100) NOT NULL,
  active_ingredient VARCHAR(100),
  supplier VARCHAR(100),
  dosage_ml DECIMAL(10, 2),
  stock_quantity INTEGER,
  validity_date DATE,
  unit_cost DECIMAL(15, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Diseases
CREATE TABLE diseases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disease_name VARCHAR(100) NOT NULL,
  symptoms TEXT,
  transmission_method VARCHAR(100),
  incubation_days INTEGER,
  treatment_description TEXT,
  mortality_rate DECIMAL(5, 2),
  prevention_notes TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Employees
CREATE TABLE employee_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID,
  employee_name VARCHAR(100) NOT NULL,
  position VARCHAR(50),
  phone VARCHAR(20),
  email VARCHAR(100),
  hire_date DATE,
  salary_mzn DECIMAL(15, 2),
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT now()
);

-- Costs
CREATE TABLE cost_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID,
  record_date DATE,
  category VARCHAR(50),
  description VARCHAR(200),
  amount_mzn DECIMAL(15, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Purchases
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_date DATE,
  supplier VARCHAR(100),
  item_description VARCHAR(200),
  quantity DECIMAL(10, 2),
  unit_price_mzn DECIMAL(15, 2),
  total_mzn DECIMAL(15, 2),
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT now()
);

-- Supplies
CREATE TABLE supplies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supply_name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  stock_quantity DECIMAL(10, 2),
  unit VARCHAR(20),
  min_stock DECIMAL(10, 2),
  unit_cost_mzn DECIMAL(15, 2),
  last_updated TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- Indexes
CREATE INDEX idx_batches_farm_id ON batches(farm_id);
CREATE INDEX idx_batches_status ON batches(status);
CREATE INDEX idx_production_batch_id ON production_records(batch_id);
CREATE INDEX idx_health_batch_id ON health_records(batch_id);
CREATE INDEX idx_costs_farm_id ON cost_records(farm_id);
CREATE INDEX idx_employees_farm_id ON employee_records(farm_id);
```

---

## 6. FLUXO DE DADOS

### Criar Novo Registro

```
1. User preenche form
   ↓
2. onClick → handleSubmit()
   ↓
3. fetch('/api/endpoint', POST)
   ↓
4. API valida + insere no Supabase
   ↓
5. Supabase retorna novo ID
   ↓
6. Client redireciona para list
   ↓
7. List refetch dados
   ↓
8. Novo registro aparece na tabela
```

### Atualizar Registro

```
1. User clica Edit
   ↓
2. Carrega dados em form
   ↓
3. User modifica dados
   ↓
4. onClick → handleSubmit()
   ↓
5. fetch('/api/endpoint/id', PUT)
   ↓
6. API atualiza no Supabase
   ↓
7. Client redireciona
   ↓
8. Dados atualizados aparecem
```

### Deletar Registro

```
1. User clica Delete
   ↓
2. Abre ConfirmDialog
   ↓
3. User confirma
   ↓
4. fetch('/api/endpoint/id', DELETE)
   ↓
5. API deleta do Supabase
   ↓
6. Client refetch lista
   ↓
7. Registro desaparece da tabela
```

---

## 7. COMPONENTES REUTILIZÁVEIS

### CRUDTable

```typescript
interface CRUDTableProps {
  columns: Array<{
    key: string
    label: string
    render?: (value: any, row: any) => React.ReactNode
  }>
  data: any[]
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  loading?: boolean
}

// Uso:
<CRUDTable
  columns={[
    { key: 'name', label: 'Nome' },
    { key: 'value', label: 'Valor', render: (v) => `MZN ${v.toFixed(2)}` }
  ]}
  data={records}
  onDelete={setDeleteId}
/>
```

### FormSection

```typescript
<FormSection title="Dados Pessoais">
  <FormInput
    label="Nome"
    value={name}
    onChange={(e) => setName(e.target.value)}
    required
  />
  <FormSelect
    label="Status"
    value={status}
    onChange={(e) => setStatus(e.target.value)}
    options={[
      { value: 'active', label: 'Ativo' },
      { value: 'inactive', label: 'Inativo' }
    ]}
  />
</FormSection>
```

### ConfirmDialog

```typescript
<ConfirmDialog
  open={!!deleteId}
  title="Confirmar Exclusão"
  description="Tem certeza que deseja deletar este registro?"
  onConfirm={handleConfirm}
  onCancel={handleCancel}
/>
```

---

## 8. ESTADO (State Management)

### Cliente State (useState)

```typescript
// Dados da página
const [records, setRecords] = useState<Item[]>([])

// UI State
const [loading, setLoading] = useState(false)
const [deleteId, setDeleteId] = useState<string | null>(null)

// Filtros
const [statusFilter, setStatusFilter] = useState('all')
const [dateFilter, setDateFilter] = useState('')
```

### Sincronização (useEffect)

```typescript
// Carregar dados ao montar
useEffect(() => {
  fetchRecords()
}, [])

// Aplicar filtros quando mudarem
useEffect(() => {
  applyFilters()
}, [statusFilter, dateFilter, records])
```

---

## 9. TRATAMENTO DE ERROS

### API Errors

```typescript
try {
  const response = await fetch('/api/endpoint')
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const data = await response.json()
  // ...
} catch (error) {
  console.error('[v0] Error:', error)
  setError('Erro ao carregar dados')
}
```

### Form Validation

```typescript
function validateForm() {
  if (!formData.name) {
    setError('Nome é obrigatório')
    return false
  }
  if (formData.value < 0) {
    setError('Valor não pode ser negativo')
    return false
  }
  return true
}
```

---

## 10. PERFORMANCE OPTIMIZATIONS

### Lazy Loading

```typescript
const modules = [
  lazy(() => import('./modules/batches')),
  lazy(() => import('./modules/production')),
  // ...
]
```

### Memoization

```typescript
const MemoizedTable = React.memo(CRUDTable)

const handleDelete = useCallback((id: string) => {
  // ...
}, [])
```

### Image Optimization

```typescript
<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority // para hero images
/>
```

---

## 11. SEGURANÇA

### Input Validation

```typescript
const trimmedValue = userInput.trim()
const validatedNumber = parseInt(userInput) || 0
const validatedEmail = userEmail.toLowerCase()
```

### SQL Injection Prevention

```typescript
// ✅ Seguro - Supabase usa prepared statements
const { data } = await supabase
  .from('table')
  .select('*')
  .eq('id', userId)

// ❌ Nunca fazer interpolação de strings
```

### XSS Prevention

```typescript
// ✅ Seguro - React escapa automaticamente
<div>{userContent}</div>

// ❌ Nunca fazer
<div dangerouslySetInnerHTML={{ __html: userContent }} />
```

---

## 12. MONITORAMENTO E DEBUG

### Console Logging

```typescript
console.log('[v0] Component mounted')
console.log('[v0] Data loaded:', data)
console.error('[v0] Error occurred:', error)
```

### DevTools

```typescript
// No navegador
- F12 - Abrir DevTools
- Network - Ver requisições API
- Application - Ver dados localStorage/sessionStorage
- Console - Ver logs
```

---

## 13. DEPLOYMENT

### Variáveis de Ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
```

### Build

```bash
npm run build
npm run start
```

### Vercel Deployment

```bash
vercel deploy
```

---

## VERSÃO: 1.0.0
**Última Atualização**: Abril 2026
