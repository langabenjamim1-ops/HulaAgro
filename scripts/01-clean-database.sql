-- ========================================
-- HULA AGRO - Clean Database Schema
-- Versão: 1.0
-- Data: 2024
-- Descrição: Schema completo sem dados demo
-- ========================================

-- ========================================
-- 1. TABELA: FARMS (Galpões)
-- ========================================
CREATE TABLE IF NOT EXISTS farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  total_capacity INT DEFAULT 0,
  farm_manager VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 2. TABELA: BATCHES (Lotes)
-- ========================================
CREATE TABLE IF NOT EXISTS batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  batch_code VARCHAR(50) NOT NULL,
  bird_type VARCHAR(50) NOT NULL, -- 'layers', 'broilers', 'breeders'
  birds_count INT NOT NULL,
  genetics VARCHAR(255),
  facility_location VARCHAR(255),
  start_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'finished', 'ended'
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 3. TABELA: GENETICS (Genética)
-- ========================================
CREATE TABLE IF NOT EXISTS genetics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  genetic_code VARCHAR(50) NOT NULL,
  genetic_name VARCHAR(255) NOT NULL,
  bird_type VARCHAR(50), -- 'layers', 'broilers', 'breeders'
  origin VARCHAR(255),
  characteristics TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 4. TABELA: PRODUCTION_RECORDS (Produção)
-- ========================================
CREATE TABLE IF NOT EXISTS production_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  eggs_produced INT DEFAULT 0,
  laying_rate DECIMAL(5, 2) DEFAULT 0, -- percentagem
  mortality_count INT DEFAULT 0,
  average_weight DECIMAL(6, 2),
  feed_consumption DECIMAL(8, 3),
  water_consumption DECIMAL(8, 3),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 5. TABELA: HEALTH_RECORDS (Saúde)
-- ========================================
CREATE TABLE IF NOT EXISTS health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  health_status VARCHAR(50), -- 'healthy', 'illness', 'treatment', 'quarantine'
  disease_name VARCHAR(255),
  medication_applied VARCHAR(255),
  birds_affected INT DEFAULT 0,
  birds_recovered INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 6. TABELA: MEDICATIONS (Medicamentos)
-- ========================================
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  medication_name VARCHAR(255) NOT NULL,
  active_component VARCHAR(255),
  dosage_per_bird DECIMAL(8, 3),
  unit VARCHAR(50), -- 'ml', 'g', 'mg'
  storage_temperature VARCHAR(100),
  expiration_date DATE,
  stock_quantity DECIMAL(10, 3),
  cost_per_unit DECIMAL(10, 2),
  currency VARCHAR(10) DEFAULT 'MZN',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 7. TABELA: DISEASES (Doenças)
-- ========================================
CREATE TABLE IF NOT EXISTS diseases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  disease_name VARCHAR(255) NOT NULL,
  disease_code VARCHAR(50),
  symptoms TEXT,
  treatment_method TEXT,
  prevention_measures TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 8. TABELA: MEDICATION_SHORTAGE (Carência de Medicamentos)
-- ========================================
CREATE TABLE IF NOT EXISTS medication_shortage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  shortage_date DATE NOT NULL,
  quantity_needed DECIMAL(10, 3),
  reorder_date DATE,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'ordered', 'received'
  supplier_name VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 9. TABELA: COST_RECORDS (Custos)
-- ========================================
CREATE TABLE IF NOT EXISTS cost_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  cost_type VARCHAR(50), -- 'feed', 'health', 'operational', 'personnel', 'utilities', 'other'
  description VARCHAR(255),
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'MZN',
  supplier_name VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 10. TABELA: EMPLOYEES (Funcionários)
-- ========================================
CREATE TABLE IF NOT EXISTS employee_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  employee_name VARCHAR(255) NOT NULL,
  employee_id VARCHAR(50),
  position VARCHAR(100),
  hire_date DATE,
  phone VARCHAR(20),
  email VARCHAR(255),
  salary_base DECIMAL(12, 2),
  currency VARCHAR(10) DEFAULT 'MZN',
  employment_status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'terminated'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 11. TABELA: PAYROLL (Folha de Pagamento)
