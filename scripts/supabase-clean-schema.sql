-- HULA Agro - Clean Database Schema (No Seed Data)
-- Currency: Metical (MZN)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== CORE TABLES ====================

-- Farms (Galpões)
CREATE TABLE IF NOT EXISTS farms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  capacity INTEGER,
  owner_name VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  currency VARCHAR(3) DEFAULT 'MZN',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Batches (Lotes)
CREATE TABLE IF NOT EXISTS batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  batch_code VARCHAR(100) NOT NULL UNIQUE,
  status VARCHAR(50) DEFAULT 'active', -- active, finished, culled
  birds_count INTEGER NOT NULL,
  bird_type VARCHAR(100), -- layers, broilers, etc.
  genetics VARCHAR(255),
  facility_location VARCHAR(255),
  start_date DATE NOT NULL,
  expected_end_date DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Production Records (Registros de Produção)
CREATE TABLE IF NOT EXISTS production_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  eggs_produced INTEGER DEFAULT 0,
  eggs_classified INTEGER DEFAULT 0,
  mortality_count INTEGER DEFAULT 0,
  feed_consumed_kg DECIMAL(10,2) DEFAULT 0,
  water_consumed_liters DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Health Records (Registros de Saúde)
CREATE TABLE IF NOT EXISTS health_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  health_status VARCHAR(100), -- healthy, sick, treatment, recovery
  vaccination_type VARCHAR(255),
  medicine_used VARCHAR(255),
  dosage VARCHAR(255),
  treated_birds_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Environment Records (Registros de Ambiência)
CREATE TABLE IF NOT EXISTS environment_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  temperature_min DECIMAL(5,2),
  temperature_max DECIMAL(5,2),
  humidity_percent DECIMAL(5,2),
  ventilation_status VARCHAR(100),
  light_hours INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Facilities (Instalações)
CREATE TABLE IF NOT EXISTS facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  facility_type VARCHAR(100), -- shed, barn, house, etc.
  capacity INTEGER,
  condition VARCHAR(100), -- good, maintenance needed, poor
  last_maintenance_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Purchases (Compras)
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  purchase_date DATE NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  supplier_name VARCHAR(255),
  quantity DECIMAL(10,2),
  unit VARCHAR(50),
  unit_price DECIMAL(15,2),
  total_price DECIMAL(15,2),
  currency VARCHAR(3) DEFAULT 'MZN',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Costs (Custos)
CREATE TABLE IF NOT EXISTS costs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  cost_date DATE NOT NULL,
  cost_category VARCHAR(100), -- feed, health, operational, labor, utilities
  description VARCHAR(255),
  amount DECIMAL(15,2),
  currency VARCHAR(3) DEFAULT 'MZN',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Employees (Funcionários)
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  position VARCHAR(100),
  salary DECIMAL(15,2),
  currency VARCHAR(3) DEFAULT 'MZN',
  phone VARCHAR(20),
  email VARCHAR(255),
  hire_date DATE,
  status VARCHAR(50) DEFAULT 'active', -- active, inactive
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== INDEXES ====================

CREATE INDEX IF NOT EXISTS idx_batches_farm_id ON batches(farm_id);
CREATE INDEX IF NOT EXISTS idx_batches_status ON batches(status);
CREATE INDEX IF NOT EXISTS idx_production_batch_id ON production_records(batch_id);
CREATE INDEX IF NOT EXISTS idx_production_date ON production_records(record_date);
CREATE INDEX IF NOT EXISTS idx_health_batch_id ON health_records(batch_id);
CREATE INDEX IF NOT EXISTS idx_purchases_farm_id ON purchases(farm_id);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(purchase_date);
CREATE INDEX IF NOT EXISTS idx_costs_farm_id ON costs(farm_id);
CREATE INDEX IF NOT EXISTS idx_costs_date ON costs(cost_date);
CREATE INDEX IF NOT EXISTS idx_employees_farm_id ON employees(farm_id);

-- ==================== ROW LEVEL SECURITY ====================

ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE environment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (remove row level security restrictions for demo)
-- In production, add proper auth-based RLS policies

CREATE POLICY "allow_all_farms" ON farms FOR ALL USING (true);
CREATE POLICY "allow_all_batches" ON batches FOR ALL USING (true);
CREATE POLICY "allow_all_production" ON production_records FOR ALL USING (true);
CREATE POLICY "allow_all_health" ON health_records FOR ALL USING (true);
CREATE POLICY "allow_all_environment" ON environment_records FOR ALL USING (true);
CREATE POLICY "allow_all_facilities" ON facilities FOR ALL USING (true);
CREATE POLICY "allow_all_purchases" ON purchases FOR ALL USING (true);
CREATE POLICY "allow_all_costs" ON costs FOR ALL USING (true);
CREATE POLICY "allow_all_employees" ON employees FOR ALL USING (true);
