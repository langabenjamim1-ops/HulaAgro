-- Indexes for the date ordered lists and dashboard filters used by module APIs.
CREATE INDEX IF NOT EXISTS idx_daily_management_record_date
  ON public.daily_management_records (record_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_management_batch_record_date
  ON public.daily_management_records (batch_id, record_date DESC);

CREATE INDEX IF NOT EXISTS idx_nutrition_records_record_date
  ON public.nutrition_records (record_date DESC);
CREATE INDEX IF NOT EXISTS idx_nutrition_records_batch_record_date
  ON public.nutrition_records (batch_id, record_date DESC);

CREATE INDEX IF NOT EXISTS idx_production_records_batch_record_date
  ON public.production_records (batch_id, record_date DESC);
CREATE INDEX IF NOT EXISTS idx_cost_records_batch_record_date
  ON public.cost_records (batch_id, record_date DESC);

CREATE INDEX IF NOT EXISTS idx_batches_created_at
  ON public.batches (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_purchase_date
  ON public.purchases (purchase_date DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at
  ON public.alerts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_employee_records_name
  ON public.employee_records (employee_name);
CREATE INDEX IF NOT EXISTS idx_health_records_record_date
  ON public.health_records (record_date DESC);
CREATE INDEX IF NOT EXISTS idx_flock_classifications_date
  ON public.flock_classifications (classification_date DESC);
CREATE INDEX IF NOT EXISTS idx_facilities_created_at
  ON public.facilities (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_environmental_monitoring_record_date
  ON public.environmental_monitoring (record_date DESC);
CREATE INDEX IF NOT EXISTS idx_deviations_deviation_date
  ON public.deviations (deviation_date DESC);