-- ========================================
CREATE TABLE IF NOT EXISTS payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employee_records(id) ON DELETE CASCADE,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  base_salary DECIMAL(12, 2),
  bonuses DECIMAL(12, 2) DEFAULT 0,
  deductions DECIMAL(12, 2) DEFAULT 0,
  net_salary DECIMAL(12, 2),
  currency VARCHAR(10) DEFAULT 'MZN',
  payment_date DATE,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'cancelled'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 12. TABELA: VACATION (Férias)
-- ========================================
CREATE TABLE IF NOT EXISTS vacation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employee_records(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_taken INT,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'cancelled'
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 13. TABELA: CONTRACTS (Contratos)
-- ========================================
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employee_records(id) ON DELETE CASCADE,
  contract_type VARCHAR(100), -- 'permanent', 'temporary', 'seasonal'
  start_date DATE NOT NULL,
  end_date DATE,
  contract_terms TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 14. TABELA: PURCHASES (Compras)
-- ========================================
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  purchase_date DATE NOT NULL,
  supplier_name VARCHAR(255),
  product_type VARCHAR(100), -- 'feed', 'medication', 'supplies', 'equipment'
  quantity DECIMAL(10, 3),
  unit VARCHAR(50),
  unit_cost DECIMAL(12, 2),
  total_cost DECIMAL(12, 2),
  currency VARCHAR(10) DEFAULT 'MZN',
  delivery_date DATE,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'delivered', 'cancelled'
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 15. TABELA: ENVIRONMENTAL_MONITORING (Monitoramento Ambiental)
-- ========================================
CREATE TABLE IF NOT EXISTS environmental_monitoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  record_time TIME,
  temperature DECIMAL(6, 2),
  humidity DECIMAL(5, 2),
  ventilation_status VARCHAR(50), -- 'normal', 'warning', 'critical'
  air_quality VARCHAR(50),
  energy_consumption DECIMAL(10, 3),
  water_temperature DECIMAL(6, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 16. TABELA: ALERTS (Alertas)
-- ========================================
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  alert_type VARCHAR(50), -- 'critical', 'warning', 'info'
  alert_title VARCHAR(255),
  alert_message TEXT,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'resolved', 'dismissed'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 17. TABELA: DEVIATIONS (Desvios Técnicos)
-- ========================================
CREATE TABLE IF NOT EXISTS deviations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  deviation_date DATE NOT NULL,
  deviation_type VARCHAR(100),
  expected_value DECIMAL(12, 3),
  actual_value DECIMAL(12, 3),
  deviation_percentage DECIMAL(6, 2),
  action_taken TEXT,
  status VARCHAR(50) DEFAULT 'open', -- 'open', 'resolved'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 18. TABELA: SUGGESTIONS (Sugestões)
-- ========================================
CREATE TABLE IF NOT EXISTS suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  suggestion_date DATE NOT NULL,
  suggestion_type VARCHAR(100),
  description TEXT,
  recommended_action TEXT,
  urgency VARCHAR(50) DEFAULT 'normal', -- 'low', 'normal', 'high', 'critical'
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'implemented', 'dismissed'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 19. TABELA: DECISION_HISTORY (Histórico de Decisões)
-- ========================================
CREATE TABLE IF NOT EXISTS decision_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  decision_date DATE NOT NULL,
  decision_type VARCHAR(100),
  description TEXT,
  reason TEXT,
  implemented_by VARCHAR(255),
  result TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'implemented', 'cancelled'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- ÍNDICES PARA PERFORMANCE
-- ========================================
CREATE INDEX idx_batches_farm_id ON batches(farm_id);
CREATE INDEX idx_batches_start_date ON batches(start_date);
CREATE INDEX idx_production_batch_id ON production_records(batch_id);
CREATE INDEX idx_production_record_date ON production_records(record_date);
CREATE INDEX idx_health_batch_id ON health_records(batch_id);
CREATE INDEX idx_health_record_date ON health_records(record_date);
CREATE INDEX idx_employees_farm_id ON employee_records(farm_id);
CREATE INDEX idx_costs_batch_id ON cost_records(batch_id);
CREATE INDEX idx_costs_record_date ON cost_records(record_date);
CREATE INDEX idx_purchases_purchase_date ON purchases(purchase_date);
CREATE INDEX idx_monitoring_batch_id ON environmental_monitoring(batch_id);

-- ========================================
-- TABELA VAZIA - SEM DADOS DEMO
-- Todos os dados serão inseridos pelo usuário
-- ========================================
