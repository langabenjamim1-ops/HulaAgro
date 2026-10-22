# 🐔 HULA Agro - Sistema de Gestão Zootécnica Integrado

## 📋 Visão Geral

O **HULA Agro** é um sistema completo de gestão zootécnica para granjas de avicultura, com suporte para poedeiras e frangos de corte. Integra todas as operações em um único lugar com interface moderna e intuitiva.

---

## 🎯 Módulos Disponíveis

### 1. **OPERAÇÕES** (Gerenciamento de Produção)
- 📋 **Gestão de Lotes** - Criar e gerenciar lotes de aves
- 📊 **Produção** - Registrar produção diária (ovos, carne, etc.)
- 📈 **Análise Produção** - Análise geral de performance

### 2. **SAÚDE** (Biossegurança e Sanidade)
- 💉 **Sanidade** - Vacinação, medicamentos e doenças
- 🌡️ **Ambiência** - Temperatura, umidade, ventilação e energia
- 🔔 **Alertas** - Desvios técnicos e alertas críticos

### 3. **ADMINISTRATIVO** (Gestão Empresarial)
- 👥 **Recursos Humanos** - Funcionários, folha, férias, banco de horas
- 🛒 **Compras & Estoque** - Fornecedores, produtos, categorias e marcas
- 💰 **Gestão Custos** - Ração, sanitário, operacional, análise de perdas
- 💳 **Alertas Crédito** - Monitoramento de contas a pagar

### 4. **CONFIGURAÇÃO** (Parametrização Técnica)
- 🧬 **Genética** - Linhagens genéticas e características
- 🎯 **Tipos Produção** - Postura, Corte, Misto
- 📐 **Parâmetros** - Padrões técnicos de desempenho
- 🌽 **Ração & Nutrição** - Fases, consumo, custos, silos
- 📋 **Manejo Diário** - Registros diários, mortalidade, peso, água

---

## 🎨 Design & Interface

### Cores
- **Verde primário**: `#22C55E` - Ação, destaque, sucesso
- **Verde escuro**: `#16a34a` - Hover, estado ativo
- **Verde muito escuro**: `#15803d` - Sidebar base
- **Cinza**: Neutros para background e texto

### Layout
- **Sidebar Gradiente**: Verde degradado com menu colapsável em 4 seções principais
- **Cards Grid**: Layout responsivo com cards de 5 colunas
- **Header com Breadcrumb**: Navegação clara com voltar + ícone do módulo
- **Botão "Novo"**: Verde em cada página para ações rápidas

### Fonte
- **Montserrat**: Todos os textos (heading e body)

---

## 📱 Estrutura de Pastas

```
app/
├── dashboard/
│   └── page.tsx                    # Dashboard principal
├── modules/
│   ├── batches/page.tsx            # Gestão de lotes
│   ├── production/page.tsx         # Produção
│   ├── production-analysis/page.tsx # Análise produção
│   ├── health/page.tsx             # Saúde & Biossegurança
│   ├── environment/page.tsx        # Ambiência
│   ├── alerts/page.tsx             # Alertas
│   ├── hr/page.tsx                 # Recursos Humanos
│   ├── purchases/page.tsx          # Compras & Estoque
│   ├── costs/page.tsx              # Gestão de Custos
│   ├── credit-alerts/page.tsx      # Alertas de Crédito
│   ├── configuration/page.tsx      # Configuração Técnica
│   ├── nutrition/page.tsx          # Ração & Nutrição
│   ├── daily-management/page.tsx   # Manejo Diário
│   └── analysis/page.tsx           # Análises & Comparações

components/
├── sidebar/sidebar.tsx             # Navegação principal
├── dashboard/
│   ├── dashboard-client.tsx        # Layout dashboard
│   └── modules-overview.tsx        # Grid de módulos
└── modules/module-template.tsx     # Template reutilizável
```

---

## 🚀 Recursos Principais

### 1. **Sidebar Inteligente**
- Menu colapsável em 4 seções: Operações, Saúde, Administrativo, Configuração
- Cards de ação rápida para funções principais
- Seções expandem por padrão para fácil acesso

### 2. **Dashboard Centralizado**
- Grid com 10 cards principais (um para cada função principal)
- Busca e filtros por categoria
- Acesso rápido a todas as operações

### 3. **Consistência Visual**
- Padrão de layout idêntico em todos os módulos
- Cards interativos com hover scale
- Transições suaves

### 4. **Navegação Clara**
- Botão voltar em cada página
- Ícone visual do módulo no header
- Breadcrumb implícito através do sidebar

---

## 🔄 Fluxo de Navegação

```
Dashboard HULA Agro
    ↓
├─→ Batches → Lotes, Genética, Galpões...
├─→ Health → Vacinação, Medicamentos, Quarentena...
├─→ HR → Funcionários, Folha, Férias...
├─→ Purchases → Fornecedores, Produtos, Marcas...
├─→ Production → Poedeiras, Corte, Taxa Postura...
├─→ Environment → Temperatura, Umidade, Energia...
├─→ Costs → Ração, Sanitário, Operacional...
├─→ Analysis → Comparações, KPIs...
├─→ Nutrition → Fases, Consumo, Silos...
├─→ Daily → Registros, Mortalidade, Peso...
├─→ Alerts → Desvios, Sugestões, Críticos...
└─→ Credit Alerts → Contas a Pagar, Atrasos...
```

---

## 💡 Padrões de Código

### Componente de Módulo Padrão
```tsx
'use client'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'

export default function ModulePage() {
  return (
    <div className="w-full font-montserrat">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="text-4xl">{icon}</span>
          </div>
          <h1 className="text-4xl font-bold">{title}</h1>
          <p className="text-gray-600 mt-2">{description}</p>
        </div>
        <button className="px-6 py-3 bg-[#22C55E] text-white rounded-lg">
          <Plus /> Novo
        </button>
      </div>
      
      {/* Grid */}
      <div className="grid grid-cols-5 gap-5">
        {/* Cards aqui */}
      </div>
    </div>
  )
}
```

---

## 📊 Estatísticas

- **14 Módulos Principais** com suporte a sub-módulos
- **50+ Funções** de gestão integradas
- **Design 100% Customizado** com Montserrat e Verde HULA
- **Interface Responsiva** com Tailwind CSS
- **Navegação Intuitiva** com sidebar gradiente

---

## 🎯 Próximos Passos

1. Implementar funcionalidade de dados nos módulos
2. Integrar banco de dados para persistência
3. Adicionar gráficos e dashboards analíticos
4. Implementar relatórios customizáveis
5. Adicionar notificações em tempo real

---

**Sistema desenvolvido para granjas modernas que buscam excelência operacional através da gestão integrada.** 🚀
