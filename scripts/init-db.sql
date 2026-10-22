-- Create farms table
CREATE TABLE IF NOT EXISTS farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  location TEXT,
  total_hens INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create hens table
CREATE TABLE IF NOT EXISTS hens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  tag_number VARCHAR(50) NOT NULL UNIQUE,
  breed VARCHAR(100),
  birth_date DATE,
  acquisition_date DATE,
  weight_kg DECIMAL(5,2),
  status VARCHAR(50) DEFAULT 'active', -- active, sick, retired, dead
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create egg_production table
CREATE TABLE IF NOT EXISTS egg_production (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hen_id UUID NOT NULL REFERENCES hens(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  production_date DATE NOT NULL,
  eggs_count INTEGER DEFAULT 0,
  quality VARCHAR(50), -- normal, cracked, small, large
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create health_records table
CREATE TABLE IF NOT EXISTS health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hen_id UUID NOT NULL REFERENCES hens(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  condition VARCHAR(100),
  treatment TEXT,
  veterinarian VARCHAR(100),
  severity VARCHAR(50), -- mild, moderate, severe
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create vaccinations table
CREATE TABLE IF NOT EXISTS vaccinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hen_id UUID NOT NULL REFERENCES hens(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  vaccine_name VARCHAR(100) NOT NULL,
  vaccination_date DATE NOT NULL,
  next_due_date DATE,
  veterinarian VARCHAR(100),
  batch_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create financial_records table
CREATE TABLE IF NOT EXISTS financial_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  record_type VARCHAR(50), -- feed, medicine, equipment, electricity, sales, other
  description VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_farms_user_id ON farms(user_id);
CREATE INDEX idx_hens_farm_id ON hens(farm_id);
CREATE INDEX idx_hens_status ON hens(status);
CREATE INDEX idx_egg_production_hen_id ON egg_production(hen_id);
CREATE INDEX idx_egg_production_farm_id ON egg_production(farm_id);
CREATE INDEX idx_egg_production_date ON egg_production(production_date);
CREATE INDEX idx_health_records_hen_id ON health_records(hen_id);
CREATE INDEX idx_health_records_date ON health_records(record_date);
CREATE INDEX idx_vaccinations_hen_id ON vaccinations(hen_id);
CREATE INDEX idx_vaccinations_date ON vaccinations(vaccination_date);
CREATE INDEX idx_financial_records_farm_id ON financial_records(farm_id);
CREATE INDEX idx_financial_records_date ON financial_records(record_date);

-- Enable RLS policies
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE hens ENABLE ROW LEVEL SECURITY;
ALTER TABLE egg_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for farms
CREATE POLICY "Users can view their own farms" ON farms
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create farms" ON farms
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own farms" ON farms
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own farms" ON farms
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for hens
CREATE POLICY "Users can view hens from their farms" ON hens
  FOR SELECT USING (farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid()));

CREATE POLICY "Users can create hens in their farms" ON hens
  FOR INSERT WITH CHECK (farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid()));

CREATE POLICY "Users can update hens in their farms" ON hens
  FOR UPDATE USING (farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete hens in their farms" ON hens
  FOR DELETE USING (farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid()));

-- RLS Policies for egg_production
CREATE POLICY "Users can view egg production from their farms" ON egg_production
  FOR SELECT USING (farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid()));

CREATE POLICY "Users can create egg production records" ON egg_production
  FOR INSERT WITH CHECK (farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid()));

CREATE POLICY "Users can update egg production records" ON egg_production
  FOR UPDATE USING (farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid()));

-- RLS Policies for health_records
CREATE POLICY "Users can view health records from their farms" ON health_records
  FOR SELECT USING (farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid()));

CREATE POLICY "Users can create health records" ON health_records
  FOR INSERT WITH CHECK (farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid()));

CREATE POLICY "Users can update health records" ON health_records
  FOR UPDATE USING (farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid()));

-- RLS Policies for vaccinations
CREATE POLICY "Users can view vaccinations from their farms" ON vaccinations
  FOR SELECT USING (farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid()));

CREATE POLICY "Users can create vaccination records" ON vaccinations
  FOR INSERT WITH CHECK (farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid()));

CREATE POLICY "Users can update vaccination records" ON vaccinations
  FOR UPDATE USING (farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid()));

-- RLS Policies for financial_records
CREATE POLICY "Users can view financial records from their farms" ON financial_records
  FOR SELECT USING (farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid()));

CREATE POLICY "Users can create financial records" ON financial_records
  FOR INSERT WITH CHECK (farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid()));

CREATE POLICY "Users can update financial records" ON financial_records
  FOR UPDATE USING (farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid()));
