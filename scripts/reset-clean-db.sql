-- ============================================================================
-- HULA AGRO - Clean Database Reset Script
-- Reseta completamente a base de dados com schema otimizado
-- Moeda: Metical (MZN)
-- ============================================================================

-- Drop all existing tables and sequences
DROP TABLE IF EXISTS public.financial_records CASCADE;
DROP TABLE IF EXISTS public.vaccinations CASCADE;
DROP TABLE IF EXISTS public.health_records CASCADE;
DROP TABLE IF EXISTS public.egg_production CASCADE;
DROP TABLE IF EXISTS public.hens CASCADE;
DROP TABLE IF EXISTS public.farms CASCADE;

-- ============================================================================
-- FARMS TABLE
-- ============================================================================
CREATE TABLE public.farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  country VARCHAR(100) DEFAULT 'Moçambique',
  currency VARCHAR(10) DEFAULT 'MZN',
  total_hens_active INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- HENS TABLE (Aves)
-- ============================================================================
CREATE TABLE public.hens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  tag_number VARCHAR(50) NOT NULL,
  breed VARCHAR(100),
  genetic_line VARCHAR(100),
  date_of_birth DATE,
  acquisition_date DATE,
  weight_kg DECIMAL(5, 2),
  status VARCHAR(50) DEFAULT 'ativa', -- ativa, doente, reformada, morta
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(farm_id, tag_number)
);

-- ============================================================================
-- EGG PRODUCTION TABLE (Produção)
-- ============================================================================
CREATE TABLE public.egg_production (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  hen_id UUID REFERENCES public.hens(id) ON DELETE SET NULL,
  production_date DATE NOT NULL,
  eggs_count INTEGER DEFAULT 0,
  quality VARCHAR(50), -- normal, rachada, pequena, grande
  weight_grams DECIMAL(5, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- HEALTH RECORDS TABLE (Saúde)
-- ============================================================================
CREATE TABLE public.health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  hen_id UUID REFERENCES public.hens(id) ON DELETE SET NULL,
  record_date DATE NOT NULL,
  condition VARCHAR(100),
  treatment TEXT,
  veterinarian VARCHAR(100),
  severity VARCHAR(50), -- leve, moderada, grave
  status VARCHAR(50) DEFAULT 'ativo',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- VACCINATIONS TABLE (Vacinações)
-- ============================================================================
CREATE TABLE public.vaccinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  hen_id UUID REFERENCES public.hens(id) ON DELETE SET NULL,
  vaccine_name VARCHAR(100) NOT NULL,
  vaccination_date DATE NOT NULL,
  next_due_date DATE,
  veterinarian VARCHAR(100),
  batch_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- FINANCIAL RECORDS TABLE (Custos - em Metical)
-- ============================================================================
CREATE TABLE public.financial_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  record_type VARCHAR(50), -- ração, medicamento, equipamento, eletricidade, vendas, outro
  description VARCHAR(255),
  amount_mzn DECIMAL(12, 2) NOT NULL, -- Valor em Metical
  category VARCHAR(100),
  status VARCHAR(50) DEFAULT 'ativo',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES para melhor performance
-- ============================================================================
CREATE INDEX idx_farms_created_at ON public.farms(created_at);
CREATE INDEX idx_hens_farm_id ON public.hens(farm_id);
CREATE INDEX idx_hens_status ON public.hens(status);
CREATE INDEX idx_hens_tag_number ON public.hens(tag_number);
CREATE INDEX idx_egg_production_farm_id ON public.egg_production(farm_id);
CREATE INDEX idx_egg_production_hen_id ON public.egg_production(hen_id);
CREATE INDEX idx_egg_production_date ON public.egg_production(production_date);
CREATE INDEX idx_health_records_farm_id ON public.health_records(farm_id);
CREATE INDEX idx_health_records_hen_id ON public.health_records(hen_id);
CREATE INDEX idx_health_records_date ON public.health_records(record_date);
CREATE INDEX idx_vaccinations_farm_id ON public.vaccinations(farm_id);
CREATE INDEX idx_vaccinations_hen_id ON public.vaccinations(hen_id);
CREATE INDEX idx_vaccinations_date ON public.vaccinations(vaccination_date);
CREATE INDEX idx_financial_records_farm_id ON public.financial_records(farm_id);
CREATE INDEX idx_financial_records_date ON public.financial_records(record_date);
CREATE INDEX idx_financial_records_type ON public.financial_records(record_type);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - Adicionar segurança por farm
-- ============================================================================
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.egg_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;
-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
