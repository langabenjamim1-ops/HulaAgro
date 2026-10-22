# Como Resetar a Base de Dados no Supabase

## Passo 1: Acessar o Supabase

1. Vá para https://supabase.com/dashboard
2. Selecione seu projeto HULA AGRO
3. Clique em "SQL Editor" no menu lateral

## Passo 2: Executar o Script de Inicialização

1. No SQL Editor, clique em "New Query"
2. Copie todo o conteúdo do arquivo `/scripts/init-clean-db.sql`
3. Cole no editor SQL
4. Clique em "Run" (atalho: Ctrl+Enter ou Cmd+Enter)

## Passo 3: Verificar as Tabelas Criadas

Após executar o script, você verá as seguintes tabelas criadas:

- `farms` - Galpões/Fazendas
- `batches` - Lotes de aves
- `production_records` - Registros de produção
- `health_records` - Registros de saúde
- `cost_records` - Registros de custos
- `employee_records` - Registros de funcionários

## Passo 4: Testar no Navegador

1. Vá para o seu projeto em http://localhost:3000
2. Navegue até:
   - `/modules/batches/list` - Gestão de Lotes (deve estar vazio)
   - `/modules/health/records` - Registros de Saúde (deve estar vazio)
   - `/modules/hr/employees/list` - Funcionários (deve estar vazio)

## Características do Banco Zerado

✅ **Sem dados de seed** - Todas as tabelas estão vazias
✅ **Moeda em MZN** - Todos os campos monetários usam Metical
✅ **Estrutura completa** - Índices e RLS configurados
✅ **Pronto para CRUD** - Formulários funcionam com a base zerada

## Se Houver Erro

Se receber erro ao executar o script:

1. Verifique se você está na conta correta do Supabase
2. Confirme se o projeto está ativo
3. Se a tabela já existe, execute primeiro um `DROP TABLE IF EXISTS` para a tabela específica
4. Verifique os logs em Supabase > Logs

## Criando Dados Manualmente

Após resetar:

1. Vá para `/modules/batches/list`
2. Clique em "Novo Lote"
3. Preencha o formulário
4. Clique em "Criar Lote"

Os dados serão salvos automaticamente no Supabase!
