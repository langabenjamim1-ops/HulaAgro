-- Phase 2A: Create new tables for Facilities, Nutrition, and Daily Management

-- 1. FACILITIES TABLE (for Galpões)
CREATE TABLE IF NOT EXISTS facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  facility_type VARCHAR(100),
  capacity INT,
  construction_date DATE,
  last_maintenance DATE,
  status VARCHAR(50) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. NUTRITION_RECORDS TABLE (for Nutrição - Silos, Fases, Consumo)
CREATE TABLE IF NOT EXISTS nutrition_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID REFERENCES facilities(id),
  batch_id UUID REFERENCES batches(id),
  nutrition_phase VARCHAR(100),
  silo_id VARCHAR(100),
  feed_type VARCHAR(255),
  consumption_kg DECIMAL(10, 2),
  theoretical_consumption_kg DECIMAL(10, 2),
  consumption_per_bird DECIMAL(8, 2),
  record_date DATE,
  status VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. DAILY_MANAGEMENT_RECORDS TABLE (for Gestão Diária)
CREATE TABLE IF NOT EXISTS daily_management_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID REFERENCES facilities(id),
  batch_id UUID REFERENCES batches(id),
  record_date DATE,
  
  -- Mortality
  mortality_count INT DEFAULT 0,
  mortality_rate DECIMAL(5, 2),
  mortality_reason VARCHAR(255),
  
  -- Water consumption
  water_consumption_liters DECIMAL(10, 2),
  water_quality_status VARCHAR(50),
  
  -- Weight
  average_weight_grams DECIMAL(8, 2),
  weight_uniformity DECIMAL(5, 2),
  
  -- Activity
  bird_activity VARCHAR(100),
  feed_consumption_status VARCHAR(100),
  
  -- General notes
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. VACCINATION_RECORDS TABLE (for Vacinação)
CREATE TABLE IF NOT EXISTS vaccination_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES batches(id),
  facility_id UUID REFERENCES facilities(id),
  vaccine_name VARCHAR(255),
  vaccine_type VARCHAR(100),
  application_date DATE,
  application_method VARCHAR(100),
  birds_vaccinated INT,
  dosage_volume_ml DECIMAL(8, 2),
  reaction_observed VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. FLOCK_CLASSIFICATIONS TABLE (for Classificação de Plantéis)
CREATE TABLE IF NOT EXISTS flock_classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES batches(id),
  classification_date DATE,
  classification_type VARCHAR(100),
  total_birds INT,
  classification_details JSONB,
  grading_results VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_facilities_name ON facilities(name);
CREATE INDEX IF NOT EXISTS idx_nutrition_batch_id ON nutrition_records(batch_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_facility_id ON nutrition_records(facility_id);
CREATE INDEX IF NOT EXISTS idx_daily_mgmt_batch_id ON daily_management_records(batch_id);
CREATE INDEX IF NOT EXISTS idx_daily_mgmt_facility_id ON daily_management_records(facility_id);
CREATE INDEX IF NOT EXISTS idx_vaccination_batch_id ON vaccination_records(batch_id);
CREATE INDEX IF NOT EXISTS idx_flock_class_batch_id ON flock_classifications(batch_id);

-- Add comments for documentation
COMMENT ON TABLE facilities IS 'Galpões (facilities) - physical spaces for bird production';
COMMENT ON TABLE nutrition_records IS 'Registos de Nutrição - feed consumption and silo management';
COMMENT ON TABLE daily_management_records IS 'Gestão Diária - daily operational records (mortality, water, weight)';
COMMENT ON TABLE vaccination_records IS 'Registos de Vacinação - vaccination history and outcomes';
COMMENT ON TABLE flock_classifications IS 'Classificação de Plantéis - grading and classification of bird flocks';
