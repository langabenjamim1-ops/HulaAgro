-- =====================================================
-- HULA AGRO - Supabase Database Setup (Clean)
-- Moeda: Metical (MZN)
-- =====================================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.costs CASCADE;
DROP TABLE IF EXISTS public.purchases CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;
DROP TABLE IF EXISTS public.production_records CASCADE;
DROP TABLE IF EXISTS public.health_records CASCADE;
DROP TABLE IF EXISTS public.environment_records CASCADE;
DROP TABLE IF EXISTS public.batches CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.farms CASCADE;

-- =====================================================
-- 1. Farms Table
-- =====================================================
CREATE TABLE public.farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  capacity_birds INTEGER DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'MZN',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. Users Table
-- =====================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. Batches Table
-- =====================================================
CREATE TABLE public.batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
  batch_number VARCHAR(100) NOT NULL,
  bird_type VARCHAR(50),
  genetics VARCHAR(100),
  quantity_initial INTEGER,
  start_date DATE,
  status VARCHAR(50) DEFAULT 'ativa',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. Production Records Table
-- =====================================================
CREATE TABLE public.production_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  eggs_produced INTEGER DEFAULT 0,
  eggs_classified_a INTEGER DEFAULT 0,
  eggs_classified_b INTEGER DEFAULT 0,
  eggs_broken INTEGER DEFAULT 0,
  mortality_count INTEGER DEFAULT 0,
  feed_consumed_kg DECIMAL(10,2) DEFAULT 0,
  fcr_ratio DECIMAL(10,3),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. Health Records Table
-- =====================================================
CREATE TABLE public.health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  vaccination_type VARCHAR(100),
  medication_type VARCHAR(100),
  dosage VARCHAR(100),
  observation TEXT,
  veterinarian_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. Environment Records Table
-- =====================================================
CREATE TABLE public.environment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  temperature_min DECIMAL(5,2),
  temperature_max DECIMAL(5,2),
  humidity_min DECIMAL(5,2),
  humidity_max DECIMAL(5,2),
  ventilation_status VARCHAR(50),
  water_quality VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. Employees Table
-- =====================================================
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  position VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  salary_mzn DECIMAL(12,2),
  employment_date DATE,
  status VARCHAR(50) DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. Purchases Table
-- =====================================================
CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
  supplier_name VARCHAR(255),
  product_type VARCHAR(100),
  quantity DECIMAL(10,2),
  unit VARCHAR(50),
  unit_price_mzn DECIMAL(12,2),
  total_price_mzn DECIMAL(12,2),
  purchase_date DATE,
  payment_status VARCHAR(50) DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. Costs Table
-- =====================================================
CREATE TABLE public.costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  cost_type VARCHAR(100),
  amount_mzn DECIMAL(12,2),
  description TEXT,
  cost_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Create Indexes for Performance
-- =====================================================
CREATE INDEX idx_batches_farm_id ON public.batches(farm_id);
CREATE INDEX idx_production_batch_id ON public.production_records(batch_id);
CREATE INDEX idx_health_batch_id ON public.health_records(batch_id);
CREATE INDEX idx_environment_batch_id ON public.environment_records(batch_id);
CREATE INDEX idx_employees_farm_id ON public.employees(farm_id);
CREATE INDEX idx_purchases_farm_id ON public.purchases(farm_id);
CREATE INDEX idx_costs_farm_id ON public.costs(farm_id);

-- =====================================================
-- Enable RLS (Row Level Security)
-- =====================================================
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.environment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.costs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Database Setup Complete
-- All tables are empty and ready for data
-- =====================================================
