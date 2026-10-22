# GUIA DE USO COMPLETO - HULA AGRO

## 1. COMO COMEÇAR

### Acessar o Sistema
1. Abra a aplicação em `http://localhost:3000`
2. Você será redirecionado para `/dashboard`
3. Veja todos os módulos disponíveis

### Primeira Utilização
1. Crie um lote em "Gestão de Lotes" → "Criar Lote"
2. Preench e todos os campos obrigatórios
3. Clique em "Salvar"
4. Veja o lote aparecer na lista automaticamente

---

## 2. GESTÃO DE LOTES

### Criar Novo Lote
**Caminho**: `/modules/batches/create`

**Campos Obrigatórios**:
- Código do Lote (ex: LOTE-001)
- Tipo de Ave (Postura, Corte, Reprodução)
- Quantidade de Aves (número inteiro)
- Data de Início (padrão: hoje)

**Campos Opcionais**:
- Genética (raça/linhagem)
- Localização do Galpão
- Notas

**Após Salvar**: Será redirecionado para a lista automaticamente

### Listar Lotes
**Caminho**: `/modules/batches/list`

**Filtros Disponíveis**:
- Status: Todos, Ativo, Finalizado, Culminado
- Tipo de Ave: Todos, Postura, Corte, Reprodução
- Data Inicial: Selecionar data
- Data Final: Selecionar data

**Ações na Tabela**:
- Clicar na linha para ver detalhes
- Botão Editar (lápis) para atualizar
- Botão Deletar (lixeira) para remover

### Editar Lote
**Caminho**: `/modules/batches/[id]/edit`

- Todos os campos podem ser editados
- Clique em "Salvar" para atualizar

### Deletar Lote
- Clique no ícone de lixeira
- Confirme a ação na caixa de diálogo
- O lote será removido imediatamente

---

## 3. GESTÃO DE PRODUÇÃO

### Registrar Produção - Poedeiras
**Caminho**: `/modules/production/layers`

**Dados Registrados**:
- Data do registro (automático)
- Ovos produzidos (número)
- Taxa de postura (%)
- Mortalidade (número)

**Visualização**:
- Gráfico de tendência de ovos
- Taxa média de postura
- Total de mortalidade
- Tendência em percentual

**Ação**: Clique em "Novo Registro" para adicionar

### Registrar Produção - Corte
**Caminho**: `/modules/production/broilers`

**Dados Registrados**:
- Peso médio das aves (kg)
- Consumo de ração
- Conversão alimentar (FCR)

**Visualização**:
- Gráfico de ganho de peso
- Peso médio
- Tendência de crescimento

---

## 4. GESTÃO DE SAÚDE

### Medicamentos
**Caminho**: `/modules/health/medicines`

**Gerenciar Estoque**:
- Nome do medicamento
- Ingrediente ativo
- Fornecedor
- Quantidade em estoque
- Preço unitário (em MZN)
- Data de validade

**Ações**:
- Adicionar novo medicamento
- Editar informações
- Deletar quando expirar

### Doenças
**Caminho**: `/modules/health/diseases`

**Informações Registradas**:
- Nome da doença
- Sintomas (descrição)
- Forma de transmissão
- Período de incubação (dias)
- Taxa de mortalidade (%)
- Descrição do tratamento

### Quarentena
**Caminho**: `/modules/health/quarantine`

**Dados**:
- Lote ID (qual lote está em quarentena)
- Motivo (doença, suspeita, etc.)
- Número de aves
- Local (qual galpão)
- Status (Ativa, Concluída)
- Data de início

---

## 5. GESTÃO DE RECURSOS HUMANOS

### Funcionários
**Caminho**: `/modules/hr/employees/list`

**Informações Cadastradas**:
- Nome completo
- Cargo
- Email
- Telefone
- Data de contratação
- Salário (em MZN)
- Status (Ativo, Inativo)

### Folha de Pagamento
**Caminho**: `/modules/hr/payroll`

**Composição**:
- Salário base (em MZN)
- Descontos (em MZN)
- Bônus/Adicionais (em MZN)
- Salário líquido (calculado automaticamente)

**Período**: Mensal ou conforme necessário

### Férias
**Caminho**: `/modules/hr/vacation`

**Informações**:
- Funcionário
- Data início
- Data fim
- Total de dias
- Motivo (férias, licença, etc.)
- Status de aprovação (Pendente, Aprovado, Rejeitado)

### Contratos
**Caminho**: `/modules/hr/contracts`

**Tipos de Contrato**:
- Permanente
- Temporário
- Terceirizado
- PJ

**Dados**:
- Tipo de contrato
- Data de início
- Data de fim (ou indefinido)
- Cargo
- Salário (em MZN)

---

## 6. GESTÃO FINANCEIRA

### Custos
**Caminho**: `/modules/costs`

**Categorias**:
- Ração
- Medicamentos
- Utilidades (luz, água, gás)
- Mão de Obra
- Manutenção

**Registro**:
- Data do custo
- Categoria
- Descrição detalhada
- Valor (em MZN)
- Notas adicionais

