## API Routes Setup Guide

All API routes follow the same pattern using the template in `/lib/api-template.ts`.

### Criar API Routes para cada tabela:

**Farms API:**
```
/app/api/farms/route.ts - GET, POST
/app/api/farms/[id]/route.ts - GET, PUT, DELETE
```

**Batches API:**
```
/app/api/batches/route.ts - GET, POST (JÁ EXISTE)
/app/api/batches/[id]/route.ts - GET, PUT, DELETE (PRECISA IMPLEMENTAR)
```

**Production API:**
```
/app/api/production/route.ts - GET, POST
/app/api/production/[id]/route.ts - GET, PUT, DELETE
```

**Health API:**
```
/app/api/health/route.ts - GET, POST
/app/api/health/[id]/route.ts - GET, PUT, DELETE
```

**Genetics API:**
```
/app/api/genetics/route.ts - GET, POST
/app/api/genetics/[id]/route.ts - GET, PUT, DELETE
```

**Medications API:**
```
/app/api/medications/route.ts - GET, POST
/app/api/medications/[id]/route.ts - GET, PUT, DELETE
```

**Diseases API:**
```
/app/api/diseases/route.ts - GET, POST
/app/api/diseases/[id]/route.ts - GET, PUT, DELETE
```

**Employees API:**
```
/app/api/employees/route.ts - GET, POST (PRECISA CRIAR)
/app/api/employees/[id]/route.ts - GET, PUT, DELETE
```

**Payroll API:**
```
/app/api/payroll/route.ts - GET, POST
/app/api/payroll/[id]/route.ts - GET, PUT, DELETE
```

**Purchases API:**
```
/app/api/purchases/route.ts - GET, POST
/app/api/purchases/[id]/route.ts - GET, PUT, DELETE
```

**Costs API:**
```
/app/api/costs/route.ts - GET, POST (PRECISA CRIAR)
/app/api/costs/[id]/route.ts - GET, PUT, DELETE (PRECISA IMPLEMENTAR)
```

### Exemplo de implementação (para /app/api/farms/route.ts):

```typescript
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('farms')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[v0] GET /api/farms error:', error)
      return NextResponse.json([], { status: 200 })
    }

    return NextResponse.json(data || [], { status: 200 })
  } catch (error) {
    console.error('[v0] GET /api/farms error:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from('farms')
      .insert([body])
      .select()

    if (error) throw error

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('[v0] POST /api/farms error:', error)
    return NextResponse.json({ error: 'Failed to create farm' }, { status: 500 })
  }
}
```

### Exemplo para [id]/route.ts:

```typescript
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabase
      .from('farms')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[v0] GET /api/farms/:id error:', error)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { data, error } = await supabase
      .from('farms')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[v0] PUT /api/farms/:id error:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabase
      .from('farms')
      .delete()
      .eq('id', params.id)

    if (error) throw error
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('[v0] DELETE /api/farms/:id error:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
```

## Status de Implementação

- [x] /api/batches/route.ts (GET, POST)
- [ ] /api/batches/[id]/route.ts (GET, PUT, DELETE)
- [x] /api/production/route.ts (GET, POST)
- [ ] /api/production/[id]/route.ts (GET, PUT, DELETE)
- [x] /api/health/route.ts (GET, POST)
- [ ] /api/health/[id]/route.ts (GET, PUT, DELETE)
- [x] /api/costs/route.ts (GET, POST)
- [ ] /api/costs/[id]/route.ts (GET, PUT, DELETE)
- [x] /api/employees/route.ts (GET, POST)
- [ ] /api/employees/[id]/route.ts (GET, PUT, DELETE)
- [ ] /api/farms/route.ts (GET, POST)
- [ ] /api/farms/[id]/route.ts
- [ ] /api/genetics/route.ts e [id]
- [ ] /api/medications/route.ts e [id]
- [ ] /api/diseases/route.ts e [id]
- [ ] /api/payroll/route.ts e [id]
- [ ] /api/purchases/route.ts e [id]
