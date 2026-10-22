# Config.yaml - Status de Implementação

## Projeto: HULA Agro - Sistema de Gestão de Galpões

**Objetivo Geral:** Remover todos os dados demo e implementar CRUD completo em 18 categorias.

---

## 1. GALPÕES (Farms)

### Status: ⏳ EM PLANEJAMENTO

**Tarefas:**
- [ ] Apagar todos os galpões existentes
- [ ] Criar tabela `farms` (NO SCHEMA: ✓ PRONTO)
- [ ] Implementar API: `/api/farms` (GET, POST)
- [ ] Implementar API: `/api/farms/[id]` (GET, PUT, DELETE)
- [ ] Criar página: `/modules/configuration/farms/list`
- [ ] Criar página: `/modules/configuration/farms/create`
- [ ] Criar página: `/modules/configuration/farms/[id]/edit`

**Campos:**
- farm_name, location, total_capacity, farm_manager, phone, email

---

## 2. ASSOCIAÇÃO DE GENÉTICA E LOTES

### Status: ⏳ EM PLANEJAMENTO

**Tarefas:**
- [ ] Criar tabela `genetics` (NO SCHEMA: ✓ PRONTO)
- [ ] Implementar API: `/api/genetics` (GET, POST)
- [ ] Implementar API: `/api/genetics/[id]` (GET, PUT, DELETE)
- [ ] Criar página para associar genética a lotes
- [ ] Implementar filtros por tipo de ave

**Campos:**
- genetic_code, genetic_name, bird_type, origin, characteristics

---

## 3. PRODUÇÃO DE POEDEIRAS (Layers)

### Status: 🟡 PARCIALMENTE IMPLEMENTADO

**Tarefas:**
- [ ] Remover dados demo do gráfico
- [ ] Remover dados demo dos indicadores (19220, 96.10%, 4850)
- [ ] Implementar API PUT para editar dados
- [ ] Implementar DELETE para apagar dados
- [ ] Adicionar filtros por data e período
- [ ] Criar página de edição de dados
- [ ] Fazer tabela de histórico responsiva

**Páginas afetadas:**
- `/modules/production/layers/page.tsx`
- `/modules/production-analysis/page.tsx`

---

## 4. PRODUÇÃO - FRANGO DE CORTE (Broilers)

### Status: 🟡 PARCIALMENTE IMPLEMENTADO

**Tarefas:**
- [ ] Remover dados demo (2399g, CA média, ganho diário)
- [ ] Limpar gráficos (evolução peso, ganho peso)
- [ ] Implementar PUT e DELETE
- [ ] Adicionar filtros
- [ ] Melhorar responsividade

**Páginas afetadas:**
- `/modules/production/broilers/page.tsx`

---

## 5. CLASSIFICAÇÃO DE OVOS

### Status: ⏳ EM PLANEJAMENTO

**Tarefas:**
- [ ] Criar tabela para classificações
- [ ] Remover dados demo (Extra, Tipo A, Tipo B)
- [ ] Implementar CRUD (Create, Edit, Delete)
- [ ] Criar página de gestão

**Páginas:**
- `/modules/production/classification/page.tsx`

---

## 6. TAXA DE POSTURA (Laying Rate)

### Status: 🟡 PARCIALMENTE IMPLEMENTADO

**Tarefas:**
- [ ] Remover todos os dados demo
- [ ] Corrigir layout para 100% responsivo
- [ ] Adicionar filtros
- [ ] Implementar CRUD

**Páginas:**
- `/modules/production/laying-rate/page.tsx`

---

## 7. ANÁLISE DE PRODUÇÃO

### Status: 🟡 PARCIALMENTE IMPLEMENTADO

**Tarefas:**
- [ ] Apagar dados demo (produção total, taxa, consumo, mortalidade)
- [ ] Implementar filtros por data
- [ ] Implementar filtros por lote
- [ ] Implementar filtros por galpão

**Páginas:**
- `/modules/production-analysis/page.tsx`
- `/modules/production-analysis/overview/page.tsx`
- `/modules/production-analysis/reports/page.tsx`

---

## 8. CONSUMO DE RAÇÃO

### Status: ⏳ EM PLANEJAMENTO

**Tarefas:**
- [ ] Apagar todos os dados da tabela
- [ ] Remover dados demo
- [ ] Criar página com tabela de consumo
- [ ] Implementar CRUD e filtros

**Páginas:**
- `/modules/nutrition/consumption/page.tsx`

---

## 9. RELATÓRIOS

### Status: ⏳ EM PLANEJAMENTO