**Filtros**:
- Por categoria
- Por período de data

### Compras
**Caminho**: `/modules/purchases`

**Informações**:
- Data da compra
- Fornecedor
- Descrição do item
- Quantidade
- Preço unitário (em MZN)
- Preço total (calculado automaticamente)

**Histórico Completo**: Todas as compras ficam registradas

### Suprimentos
**Caminho**: `/modules/supplies`

**Controle**:
- Nome do suprimento
- Categoria (Ração, Medicamentos, etc.)
- Quantidade em estoque
- Unidade (kg, litro, unidade)
- Nível mínimo recomendado
- Preço unitário (em MZN)
- Última atualização

**Alertas**:
- Sistema mostra quando está abaixo do mínimo

---

## 7. ANÁLISE E RELATÓRIOS

### Dashboard de Análise
**Caminho**: `/modules/production-analysis`

**Métricas Principais**:
- Total de ovos produzidos (período)
- Taxa média de postura (%)
- Mortalidade total
- Tendência de crescimento

**Filtros**:
- Data inicial
- Data final
- Tipo de análise (Diária, Semanal, Mensal)

**Gráficos**:
- Linha para tendências
- Barras para comparativos

---

## 8. HULA AGRO - APRESENTAÇÃO

### Página Principal
**Caminho**: `/hula-agro`

**Conteúdo**:
- Visão geral da plataforma
- 6 funcionalidades essenciais
- 6 diferenciais avançados
- Arquitetura integrada
- Imagem heroica da solução

**Ideal para**:
- Apresentar a investidores
- Demonstrar para novos usuários
- Marketing da solução

---

## 9. DICAS E BOAS PRÁTICAS

### Entrada de Dados
- ✅ Preencha todos os campos marcados com *
- ✅ Use datas no formato: DD/MM/YYYY
- ✅ Valores monetários: sempre em MZN
- ✅ Números: inteiros ou decimais conforme necessário

### Filtros
- ✅ Use data inicial E final para melhor precisão
- ✅ Combine múltiplos filtros
- ✅ Clique "Limpar Filtros" para reset

### Backup de Dados
- ✅ Os dados são sincronizados em tempo real com Supabase
- ✅ Nenhuma perda de dados (servidor como backup)

### Performance
- ✅ Se a página estiver lenta, recarregue (F5)
- ✅ Feche abas desnecessárias
- ✅ Limpe cache do navegador se houver problemas

---

## 10. FUNCIONALIDADES AVANÇADAS

### Sincronização em Tempo Real
- Dados criados/editados aparecem automaticamente em outra abas
- Não precisa recarregar manualmente
- Sincronização com Supabase instantânea

### Formatação de Moeda
- Todos os valores monetários são automaticamente em MZN
- Formato: MZN 1.234,56
- Conversão automática em cálculos

### Datas em Português
- Todas as datas aparecem em português (pt-BR)
- Formato: 17/04/2026
- Seletor de data intuitivo

### Responsividade
- Funciona em desktop, tablet e mobile
- Interface adapta automaticamente
- Toque para ações no mobile

---

## 11. TROUBLESHOOTING

### Erro: "Dados não carregam"
**Solução**: 
1. Recarregue a página (F5)
2. Verifique conexão com internet
3. Limpe cache do navegador

### Erro: "Falha ao salvar"
**Solução**:
1. Verifique se todos os campos obrigatórios estão preenchidos
2. Verifique formato dos dados (datas, números)
3. Tente novamente em alguns segundos

### Erro: "Tabela vazia"
**Solução**:
1. Clique em "Limpar Filtros"
2. Verifique se existem registros (crie um teste)
3. Atualize a página

### Lentidão
**Solução**:
1. Feche outras abas
2. Limpe cache: Ctrl+Shift+Delete
3. Desative extensões do navegador

---

## 12. ATALHOS E DICAS RÁPIDAS

### Teclado
- `Ctrl+F` - Buscar na página
- `F5` - Recarregar página
- `Ctrl+Shift+Delete` - Limpar cache
- `Ctrl+,` - Abrir DevTools

### Mouse
- Clique duplo em uma linha da tabela para editar
- Clique direito para ver opções do navegador
- Scroll para rolar tabelas

---

## 13. EXPORTAÇÃO DE DADOS

**Planejado para Versão 2.0**:
- Export para CSV
- Export para PDF
- Export para Excel

**Atual**: Você pode usar Print Screen (Ctrl+P) para salvar como PDF

---

## 14. SUPORTE E AJUDA

### Documentação
- `/STATUS_FINAL_DO_PROJETO.md` - Status técnico completo
- `/v0_plans/sleek-map.md` - Plano de implementação

### Contato
- Email: suporte@hulaaagro.com
- Telefone: +258 21 XXX XXXX
- WhatsApp: +258 84 XXX XXXX

---

**Versão do Guia**: 1.0
**Atualizado em**: Abril 2026
**Próxima Atualização**: Quando novas funcionalidades forem lançadas
