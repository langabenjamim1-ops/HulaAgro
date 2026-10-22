# 🗺️ Mapa de Rotas - HULA Agro

## Dashboard Principal
- `GET /` - Redireciona para dashboard
- `GET /dashboard` - Dashboard com grid de 10 módulos principais

---

## 🔄 OPERAÇÕES

### Gestão de Lotes
- `GET /modules/batches` - Hub de gestão de lotes
  - Sub-rotas planejadas:
    - `/modules/batches/create` - Criar novo lote
    - `/modules/batches/list` - Lista de lotes
    - `/modules/batches/facilities` - Gestão de galpões
    - `/modules/batches/genetics` - Associar genética

### Produção
- `GET /modules/production` - Hub de produção
  - Sub-rotas planejadas:
    - `/modules/production/layers` - Produção poedeiras
    - `/modules/production/broilers` - Produção corte
    - `/modules/production/classification` - Classificação
    - `/modules/production/laying-rate` - Taxa de postura

### Análise de Produção
- `GET /modules/production-analysis` - Hub análise produção
  - Sub-rotas planejadas:
    - `/modules/production-analysis/overview` - Overview
    - `/modules/production-analysis/feed-consumption` - Consumo ração
    - `/modules/production-analysis/reports` - Relatórios

### Análises & Comparações
- `GET /modules/analysis` - Hub de análises
  - Sub-rotas planejadas:
    - `/modules/analysis/batch-comparison` - Lote vs Lote
    - `/modules/analysis/feed-comparison` - Ração A vs B
    - `/modules/analysis/genetics-comparison` - Genética A vs B
    - `/modules/analysis/kpis` - KPIs Zootécnicos

---

## 💉 SAÚDE

### Saúde & Biossegurança
- `GET /modules/health` - Hub de saúde
  - Sub-rotas planejadas:
    - `/modules/health/vaccination` - Calendário vacinação
    - `/modules/health/medicines` - Medicamentos
    - `/modules/health/diseases` - Doenças e ocorrências
    - `/modules/health/quarantine` - Período carência

### Ambiência & Galpões
- `GET /modules/environment` - Hub de ambiência
  - Sub-rotas planejadas:
    - `/modules/environment/temperature` - Temperatura
    - `/modules/environment/humidity` - Umidade
    - `/modules/environment/ventilation` - Ventilação
    - `/modules/environment/energy` - Consumo energia

### Alertas & Monitoramento
- `GET /modules/alerts` - Hub de alertas
  - Sub-rotas planejadas:
    - `/modules/alerts/deviations` - Desvios técnicos
    - `/modules/alerts/suggestions` - Sugestões ajuste
    - `/modules/alerts/decisions` - Histórico decisões
    - `/modules/alerts/critical` - Alertas críticos

---

## 👥 ADMINISTRATIVO

### Recursos Humanos
- `GET /modules/hr` - Hub RH
  - Sub-rotas planejadas:
    - `/modules/hr/users` - Usuários empresa
    - `/modules/hr/employees` - Funcionários
    - `/modules/hr/payroll` - Folha pagamento
    - `/modules/hr/vacation` - Férias
    - `/modules/hr/contracts` - Contratos
    - `/modules/hr/evaluations` - Avaliações
    - `/modules/hr/time-bank` - Banco de horas

### Compras & Estoque
- `GET /modules/purchases` - Hub compras
  - Sub-rotas planejadas:
    - `/modules/purchases/management` - Gestão compras
    - `/modules/purchases/suppliers` - Fornecedores
    - `/modules/purchases/products` - Produtos
    - `/modules/purchases/packaging-costs` - Custos embalagem
    - `/modules/purchases/brands` - Marcas
    - `/modules/purchases/categories` - Categorias

### Gestão de Custos
- `GET /modules/costs` - Hub custos
  - Sub-rotas planejadas:
    - `/modules/costs/feed` - Custo ração
    - `/modules/costs/health` - Custo sanitário
    - `/modules/costs/operational` - Custo operacional
    - `/modules/costs/losses` - Análise perdas

### Alertas de Crédito
- `GET /modules/credit-alerts` - Hub alertas crédito
  - Exibe contas a pagar com status
  - Integração planejada com sistema de pagamento

---

## ⚙️ CONFIGURAÇÃO

### Configuração Técnica
- `GET /modules/configuration` - Hub configuração
  - Sub-rotas planejadas:
    - `/modules/configuration/genetics` - Genética/Linhagens
    - `/modules/configuration/types` - Tipos de produção
    - `/modules/configuration/parameters` - Parâmetros técnicos
    - `/modules/configuration/feed` - Tipos de ração