**Tarefas:**
- [ ] Adicionar filtros (data, galpão, lote, período)
- [ ] Incluir todos os relatórios possíveis:
  - Relatório de Produção
  - Relatório de Saúde
  - Relatório de Custos
  - Relatório de RH
  - Relatório de Consumo de Ração
- [ ] Criar opção para personalizar relatórios
- [ ] Implementar exportação (PDF, Excel)

**Páginas:**
- `/modules/production-analysis/reports/page.tsx`

---

## 10. MEDICAMENTOS

### Status: ⏳ EM PLANEJAMENTO

**Tarefas:**
- [ ] Criar tabela `medications` (NO SCHEMA: ✓ PRONTO)
- [ ] Implementar API (GET, POST, PUT, DELETE)
- [ ] Criar página: `Create`, `Edit`, `List`, `Delete`
- [ ] Adicionar filtros por validade

**Páginas:**
- `/modules/health/medicines/page.tsx`

---

## 11. DOENÇAS

### Status: ⏳ EM PLANEJAMENTO

**Tarefas:**
- [ ] Remover dados demo ("Tratando", "Resolvido")
- [ ] Manter apenas lista de doenças
- [ ] Implementar CRUD para doenças
- [ ] Adicionar opção para definir status
- [ ] **Integrar com Medicamentos:**
  - Criar tabela `disease_medication_mapping`
  - Permitir associar medicamentos a doenças
  - Mostrar medicamentos sugeridos ao selecionar doença

**Páginas:**
- `/modules/health/diseases/page.tsx`

---

## 12. CARÊNCIA DE MEDICAMENTOS

### Status: ⏳ EM PLANEJAMENTO

**Tarefas:**
- [ ] Remover todos os dados demo
- [ ] Criar tabela `medication_shortage` (NO SCHEMA: ✓ PRONTO)
- [ ] Implementar API (GET, POST, PUT, DELETE)
- [ ] Criar página com:
  - Lista de carências
  - Opção para criar carência
  - Editar carência
  - Apagar carência
  - Status (pending, ordered, received)

---

## 13. MONITORAMENTO AMBIENTAL

### Status: ⏳ EM PLANEJAMENTO

**Tarefas:**
- [ ] Remover dados demo
- [ ] Criar tabela `environmental_monitoring` (NO SCHEMA: ✓ PRONTO)
- [ ] Implementar para:
  - Temperatura
  - Umidade (Humidity)
  - Ventilação
  - Consumo de energia
- [ ] Preparar integração com sensores reais
- [ ] Criar página de monitoramento

**Páginas:**
- `/modules/environment/temperature/page.tsx`
- `/modules/environment/humidity/page.tsx`
- `/modules/environment/ventilation/page.tsx`
- `/modules/environment/energy/page.tsx`

---

## 14. DESVIOS TÉCNICOS

### Status: ⏳ EM PLANEJAMENTO

**Tarefas:**
- [ ] Apagar todos os dados demo
- [ ] Criar tabela `deviations` (NO SCHEMA: ✓ PRONTO)
- [ ] Implementar CRUD e análise de desvios
- [ ] Adicionar gráficos de desvios

**Páginas:**
- `/modules/alerts/deviations/page.tsx`

---

## 15. SUGESTÕES DE AJUSTE

### Status: ⏳ EM PLANEJAMENTO

**Tarefas:**
- [ ] Apagar dados demo
- [ ] Criar tabela `suggestions` (NO SCHEMA: ✓ PRONTO)
- [ ] Implementar CRUD
- [ ] Adicionar filtros por urgência
- [ ] Implementar histórico de implementação

**Páginas:**
- `/modules/alerts/suggestions/page.tsx`

---

## 16. HISTÓRICO DE DECISÕES

### Status: ⏳ EM PLANEJAMENTO

**Tarefas:**
- [ ] Apagar dados demo
- [ ] Criar tabela `decision_history` (NO SCHEMA: ✓ PRONTO)
- [ ] Implementar CRUD
- [ ] Criar página de histórico

**Páginas:**
- `/modules/alerts/decisions/page.tsx`

---

## 17. ALERTAS E MONITORAMENTO

### Status: ⏳ EM PLANEJAMENTO

**Tarefas:**
- [ ] Remover todas as informações demo
- [ ] Deixar sistema virgem
- [ ] Criar tabela `alerts` (NO SCHEMA: ✓ PRONTO)
- [ ] Implementar sistema de alertas dinâmico
- [ ] Alertas baseados em:
  - Desvios técnicos
  - Saúde (mortalidade, doenças)
  - Custos (variações)
  - Ambiental (temperatura, umidade)

