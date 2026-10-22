-- Clean initialization script for HULA AGRO
-- Drops all tables and creates fresh schema without seed data

-- Drop existing tables
DROP TABLE IF EXISTS production_records CASCADE;
DROP TABLE IF EXISTS health_records CASCADE;
DROP TABLE IF EXISTS cost_records CASCADE;
DROP TABLE IF EXISTS employee_records CASCADE;
DROP TABLE IF EXISTS batches CASCADE;
DROP TABLE IF EXISTS farms CASCADE;

-- Create farms table
CREATE TABLE farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  owner TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create batches table (Gestão de Lotes)
CREATE TABLE batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  batch_code TEXT NOT NULL UNIQUE,
  bird_type TEXT NOT NULL,
  birds_count INTEGER,
  genetics TEXT,
  facility_location TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create production_records table (Produção)
CREATE TABLE production_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  record_date DATE,
  eggs_produced INTEGER,
  feed_consumed_kg DECIMAL(10,2),
  mortality_count INTEGER,
  water_consumed_liters DECIMAL(10,2),
  temperature_avg DECIMAL(5,2),
  humidity_avg DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create health_records table (Saúde)
CREATE TABLE health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  record_date DATE,
  health_status TEXT,
  vaccination_name TEXT,
  medication_name TEXT,
  disease_detected TEXT,
  birds_affected INTEGER,
  treatment_notes TEXT,
  quarantine_location TEXT,
  quarantine_start_date DATE,
  quarantine_end_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cost_records table (Custos)
CREATE TABLE cost_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES batches(id),
  record_date DATE,
  cost_category TEXT,
  cost_type TEXT,
  amount DECIMAL(12,2),
  currency TEXT DEFAULT 'MZN',
  description TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employee_records table (Recursos Humanos)
CREATE TABLE employee_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  employee_role TEXT,
  hire_date DATE,
  salary DECIMAL(12,2),
  currency TEXT DEFAULT 'MZN',
  status TEXT DEFAULT 'active',
  contact_number TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_batches_farm_id ON batches(farm_id);
CREATE INDEX idx_batches_status ON batches(status);
CREATE INDEX idx_production_batch_id ON production_records(batch_id);
CREATE INDEX idx_production_farm_id ON production_records(farm_id);
CREATE INDEX idx_health_batch_id ON health_records(batch_id);
CREATE INDEX idx_health_farm_id ON health_records(farm_id);
CREATE INDEX idx_costs_farm_id ON cost_records(farm_id);
CREATE INDEX idx_costs_batch_id ON cost_records(batch_id);
CREATE INDEX idx_employees_farm_id ON employee_records(farm_id);

-- Enable Row Level Security
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_records ENABLE ROW LEVEL SECURITY;
