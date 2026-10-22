# 📖 Guia de Uso - HULA Agro

## 🚀 Começando

### Acesso ao Sistema
```
URL: http://localhost:3000/dashboard
```

### Primeira Vez?
1. O sistema abre no **Dashboard Principal**
2. Você verá um grid com **10 cards principais** (cada um representa um módulo)
3. Ao lado, há um **Sidebar Verde** com menu navegável

---

## 🎯 Como Usar o Dashboard

### Card de Módulo
```
┌─────────────────────┐
│      📋 Ícone      │
├─────────────────────┤
│   Título Módulo     │
│  Descrição breve    │
└─────────────────────┘
  (Clique para entrar)
```

### Filtros
- Use as tags abaixo de "Sugestões Rápidas" para filtrar módulos
- Exemplo: Clique em "Lotes" para ver módulos relacionados

### Busca
- Digite na barra de busca para encontrar funções
- Exemplo: Digite "RH" para encontrar Recursos Humanos

---

## 📑 Navegação com Sidebar

### Expandir/Recolher Seção
```
Clique em:
├─ OPERAÇÕES        (4 itens)
├─ SAÚDE            (3 itens)
├─ ADMINISTRATIVO   (4 itens)
└─ CONFIGURAÇÃO     (3 itens)
```

### Acessar Módulo pelo Sidebar
1. Expanda a seção desejada
2. Clique no nome do módulo
3. Você será levado à página do módulo

### Cards de Ação Rápida
- 4 cards no topo do sidebar
- Acesso rápido aos módulos mais usados
- Clique para ir direto ao módulo

---

## 📋 Dentro de um Módulo

### Estrutura de Página
```
┌─────────────────────────────────────────────────────┐
│ ← Dashboard  🐔  Título Módulo      [+ Novo]       │  Header
├─────────────────────────────────────────────────────┤
│ Descrição e funcionalidades do módulo              │
├─────────────────────────────────────────────────────┤
│ ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  │
│ │Sub 1 │  │Sub 2 │  │Sub 3 │  │Sub 4 │  │Sub 5 │  │  Grid
│ └──────┘  └──────┘  └──────┘  └──────┘  └──────┘  │
│                                                      │
│ ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  │
│ │Sub 6 │  │Sub 7 │  │Sub 8 │  │Sub 9 │  │Sub10 │  │
│ └──────┘  └──────┘  └──────┘  └──────┘  └──────┘  │
└─────────────────────────────────────────────────────┘
```

### Botão Voltar
- Clique em **← Dashboard** no canto superior esquerdo
- Retorna ao dashboard principal

### Botão Novo
- Clique em **[+ Novo]** no canto superior direito
- Abre formulário para criar novo item (planejado)

### Cards de Sub-módulo
- Cada card representa uma funcionalidade
- Clique para acessar (estrutura pronta para dados)
- Hover: Card sobe com sombra

---

## 📱 Responsividade

### Em Desktop
- Sidebar sempre visível (72px de largura)
- Conteúdo ocupa resto da tela
- Grid: 5 colunas

### Em Tablet
- Sidebar pode ficar colapsado (planejado)
- Grid: Até 4-5 colunas

### Em Mobile
- Sidebar colapsa em menu (planejado)
- Grid: 1-2 colunas

---

## 🎨 Visual & Cores

### Cores do Sistema
```
Ações Principais:   Verde Brilhante  #22C55E  ← Clique neles
Hover:              Verde Escuro     #16a34a  ← Card sobe
Sidebar:            Verde Gradiente  Degradé de verdes
Cards:              Branco           Com borda cinza
Texto:              Cinza escuro     #333333
```

### Ícones
- 🐔 HULA Agro (logo do sistema)
- Cada módulo tem seu ícone específico
- Ícones são emojis para fácil identificação

---

## 🗂️ Estrutura de Módulos

### Exemplo: Gestão de Lotes
```
Dashboard
    ↓
    [📋 Gestão de Lotes]
        ↓
        Página de Lotes
        ├─ [Criar Lote]
        ├─ [Lista de Lotes]
        ├─ [Gestão Galpões]
        └─ [Associar Genética]
            ↓
            (Futuros sub-módulos)
```

### Todos os Módulos Seguem Este Padrão
- Hub principal com cards de sub-funções
- Cada sub-função com sua própria página (planejado)
- Navegação consistente em todo sistema

---

## 📊 Lista de Módulos & O Que Fazem

### 🔄 OPERAÇÕES
| Módulo | O Que Faz | Ícone |
|--------|-----------|-------|
| Gestão de Lotes | Criar e gerenciar lotes de aves | 📋 |
| Produção | Registrar produção diária | 📊 |
| Análise Produção | Analisar performance | 📈 |
| Análises | Comparar lotes, rações, genética | 📊 |

### 💉 SAÚDE
| Módulo | O Que Faz | Ícone |
|--------|-----------|-------|
| Sanidade | Vacinação, medicamentos, doenças | 💉 |
| Ambiência | Temperatura, umidade, ventilação | 🌡️ |
| Alertas | Desvios técnicos e críticos | 🔔 |