**Páginas:**
- `/modules/alerts/page.tsx`
- `/modules/alerts/critical/page.tsx`

---

## 18. RECURSOS HUMANOS

### Status: 🟡 PARCIALMENTE IMPLEMENTADO

### 18.1 Usuários da Empresa

**Tarefas:**
- [ ] Apagar todos os nomes existentes
- [ ] Implementar CRUD para usuários
- [ ] Adicionar autenticação de usuários

**Páginas:**
- `/modules/hr/users/page.tsx`

### 18.2 Gestão de Funcionários

**Tarefas:**
- [ ] Criar tabela `employee_records` (NO SCHEMA: ✓ PRONTO)
- [ ] Implementar API (GET, POST, PUT, DELETE)
- [ ] Criar página CRUD

**Páginas:**
- `/modules/hr/employees/list/page.tsx` (JÁ EXISTE)

### 18.3 Folha de Pagamento

**Tarefas:**
- [ ] Criar tabela `payroll` (NO SCHEMA: ✓ PRONTO)
- [ ] Implementar API (GET, POST, PUT, DELETE)
- [ ] Criar página com:
  - Cálculo de salários
  - Deduções
  - Bônus
  - MZN como moeda

**Páginas:**
- `/modules/hr/payroll/page.tsx`

### 18.4 Férias

**Tarefas:**
- [ ] Criar tabela `vacation` (NO SCHEMA: ✓ PRONTO)
- [ ] Implementar CRUD
- [ ] Adicionar aprovação de férias

**Páginas:**
- `/modules/hr/vacation/page.tsx`

### 18.5 Contratos

**Tarefas:**
- [ ] Criar tabela `contracts` (NO SCHEMA: ✓ PRONTO)
- [ ] Implementar CRUD
- [ ] Adicionar tipos de contrato

**Páginas:**
- `/modules/hr/contracts/page.tsx`

### 18.6 Avaliações

**Tarefas:**
- [ ] Implementar sistema de avaliações
- [ ] Criar página com histórico

**Páginas:**
- `/modules/hr/evaluations/page.tsx`

### 18.7 Banco de Horas

**Tarefas:**
- [ ] Criar tabela para banco de horas
- [ ] Implementar CRUD

**Páginas:**
- `/modules/hr/time-bank/page.tsx`

---

## RESUMO DE STATUS

| Categoria | Status | Prioridade |
|-----------|--------|-----------|
| 1. Galpões | ⏳ Planejamento | 🔴 Alta |
| 2. Genética/Lotes | ⏳ Planejamento | 🔴 Alta |
| 3. Produção Poedeiras | 🟡 Parcial | 🔴 Alta |
| 4. Produção Corte | 🟡 Parcial | 🔴 Alta |
| 5. Classificação Ovos | ⏳ Planejamento | 🟡 Média |
| 6. Taxa Postura | 🟡 Parcial | 🟡 Média |
| 7. Análise Produção | 🟡 Parcial | 🟡 Média |
| 8. Consumo Ração | ⏳ Planejamento | 🟡 Média |
| 9. Relatórios | ⏳ Planejamento | 🟡 Média |
| 10. Medicamentos | ⏳ Planejamento | 🟡 Média |
| 11. Doenças | ⏳ Planejamento | 🟡 Média |
| 12. Carência Medicamentos | ⏳ Planejamento | 🟢 Baixa |
| 13. Monitoramento Ambiental | ⏳ Planejamento | 🟡 Média |
| 14. Desvios Técnicos | ⏳ Planejamento | 🟢 Baixa |
| 15. Sugestões | ⏳ Planejamento | 🟢 Baixa |
| 16. Histórico Decisões | ⏳ Planejamento | 🟢 Baixa |
| 17. Alertas | ⏳ Planejamento | 🟡 Média |
| 18. Recursos Humanos | 🟡 Parcial | 🔴 Alta |

---

## PRÓXIMOS PASSOS

1. **Executar SQL**: Copiar conteúdo de `/scripts/01-clean-database.sql` no Supabase > SQL Editor
2. **Criar APIs**: Implementar os endpoints conforme `/API_SETUP.md`
3. **Criar Páginas**: Construir páginas CRUD para cada módulo
4. **Testar**: Verificar CRUD operations e sincronização com Supabase
5. **Deploy**: Publicar no Vercel

---

**Última Atualização:** 2024  
**Versão:** 1.0  
**Status Geral:** 10% Completo (⏳ Em Desenvolvimento)