### Ração & Nutrição
- `GET /modules/nutrition` - Hub nutrição
  - Sub-rotas planejadas:
    - `/modules/nutrition/phases` - Fases de criação
    - `/modules/nutrition/consumption` - Consumo esperado
    - `/modules/nutrition/costs` - Custo ração
    - `/modules/nutrition/silos` - Controle silos

### Manejo Diário
- `GET /modules/daily-management` - Hub manejo diário
  - Sub-rotas planejadas:
    - `/modules/daily-management/records` - Registros diários
    - `/modules/daily-management/mortality` - Mortalidade
    - `/modules/daily-management/water` - Consumo água
    - `/modules/daily-management/weight` - Peso médio

---

## 📊 Resumo de Rotas

### Rotas Ativas (14)
```
/dashboard                          ✅ Dashboard Principal
/modules/batches                    ✅ Gestão Lotes
/modules/production                 ✅ Produção
/modules/production-analysis        ✅ Análise Produção
/modules/analysis                   ✅ Análises & Comparações
/modules/health                     ✅ Saúde
/modules/environment                ✅ Ambiência
/modules/alerts                     ✅ Alertas
/modules/hr                         ✅ RH
/modules/purchases                  ✅ Compras
/modules/costs                      ✅ Custos
/modules/credit-alerts              ✅ Alertas Crédito
/modules/configuration              ✅ Configuração
/modules/nutrition                  ✅ Nutrição
/modules/daily-management           ✅ Manejo Diário
```

### Sub-rotas Planejadas (50+)
Estrutura já definida, aguardando implementação de data layer

---

## 🔗 Hierarquia de Navegação

```
HULA Agro Dashboard
    │
    ├── OPERAÇÕES
    │   ├── /modules/batches
    │   ├── /modules/production
    │   ├── /modules/production-analysis
    │   └── /modules/analysis
    │
    ├── SAÚDE
    │   ├── /modules/health
    │   ├── /modules/environment
    │   └── /modules/alerts
    │
    ├── ADMINISTRATIVO
    │   ├── /modules/hr
    │   ├── /modules/purchases
    │   ├── /modules/costs
    │   └── /modules/credit-alerts
    │
    └── CONFIGURAÇÃO
        ├── /modules/configuration
        ├── /modules/nutrition
        └── /modules/daily-management
```

---

## 🎯 Padrão de Navegação

### Dashboard → Módulo
```
/dashboard
  → Link em card
  → GET /modules/{modulo}
  → Exibe grid de sub-módulos
```

### Sidebar → Módulo
```
Sidebar expandido
  → Clica em item menu
  → GET /modules/{modulo}
  → Exibe grid de sub-módulos
```

### Voltar
```
Qualquer página
  → Clica em botão "Voltar" (←)
  → GET /dashboard
  → Retorna ao Dashboard
```

---

## 🔐 Estrutura de Acesso

### Sem Autenticação Atual
- Todas as rotas acessíveis
- Sem verificação de permissões
- Sem roles de usuário

### Planejado para Futuro
- Sistema de login
- Controle de acesso por role
- Verificação de permissões por módulo
- Logs de acesso

---

## 📝 Convenções de Rota

### Padrão
- Base: `/modules/{funcao}`
- Sub-módulos: `/modules/{funcao}/{sub-funcao}`
- Ações: `/modules/{funcao}/{sub-funcao}/{acao}`

### Nomes
- Usar kebab-case: `/modules/daily-management`
- Inglês técnico: `/modules/hr` (não `/modulos/rh`)
- Descritivos: `/modules/credit-alerts` (não `/modules/ca`)

### Status HTTP
- 200: OK - Página carregada com sucesso
- 404: Not Found - Rota não existe (para sub-módulos não implementados)

---

## 🚀 Próximas Implementações

1. **Sub-rotas CRUD**
   - GET /modules/{modulo}/{item}/{id} - Detalhes
   - POST /modules/{modulo}/{item} - Criar
   - PUT /modules/{modulo}/{item}/{id} - Editar
   - DELETE /modules/{modulo}/{item}/{id} - Deletar

2. **Rotas de Formulário**
   - GET /modules/{modulo}/new - Form criação
   - GET /modules/{modulo}/{id}/edit - Form edição

3. **API Routes**
   - `/api/modules/{modulo}` - Endpoints REST

4. **Autenticação**
   - `/auth/login` - Login
   - `/auth/logout` - Logout
   - `/auth/register` - Registro

---

**Total de Rotas Implementadas: 14 principais + estrutura para 50+ sub-rotas** ✅
