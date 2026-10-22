# HULA AGRO - Schema SQL Completo

## Resumo Executivo

Esta é a schema completa de produção para HULA AGRO. Consolida todos os scripts anteriores em um único ficheiro pronto para execução.

**Status:** ✅ Pronto para Produção  
**Tabelas:** 21  
**Políticas RLS:** 21 (isolamento multi-tenant)  
**Índices:** 11 (performance otimizada)  
**Tamanho:** ~500 linhas SQL  

## Estrutura de Dados

### Camada 1: Tenancy (SaaS)
```
tenants              (clientes/organizações)
  └─ profiles        (utilizadores com roles)
```

### Camada 2: Núcleo Operacional
```
farms               (galpões)
  ├─ batches        (lotes de aves)
  │   ├─ production_records
  │   ├─ health_records
  │   ├─ genetics
  │   └─ environmental_monitoring
  ├─ employee_records
  ├─ cost_records
  ├─ purchases
  └─ alerts
```

### Camada 3: Saúde & Higiene
```
health_records
  ├─ medications
  ├─ diseases
  ├─ medication_shortage
  └─ deviations
```

### Camada 4: RH & Recursos
```
employee_records
  ├─ payroll
  ├─ vacation
  └─ contracts
```

### Camada 5: Análise & IA
```
suggestions
  └─ decision_history
```

## Tabelas em Detalhe

### 1. tenants
Multi-tenant SaaS. Cada cliente é um tenant.
- `id` UUID
- `name` VARCHAR(255)
- `plan` 'free', 'premium', 'enterprise'
- `farms_limit` Número máximo de galpões

### 2. profiles
Utilizadores do sistema.
- `id` UUID (referencia auth.users)
- `tenant_id` UUID (qual tenant)
- `role` 'admin', 'manager', 'operator', 'viewer'
- `full_name` VARCHAR(255)

### 3. farms
Galpões/explorações.
- `id` UUID
- `tenant_id` UUID
- `farm_name` VARCHAR(255)
- `location` VARCHAR(255)
- `total_capacity` INT
- `farm_manager`, `phone`, `email`

### 4. batches
Lotes de aves (grupos de aves com ciclo de vida).
- `batch_code` Código único (ex: "LOT-2024-001")
- `bird_type` 'layers', 'broilers', 'breeders'
- `birds_count` INT
- `start_date`, `end_date` DATE
- `status` 'active', 'finished', 'ended'

### 5. genetics
Genética das aves (raças/linhas genéticas).
- `genetic_code` Código único
- `genetic_name` Nome comercial
- `bird_type`
- `origin`, `characteristics`

### 6. production_records
Registos diários de produção.
- `record_date` DATE
- `eggs_produced` INT
- `laying_rate` DECIMAL (%)
- `mortality_count` INT
- `average_weight` DECIMAL
- `feed_consumption`, `water_consumption` DECIMAL

### 7. health_records
Registos de saúde dos lotes.
- `health_status` 'healthy', 'illness', 'treatment', 'quarantine'
- `disease_name` VARCHAR(255)
- `medication_applied` VARCHAR(255)
- `birds_affected`, `birds_recovered` INT

### 8. medications
Catálogo de medicamentos.
- `medication_name` VARCHAR(255)
- `active_component` VARCHAR(255)
- `dosage_per_bird` DECIMAL
- `unit` 'ml', 'g', 'mg'
- `stock_quantity` DECIMAL
- `cost_per_unit` DECIMAL

### 9. diseases
Doenças conhecidas e seus tratamentos.
- `disease_name`, `disease_code`
- `symptoms` TEXT
- `treatment_method` TEXT
- `prevention_measures` TEXT

### 10. medication_shortage
Alertas de carência de medicamentos.
- `medication_id` UUID
- `shortage_date` DATE
- `quantity_needed` DECIMAL
- `status` 'pending', 'ordered', 'received'

### 11. cost_records
Registos de custos operacionais.
- `cost_type` 'feed', 'health', 'operational', 'personnel', 'utilities', 'other'
- `description` VARCHAR(255)
- `amount` DECIMAL(12,2)
- `currency` 'MZN' (etc)
- `supplier_name` VARCHAR(255)

### 12. employee_records
Registo de funcionários.
- `employee_id` VARCHAR(50)
- `position` VARCHAR(100)
- `hire_date`, `phone`, `email`
- `salary_base` DECIMAL(12,2)
- `employment_status` 'active', 'inactive', 'terminated'

### 13. payroll
Folha de pagamento.
- `employee_id` UUID
- `pay_period_start`, `pay_period_end` DATE
- `base_salary`, `bonuses`, `deductions` DECIMAL
- `net_salary` DECIMAL
- `status` 'pending', 'paid', 'cancelled'

### 14. vacation
Período de férias de funcionários.
- `employee_id` UUID
- `start_date`, `end_date` DATE
- `days_taken` INT
- `status` 'pending', 'approved', 'rejected', 'cancelled'

