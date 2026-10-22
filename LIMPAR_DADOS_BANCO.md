# Como Limpar Dados de Demo do Banco HULA Agro

## 🗑️ Procedimento Completo

### Opção 1: Via Supabase Dashboard (Recomendado)

#### Passo 1: Acessar Supabase
1. Abra [https://app.supabase.com](https://app.supabase.com)
2. Faça login com sua conta
3. Selecione seu projeto "HULA Agro"

#### Passo 2: Abrir SQL Editor
1. Na barra lateral esquerda, clique em **SQL Editor**
2. Clique em **New Query**

#### Passo 3: Copiar o Script
1. Abra o arquivo `/scripts/cleanup-demo-data.sql` no seu editor
2. Copie **TODO** o conteúdo do arquivo

#### Passo 4: Executar o Script
1. Cole o conteúdo na janela SQL do Supabase
2. Clique no botão **Run** (ou pressione `Ctrl + Enter`)
3. Aguarde a mensagem de sucesso

#### Passo 5: Verificar Resultado
Você verá uma tabela mostrando:
```
Status: Limpeza Concluída

Tabela                  Registros
─────────────────────────────────
Lotes                   0
Produção                0
Funcionários            0
Registros de Saúde      0
Registros Financeiros   0
```

---

### Opção 2: Via Arquivo SQL

#### Passo 1: Preparar Arquivo
```bash
# Seu arquivo SQL está em:
/scripts/cleanup-demo-data.sql
```

#### Passo 2: No Supabase
1. Abra Supabase Dashboard → SQL Editor
2. Clique em "New Query"
3. Copie/Cole o conteúdo do arquivo
4. Clique em "Run"

---

## ⚠️ Aviso Importante

### Dados Afetados:
Este script **REMOVE PERMANENTEMENTE**:
- ✅ Todos os lotes (batches)
- ✅ Todos os registros de produção
- ✅ Todos os consumos de ração
- ✅ Todos os registros de mortalidade
- ✅ Todos os registros de saúde
- ✅ Todos os registros ambientais
- ✅ Todos os registros financeiros
- ✅ Todos os itens de inventário
- ✅ Todos os funcionários

### Dados Preservados:
Este script **NÃO remove**:
- ✅ Estrutura das tabelas (schemas)
- ✅ Configurações do sistema
- ✅ Usuários (users/auth)
- ✅ Permissões e RLS policies

---

## 🔄 Se Algo Deu Errado

### Erro 1: "Permission denied"
```
Solução: Verifique se você tem permissão de "Administrador" no Supabase
```

### Erro 2: "Sequence does not exist"
```
Solução: O banco não tem as sequências esperadas. Ignore este erro.
```

### Erro 3: "Foreign key constraint violation"
```
Solução: O script já desabilita triggers. Execute novamente.
```

### Recuperar Dados (Se precisar)
Infelizmente, não há backup automático. Se executou por engano:

1. **Supabase**: Verifique se há backups automáticos
   - Supabase → Backups (aba superior)
   - Se existir, restaure a partir daí

2. **Banco de Dados Manual**: 
   - Se tem backup externo, restaure-o

---

## ✅ Confirmar Limpeza

### Verificar via Dashboard:
```sql
-- Execute no SQL Editor para confirmar
SELECT 'Lotes' as Tabela, COUNT(*) as Total FROM batches
UNION ALL
SELECT 'Produção', COUNT(*) FROM production_records
UNION ALL
SELECT 'Consumo', COUNT(*) FROM feed_consumption
UNION ALL
SELECT 'Saúde', COUNT(*) FROM health_records
UNION ALL
SELECT 'Financeiro', COUNT(*) FROM financial_records;
```

**Resultado esperado:** Todas as linhas mostram 0

### Verificar via Aplicação:
```
1. Abra o HULA Agro no navegador
2. Dashboard deve mostrar "Nenhum dado disponível"
3. KPIs devem exibir "-"
4. Gráficos devem estar vazios
```

---

## 🚀 Próximos Passos Após Limpeza

### 1. Inserir Primeiro Lote
```
1. Acesse: Módulos → Gestão de Lotes
2. Clique em "Criar Novo Lote"
3. Preencha os dados:
   - Nome: "Lote 001"
   - Data: Hoje
   - Quantidade: 1000 aves
4. Salve
```

### 2. Registrar Produção
```
1. Acesse: Módulos → Produção
2. Selecione seu lote
3. Registre quantidade de ovos
```

### 3. Ver Dados Aparecerem
```
Dashboard agora mostrará:
✅ KPIs com valores reais
✅ Gráficos populados
✅ Filtros funcionando
```

---

## 📋 Script de Limpeza Detalhado

### O que o script faz:

```sql
1. BEGIN; ← Inicia transação (tudo ou nada)

2. Desabilita triggers de integridade referencial
   ALTER TABLE ... DISABLE TRIGGER ALL;

3. Deleta dados em ordem de dependência
   DELETE FROM production_records;
   DELETE FROM feed_consumption;
   ...

4. Reseta sequências de auto-increment
   ALTER SEQUENCE batches_id_seq RESTART WITH 1;
   ...

5. Reabilita triggers
   ALTER TABLE ... ENABLE TRIGGER ALL;

6. COMMIT; ← Confirma mudanças

7. Verifica resultado com SELECT
```

---

## 🔐 Backup Preventivo

### Antes de Executar (Recomendado):

#### No Supabase:
1. Vá para **Project Settings** → **Backups**
2. Clique em **Take Manual Backup**
3. Nomeie como "Pre-Cleanup-2026-03-09"
4. Execute a limpeza

#### Restaurar de Backup:
1. **Project Settings** → **Backups**
2. Encontre seu backup
3. Clique em **Restore**
4. Confirme

---

## ✅ Checklist de Segurança

- [ ] Fiz backup manual no Supabase
- [ ] Verifiquei que nenhum usuário está usando o sistema
- [ ] Copiei exatamente TODO o arquivo `/scripts/cleanup-demo-data.sql`
- [ ] Sou administrador do projeto Supabase
- [ ] Executei o script e verifiquei o resultado
- [ ] Confirmei que todos os dados foram removidos
- [ ] Sistema agora mostra estado vazio

---

## 📞 FAQ

**P: Posso recuperar dados após limpeza?**
R: Somente se tiver backup. Use `Project Settings → Backups` no Supabase.

**P: O script é lento?**
R: Não. Executa em segundos mesmo com muitos registros.

**P: Preciso parar a aplicação antes de limpar?**
R: Não necessário, mas recomendado se ninguém estiver usando.

**P: Posso limpar apenas uma tabela?**
R: Sim, edite o script e remova as outras linhas `DELETE`.

**P: Onde fica o arquivo de limpeza?**
R: `/scripts/cleanup-demo-data.sql` na raiz do projeto.

---

**Status:** ✅ Pronto para usar
**Última atualização:** 09/03/2026
