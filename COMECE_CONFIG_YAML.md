# Começar Implementação - Config.yaml

## 🚀 Quick Start (5 Minutos)

### Passo 1: Executar Script SQL (2 minutos)

1. Abra o Supabase Dashboard
2. Vá em "SQL Editor"
3. Clique em "New Query"
4. Copie todo o conteúdo de `/scripts/01-clean-database.sql`
5. Cole no Supabase SQL Editor
6. Clique em "Run" (triângulo verde)

**Resultado:** Database zerado com 19 tabelas vazias (sem dados demo)

---

### Passo 2: Implementar APIs (15 minutos)

Seguindo o guia em `/API_SETUP.md`, implemente os endpoints para:

1. **Farms** (`/api/farms/` e `/api/farms/[id]/`)
2. **Batches** (completar PUT, DELETE em `/api/batches/[id]/`)
3. **Production** (completar `/api/production/[id]/`)
4. **Health** (completar `/api/health/[id]/`)
5. **Genetics**, **Medications**, **Diseases**, **Payroll**, **Purchases**

**Tempo Estimado:** 2-3 horas (copiar/colar template)

---

### Passo 3: Testar Batches CRUD

Na página `/modules/batches/list`:

1. Clique em "Novo Lote"
2. Preencha formulário
3. Clique em "Criar Lote"
4. Verifique se aparece na tabela (sincronizou com Supabase)
5. Clique em "Editar" (teste PUT)
6. Clique em "Deletar" (teste DELETE)

✅ **CRUD Batches Completo!**

---

## 📋 Checklist de Prioridades

### 🔴 CRÍTICAS (Implementar Primeiro)

- [ ] **Galpões (Farms)**
  - API: /api/farms/route.ts + /api/farms/[id]/route.ts
  - Página: /modules/configuration/farms/page.tsx

- [ ] **Lotes (Batches)**
  - [x] API: /api/batches/route.ts
  - [ ] API: /api/batches/[id]/route.ts (PUT, DELETE)
  - [x] Página: /modules/batches/list/page.tsx
  - [x] Página: /modules/batches/create/page.tsx
  - [x] Página: /modules/batches/[id]/edit/page.tsx

- [ ] **Genética (Genetics)**
  - API: /api/genetics/route.ts + /api/genetics/[id]/route.ts
  - Página: /modules/configuration/genetics/page.tsx

- [ ] **Produção (Production)**
  - [ ] API: /api/production/[id]/route.ts (PUT, DELETE)
  - [ ] Remover dados demo das páginas
  - [ ] Adicionar filtros por data

- [ ] **Saúde (Health)**
  - [ ] API: /api/health/[id]/route.ts
  - [ ] Remover dados demo

- [ ] **Recursos Humanos (HR)**
  - [ ] API: /api/employees/[id]/route.ts
  - [ ] API: /api/payroll/route.ts + [id]/route.ts
  - [ ] Remover dados demo

### 🟡 IMPORTANTES (Implementar Segundo)

- [ ] **Medicamentos (Medications)**
- [ ] **Doenças (Diseases)**
- [ ] **Custos (Costs)**
- [ ] **Compras (Purchases)**
- [ ] **Análise Produção (Production Analysis)**

### 🟢 OPCIONAIS (Implementar Depois)

- [ ] **Monitoramento Ambiental (Environmental)**
- [ ] **Desvios Técnicos**
- [ ] **Sugestões**
- [ ] **Alertas**
- [ ] **Relatórios**

---

## 📄 Documentação de Referência

1. **`/CONFIG_YAML_IMPLEMENTATION.md`** - Status de cada categoria
2. **`/API_SETUP.md`** - Como implementar APIs
3. **`/scripts/01-clean-database.sql`** - Schema do banco
4. **`/lib/api-template.ts`** - Template reutilizável

---

## 🎯 Objetivo Final

Após completar todos os passos:

✅ Base de dados zerada (sem dados demo)  
✅ CRUD completo para 18 categorias  
✅ Filtros por data, galpão, lote em análises  
✅ MZN como moeda padrão  
✅ 100% responsivo em todos os módulos  
✅ Sincronização em tempo real com Supabase  

---

## 🆘 Próximo Passo

Quer que eu implemente:

1. Os APIs restantes (copiar/colar template)?
2. Remover todos os dados demo das páginas?
3. Adicionar filtros nas análises?
4. Corrigir responsividade?

**Escreva a próxima ação desejada!**
