-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own farms" ON farms;
DROP POLICY IF EXISTS "Users can create farms" ON farms;
DROP POLICY IF EXISTS "Users can update their own farms" ON farms;
DROP POLICY IF EXISTS "Users can delete their own farms" ON farms;

DROP POLICY IF EXISTS "Users can view hens from their farms" ON hens;
DROP POLICY IF EXISTS "Users can create hens in their farms" ON hens;
DROP POLICY IF EXISTS "Users can update hens in their farms" ON hens;
DROP POLICY IF EXISTS "Users can delete hens in their farms" ON hens;

DROP POLICY IF EXISTS "Users can view egg production from their farms" ON egg_production;
DROP POLICY IF EXISTS "Users can create egg production records" ON egg_production;
DROP POLICY IF EXISTS "Users can update egg production records" ON egg_production;

DROP POLICY IF EXISTS "Users can view health records from their farms" ON health_records;
DROP POLICY IF EXISTS "Users can create health records" ON health_records;
DROP POLICY IF EXISTS "Users can update health records" ON health_records;

DROP POLICY IF EXISTS "Users can view vaccinations from their farms" ON vaccinations;
DROP POLICY IF EXISTS "Users can create vaccination records" ON vaccinations;
DROP POLICY IF EXISTS "Users can update vaccination records" ON vaccinations;

DROP POLICY IF EXISTS "Users can view financial records from their farms" ON financial_records;
DROP POLICY IF EXISTS "Users can create financial records" ON financial_records;
DROP POLICY IF EXISTS "Users can update financial records" ON financial_records;

-- Ensure RLS is enabled on all tables
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
