-- Drop all existing tables
DROP TABLE IF EXISTS vaccinations CASCADE;
DROP TABLE IF EXISTS health_records CASCADE;
DROP TABLE IF EXISTS egg_production CASCADE;
DROP TABLE IF EXISTS hens CASCADE;
DROP TABLE IF EXISTS financial_records CASCADE;
DROP TABLE IF EXISTS farms CASCADE;

-- Create farms table (single farm, no user_id needed)
CREATE TABLE farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create hens table
CREATE TABLE hens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  tag VARCHAR(50) NOT NULL UNIQUE,
  breed VARCHAR(100),
  date_of_birth DATE,
  status VARCHAR(50) DEFAULT 'ativa',
  weight_kg DECIMAL(5, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create egg_production table
CREATE TABLE egg_production (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  hen_id UUID REFERENCES hens(id) ON DELETE SET NULL,
  eggs_collected INT DEFAULT 0,
  collection_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create health_records table
CREATE TABLE health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  hen_id UUID REFERENCES hens(id) ON DELETE SET NULL,
  issue_type VARCHAR(100),
  description TEXT,
  status VARCHAR(50) DEFAULT 'ativo',
  treatment TEXT,
  treatment_date DATE,
  resolved_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create vaccinations table
CREATE TABLE vaccinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  hen_id UUID REFERENCES hens(id) ON DELETE SET NULL,
  vaccine_name VARCHAR(100) NOT NULL,
  vaccination_date DATE NOT NULL,
  next_dose_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create financial_records table
CREATE TABLE financial_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  category VARCHAR(100),
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_hens_farm_id ON hens(farm_id);
CREATE INDEX idx_egg_production_farm_id ON egg_production(farm_id);
CREATE INDEX idx_egg_production_hen_id ON egg_production(hen_id);
CREATE INDEX idx_egg_production_date ON egg_production(collection_date);
CREATE INDEX idx_health_records_farm_id ON health_records(farm_id);
CREATE INDEX idx_health_records_hen_id ON health_records(hen_id);
CREATE INDEX idx_vaccinations_farm_id ON vaccinations(farm_id);
CREATE INDEX idx_vaccinations_hen_id ON vaccinations(hen_id);
CREATE INDEX idx_financial_records_farm_id ON financial_records(farm_id);

-- Disable RLS on all tables (allow public access)
ALTER TABLE farms DISABLE ROW LEVEL SECURITY;
ALTER TABLE hens DISABLE ROW LEVEL SECURITY;
ALTER TABLE egg_production DISABLE ROW LEVEL SECURITY;
ALTER TABLE health_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations DISABLE ROW LEVEL SECURITY;
ALTER TABLE financial_records DISABLE ROW LEVEL SECURITY;

-- Grant public access to all tables
GRANT ALL ON farms TO anon, authenticated;
GRANT ALL ON hens TO anon, authenticated;
GRANT ALL ON egg_production TO anon, authenticated;
GRANT ALL ON health_records TO anon, authenticated;
GRANT ALL ON vaccinations TO anon, authenticated;
GRANT ALL ON financial_records TO anon, authenticated;

