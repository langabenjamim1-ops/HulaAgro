# Executar Schema SQL no Supabase

## Status: PRONTO PARA EXECUTAR

O ficheiro SQL completo foi criado e testado. Segue este guia para executar em Supabase.

## Passo a Passo

### 1. Aceder ao Supabase SQL Editor

```
https://app.supabase.com
→ Selecione seu projeto
→ Clique em "SQL Editor" (lado esquerdo)
→ Clique em "New Query"
```

### 2. Copiar o SQL Completo

Abra o ficheiro:
```
supabase/migrations/00_hula_agro_complete_schema.sql
```

Copie TODO o conteúdo.

### 3. Colar no SQL Editor

- No SQL Editor do Supabase, clique na caixa de texto
- Cole o SQL completo (Ctrl+V ou Cmd+V)

### 4. Executar

Clique no botão **"RUN"** no canto superior direito.

### 5. Aguardar Conclusão

Irá aparecer uma progressão de status:
- Azul: Processando
- Verde: Sucesso
- Vermelho: Erro

Aguarde 2-5 minutos pela conclusão completa.

## O Que Será Criado

### 19 Tabelas:
1. `tenants` - Clientes (SaaS)
2. `profiles` - Utilizadores
3. `farms` - Galpões
4. `batches` - Lotes
5. `genetics` - Genética das aves
6. `production_records` - Produção
7. `health_records` - Saúde
8. `medications` - Medicamentos
9. `diseases` - Doenças
10. `medication_shortage` - Carência de medicamentos
11. `cost_records` - Custos
12. `employee_records` - Funcionários
13. `payroll` - Folha de pagamento
14. `vacation` - Férias
15. `contracts` - Contratos
16. `purchases` - Compras
17. `environmental_monitoring` - Monitoramento ambiental
18. `alerts` - Alertas
19. `deviations` - Desvios técnicos
20. `suggestions` - Sugestões de IA
21. `decision_history` - Histórico de decisões

### 11 Índices de Performance

### RLS Policies (Multi-tenant)
- Cada tabela tem policies de isolamento por tenant
- Usuários só veem dados de seu próprio tenant

## Verificar Após Execução

```sql
-- Listar todas as tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Contar tabelas (deve ser 21)
SELECT COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public';
```

## Troubleshooting

### Erro: "relation already exists"
- Significa que as tabelas já existem
- Solução: Elimine as tabelas antigas primeiro ou use um projeto novo

### Erro: "permission denied"
- Verifique que está no SQL Editor (não em uma função)
- Confirme que tem permissões de admin no projeto

### Erro: "syntax error"
- Rara chance de erro no script
- Contacte suporte com a mensagem exata

## Próximo Passo

Após execução bem-sucedida:

1. Teste as APIs criadas (já estão prontas)
2. Comece a inserir dados através da aplicação
3. As policies RLS garantem isolamento multi-tenant

## Status Final

✅ Schema pronto
✅ 21 tabelas
✅ 11 índices
✅ RLS policies
✅ Sem dados demo
✅ Pronto para produção

Tempo estimado de execução: 2-5 minutos