### 15. contracts
Contratos de trabalho.
- `employee_id` UUID
- `contract_type` 'permanent', 'temporary', 'seasonal'
- `start_date`, `end_date` DATE
- `contract_terms` TEXT

### 16. purchases
Compras de materiais.
- `purchase_date` DATE
- `supplier_name` VARCHAR(255)
- `product_type` 'feed', 'medication', 'supplies', 'equipment'
- `quantity`, `unit` 
- `unit_cost`, `total_cost` DECIMAL
- `delivery_date` DATE
- `status` 'pending', 'delivered', 'cancelled'

### 17. environmental_monitoring
Monitoramento contínuo de ambiente.
- `record_date`, `record_time`
- `temperature`, `humidity` DECIMAL
- `ventilation_status` 'normal', 'warning', 'critical'
- `air_quality` VARCHAR(50)
- `energy_consumption`, `water_temperature` DECIMAL

### 18. alerts
Alertas do sistema (críticos, avisos, info).
- `alert_type` 'critical', 'warning', 'info'
- `alert_title`, `alert_message` TEXT
- `status` 'active', 'resolved', 'dismissed'

### 19. deviations
Desvios técnicos em relação aos objetivos.
- `deviation_type` VARCHAR(100)
- `expected_value`, `actual_value` DECIMAL
- `deviation_percentage` DECIMAL
- `action_taken` TEXT
- `status` 'open', 'resolved'

### 20. suggestions
Sugestões geradas pela IA.
- `suggestion_type` VARCHAR(100)
- `description` TEXT
- `recommended_action` TEXT
- `urgency` 'low', 'normal', 'high', 'critical'
- `status` 'pending', 'implemented', 'dismissed'

### 21. decision_history
Histórico de decisões implementadas.
- `decision_type` VARCHAR(100)
- `description`, `reason` TEXT
- `implemented_by` VARCHAR(255)
- `result` TEXT
- `status` 'pending', 'implemented', 'cancelled'

## Relações de Chaves Estrangeiras

```
tenants (1) ─── (N) profiles
tenants (1) ─── (N) farms
farms (1) ─────── (N) batches
farms (1) ─────── (N) cost_records
farms (1) ─────── (N) employee_records
farms (1) ─────── (N) purchases
farms (1) ─────── (N) alerts
batches (1) ───── (N) production_records
batches (1) ───── (N) health_records
employee_records (1) ── (N) payroll
employee_records (1) ── (N) vacation
employee_records (1) ── (N) contracts
medications (1) ─── (N) medication_shortage
```

## Índices de Performance

```
idx_batches_farm_id             SELECT/WHERE farm_id
idx_batches_start_date          SELECT/ORDER BY start_date
idx_production_batch_id         SELECT/WHERE batch_id
idx_production_record_date      SELECT/ORDER by record_date
idx_health_batch_id             SELECT/WHERE batch_id
idx_health_record_date          SELECT/ORDER by record_date
idx_employees_farm_id           SELECT/WHERE farm_id
idx_costs_batch_id              SELECT/WHERE batch_id
idx_costs_record_date           SELECT/ORDER by record_date
idx_purchases_purchase_date     SELECT/ORDER by purchase_date
idx_monitoring_batch_id         SELECT/WHERE batch_id
```

## Políticas RLS (Row Level Security)

Cada tabela tem RLS habilitada com uma política de isolamento por tenant:

```sql
CREATE POLICY "Tenant isolation - {table_name}" ON {table_name}
  FOR ALL
  USING (farm_id IN (
    SELECT id FROM farms 
    WHERE tenant_id IN (
      SELECT tenant_id FROM profiles 
      WHERE id = auth.uid()
    )
  ));
```

**Resultado:** Cada utilizador só consegue ver dados de seu próprio tenant.

## Dados Demo

**NENHUM.** Todas as tabelas nascem vazias. Os dados são inseridos pelos utilizadores através da aplicação.

## Como Executar

Veja: `EXECUTE_SQL_SCHEMA.md`

## Compatibilidade

- PostgreSQL 13+
- Supabase (recomendado)
- RLS habilitado
- UUID como ID primário

## Notas de Produção

1. **Backups:** Supabase faz backups automáticos
2. **Scaling:** Schema suporta milhões de registos
3. **Multi-tenant:** Isolado por tenant via RLS
4. **Security:** Sem dados sensíveis em texto plano
5. **GDPR:** Estrutura preparada para GDPR compliance

## Monitoramento

Recomenda-se monitorar:
- Tamanho das tabelas (especialmente production_records, health_records)
- Performance de queries (usar EXPLAIN)
- Crescimento de índices
- RLS overhead em aplicações high-volume

## Suporte

Para dúvidas sobre o schema:
1. Consulte a documentação da tabela acima
2. Verifique EXECUTE_SQL_SCHEMA.md para troubleshooting
3. Contacte a equipa de suporte

---

**Versão:** 1.0  
**Data:** 2026-01-26  
**Status:** Pronto para Produção  
**Última atualização:** Por consolidar todos os scripts anteriores
