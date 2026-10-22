# HULA Agro - Supabase Database Setup

## 🗄️ Inicializar Base de Dados Limpa com Metical

### Passo 1: Acessar Supabase SQL Editor
1. Acesse https://supabase.com e faça login
2. Selecione seu projeto HULA Agro
3. Vá para **SQL Editor** no menu lateral esquerdo

### Passo 2: Executar Script de Setup
1. Crie uma nova query clicando em "New Query"
2. Copie todo o conteúdo do arquivo: `/scripts/setup-supabase-clean.sql`
3. Cole no editor SQL
4. Clique em **"Run"** (ou pressione Ctrl+Enter)
5. Aguarde a execução completar (deve dizer "Success")

### Passo 3: Verificar Tabelas
Após a execução bem-sucedida, você verá as seguintes tabelas criadas:
- ✅ `farms` - Informações das granjas
- ✅ `users` - Usuários do sistema
- ✅ `batches` - Lotes de aves
- ✅ `production_records` - Registros de produção
- ✅ `health_records` - Registros de saúde
- ✅ `environment_records` - Registros de ambiente
- ✅ `employees` - Funcionários
- ✅ `purchases` - Compras (em Metical)
- ✅ `costs` - Custos operacionais (em Metical)

### 💰 Moeda: Metical (MZN)
Todos os campos de valores monetários usam Metical (MZN):
- `salary_mzn` - Salários em MZN
- `unit_price_mzn` - Preços unitários em MZN
- `total_price_mzn` - Totais em MZN
- `amount_mzn` - Valores em MZN

### 🔒 Segurança (RLS)
Row Level Security foi ativado em todas as tabelas. Configure políticas RLS conforme necessário para seu projeto.

### 📊 Estrutura de Dados

#### Farms
```sql
- id (UUID)
- name (VARCHAR)
- location (VARCHAR)
- capacity_birds (INTEGER)
- currency (VARCHAR) - Padrão: MZN
```

#### Production Records
```sql
- batch_id (UUID)
- record_date (DATE)
- eggs_produced (INTEGER)
- eggs_classified_a, eggs_classified_b (INTEGER)
- mortality_count (INTEGER)
- feed_consumed_kg (DECIMAL)
- fcr_ratio (DECIMAL) - Feed Conversion Ratio
```

#### Health Records
```sql
- batch_id (UUID)
- record_date (DATE)
- vaccination_type (VARCHAR)
- medication_type (VARCHAR)
- observation (TEXT)
- veterinarian_name (VARCHAR)
```

#### Costs & Purchases
```sql
- amount_mzn / total_price_mzn (DECIMAL) - Em Metical
- payment_status (VARCHAR) - pendente, pago
- cost_type (VARCHAR) - feed, operational, health, etc
```

### 🆘 Troubleshooting

**Erro: "Relation already exists"**
- O script already exista e as tabelas foram criadas
- Não há problema, continuar é seguro

**Erro: "Permission denied"**
- Certifique-se de estar autenticado no Supabase
- Verifique se tem permissões de admin no projeto

**Erro: "Syntax error"**
- Verifique se copiou todo o script corretamente
- Tente executar em partes se necessário

### 📝 Próximos Passos
1. Configure as políticas RLS conforme suas necessidades
2. Atualize as variáveis de ambiente no seu projeto v0
3. Comece a adicionar dados através da aplicação
4. Os módulos rápidos agora mostram submenus melhorados com imagens

---

**Data de Criação:** 2026-03-09
**Moeda:** Metical (MZN)
**Status:** ✅ Pronto para uso
