# COMECE AQUI - Guia Rápido

## 🎯 Em 5 Minutos, Tenha o Sistema Rodando

### Passo 1: Setup do Supabase (1 minuto)

1. Abra: https://app.supabase.com
2. Selecione seu projeto
3. Vá em **SQL Editor** (lado esquerdo)
4. Crie nova query
5. Copie todo o conteúdo de: `/scripts/supabase-clean-schema.sql`
6. Cole no SQL Editor
7. Clique **"Run"** (ou Ctrl+Enter)
8. Aguarde "Success" na resposta

✅ **Pronto! Base de dados criada e zerada**

---

### Passo 2: Verificar Integração (1 minuto)

A integração Supabase **já está ativa** no seu projeto v0.

Variáveis de ambiente estão configuradas:
- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅

**Nenhuma ação necessária!**

---

### Passo 3: Testar o Sistema (3 minutos)

1. Clique na Preview (canto superior direito)
2. Navegue para `/modules/batches/list`
3. Clique no botão **"Novo Lote"** (verde)

4. Preencha o formulário:
   ```
   Código do Lote: LOTE-001
   Tipo de Ave: Postura
   Quantidade: 5000
   Genética: Lohmann Brown
   Local: Galpão 1
   Data: 10/03/2024
   ```

5. Clique **"Criar Lote"**

6. Pronto! O lote foi salvo no Supabase

---

## ✨ Operações Disponíveis

### Listar Lotes
- Acesse: `/modules/batches/list`
- Vê todos os lotes cadastrados
- Tabela com edit/delete buttons

### Criar Novo Lote
- Clique: **Novo Lote** (verde)
- Preencha o formulário
- Salva no Supabase automaticamente

### Editar Lote
- Na tabela, clique no ícone **lápis** (edit)
- Modifique os dados
- Clique **"Salvar Alterações"**
- Volta para listagem

### Deletar Lote
- Na tabela, clique no ícone **lixo** (delete)
- Confirme na janela
- Remove do Supabase

---

## 📚 Documentação Completa

Para mais detalhes, leia:
- **`/GUIA_CRUD_COMPLETO.md`** - Guia técnico detalhado
- **`/IMPLEMENTACAO_CRUD_RESUMO.txt`** - Resumo visual
- **`/v0_plans/sleek-map.md`** - Plano técnico

---

## 🔧 Próximas Implementações

Módulos já com APIs prontas (só faltam as pages):

### Production (Produção)
```
/modules/production/list
/modules/production/create
/modules/production/[id]/edit
```

### Health (Saúde)
```
/modules/health/list
/modules/health/create
/modules/health/[id]/edit
```

### Costs (Custos)
```
/modules/costs/list
/modules/costs/create
/modules/costs/[id]/edit
```

### Employees (Funcionários)
```
/modules/employees/list
/modules/employees/create
/modules/employees/[id]/edit
```

**Padrão:** Copie de `batches` e adapte os campos!

---

## 🐛 Problemas?

### "Nenhum dado aparece"
- ✅ Verifique se executou o SQL no Supabase
- ✅ Recarregue a página
- ✅ Verifique o console (F12) para erros

### "Erro ao criar"
- ✅ Preencha TODOS os campos obrigatórios
- ✅ Datas no formato correto
- ✅ Números sem caracteres especiais

### "Botões não funcionam"
- ✅ Aguarde o carregamento (deve ser rápido)
- ✅ Verifique conexão internet
- ✅ Recarregue a página

---

## ✅ Checklist Final

- [ ] Executei o SQL no Supabase
- [ ] Acessei `/modules/batches/list`
- [ ] Criei um novo lote
- [ ] Editei o lote
- [ ] Deletei o lote
- [ ] Lote foi realmente deletado

Se tudo passou: **Parabéns! Sistema está 100% funcional** 🎉

---

## 📞 Precisa de Ajuda?

Cada página tem:
- ✅ Validação automática
- ✅ Mensagens de erro amigáveis
- ✅ Loading states
- ✅ Confirmação antes de deletar

Tudo foi pensado para facilitar o uso!

---

**Próximo passo:** Implementar Production, Health, Costs e Employees seguindo o mesmo padrão de Batches!