### 👥 ADMINISTRATIVO
| Módulo | O Que Faz | Ícone |
|--------|-----------|-------|
| RH | Funcionários, folha, férias | 👥 |
| Compras | Fornecedores, produtos, estoque | 🛒 |
| Custos | Análise de custos operacionais | 💰 |
| Alertas Crédito | Contas a pagar, atrasos | 💳 |

### ⚙️ CONFIGURAÇÃO
| Módulo | O Que Faz | Ícone |
|--------|-----------|-------|
| Configuração | Genética, tipos produção, parâmetros | ⚙️ |
| Nutrição | Fases, consumo, custos, silos | 🌽 |
| Manejo Diário | Registros, mortalidade, peso | 📋 |

---

## 🔍 Busca e Filtros

### Como Usar a Busca
```
1. Vá para o Dashboard
2. Clique na barra "Buscar funções..."
3. Digite o que procura:
   - "RH" → Mostra módulo de Recursos Humanos
   - "Lotes" → Mostra módulo de Gestão de Lotes
   - "Saúde" → Mostra módulo de Sanidade
4. Os cards se filtram automaticamente
```

### Tags de Filtro
```
[Lotes] [Produção] [Saúde] [RH] [Compras]
[Custos] [Nutrição] [Análise] [Ambiente] [Alertas]

Clique em qualquer tag para filtrar
```

### Botão "Mais Filtros"
- Abre opções avançadas (planejado)
- Filtrar por categoria, status, etc.

---

## ⌨️ Atalhos Planejados

```
[Em desenvolvimento]

Atalhos de teclado:
- Ctrl+K: Abrir busca
- Ctrl+1 a Ctrl+9: Ir para módulo 1-9
- Home: Voltar ao Dashboard
- Esc: Fechar modal/formulário
```

---

## ❓ FAQ - Perguntas Frequentes

### P: Como faço para criar um novo lote?
**R:** Vá para Gestão de Lotes → clique [+ Novo] → preencha o formulário (em desenvolvimento)

### P: Onde vejo os custos da operação?
**R:** Vá para Gestão de Custos → escolha a categoria (Ração, Sanitário, Operacional)

### P: Como gerencio funcionários?
**R:** Vá para Recursos Humanos → escolha (Funcionários, Folha, Férias, etc.)

### P: Posso acessar de celular?
**R:** Sim! O layout é responsivo (otimizações em desenvolvimento)

### P: Os dados são salvos automaticamente?
**R:** Sim, quando você salva um formulário, os dados são persistidos (integração em desenvolvimento)

### P: Como faço backup dos dados?
**R:** Sistema → Relatórios → Exportar (funcionalidade em desenvolvimento)

---

## 🆘 Troubleshooting

### O sidebar não abre
```
Solução: Recarregue a página (F5)
```

### Cards não aparecem
```
Solução: Limpe o cache (Ctrl+Shift+Delete)
       Ou reabra o navegador
```

### Link não funciona
```
Verifique: 
- Se está clicando no card certo
- Se a URL está correta
- Se o módulo está implementado
```

### Página em branco
```
Solução: Clique em "← Dashboard" para voltar
       Atualize a página
```

---

## 📚 Documentação Técnica

### Arquivos de Documentação
- `SISTEMA_HULA_AGRO.md` - Visão geral do sistema
- `IMPLEMENTACAO_COMPLETA.md` - O que foi feito
- `ROTAS_HULA_AGRO.md` - Mapa de rotas
- `VISUAL_SUMMARY.txt` - Resumo visual ASCII

### Estrutura de Pastas
```
app/
├── dashboard/page.tsx
└── modules/
    ├── batches/page.tsx
    ├── health/page.tsx
    ├── hr/page.tsx
    ├── purchases/page.tsx
    ├── production/page.tsx
    ├── costs/page.tsx
    ├── configuration/page.tsx
    ├── nutrition/page.tsx
    ├── environment/page.tsx
    ├── daily-management/page.tsx
    ├── alerts/page.tsx
    ├── credit-alerts/page.tsx
    ├── analysis/page.tsx
    └── production-analysis/page.tsx

components/
├── sidebar/sidebar.tsx
└── dashboard/
    ├── dashboard-client.tsx
    └── modules-overview.tsx
```

---

## 🎓 Dicas & Boas Práticas

### Organizar Seu Trabalho
1. Use o Sidebar para agrupar por tipo de tarefa
2. Abra múltiplos módulos em abas diferentes
3. Volta ao Dashboard entre módulos para manter contexto

### Usando a Busca
- Busque por tarefa, não por módulo
- Exemplo: "Registrar aves" em vez de "Batches"
- Use tags quando souber a categoria

### Mobile First
- Teste em celular primeiro
- Use portrait orientation
- Widgets devem ser toques grandes

---

## 📞 Suporte

### Feedback
- Encontrou um bug? Reporte em ISSUES
- Tem sugestão? Vá para DISCUSSIONS
- Quer contribuir? Faça um PULL REQUEST

### Contato
- Email: suporte@hulaagro.com.br
- Telefone: +55 (XX) XXXXX-XXXX
- Suporte 24/7 para granjas clientes

---

**Bem-vindo ao HULA Agro! Qualquer dúvida, consulte a documentação ou contate o suporte.** 🚀

*Última atualização: 2026-02-16*
