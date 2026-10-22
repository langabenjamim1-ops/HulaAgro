-- IoT Sensors Table
CREATE TABLE IF NOT EXISTS iot_sensors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'temperature', 'humidity', 'ammonia', 'particulates', 'co2', 'light'
  location TEXT NOT NULL,
  sensor_code TEXT UNIQUE NOT NULL,
  unit TEXT,
  min_value DECIMAL,
  max_value DECIMAL,
  alert_threshold_low DECIMAL,
  alert_threshold_high DECIMAL,
  is_active BOOLEAN DEFAULT true,
  last_reading DECIMAL,
  last_reading_timestamp TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- IoT Sensor Readings Table (time-series data)
CREATE TABLE IF NOT EXISTS iot_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id UUID NOT NULL REFERENCES iot_sensors(id) ON DELETE CASCADE,
  value DECIMAL NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_alert BOOLEAN DEFAULT false
);

-- YOLO Camera Feeds Table
CREATE TABLE IF NOT EXISTS yolo_cameras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  camera_code TEXT UNIQUE NOT NULL,
  feed_url TEXT,
  is_active BOOLEAN DEFAULT true,
  resolution TEXT DEFAULT '1280x720', -- resolution
  fps INTEGER DEFAULT 30,
  detection_classes TEXT[] DEFAULT ARRAY['healthy_bird', 'respiratory_distress', 'heat_stress', 'mortality_detected', 'normal_feeding', 'pecking_disorder'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- YOLO Detections Table
CREATE TABLE IF NOT EXISTS yolo_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camera_id UUID NOT NULL REFERENCES yolo_cameras(id) ON DELETE CASCADE,
  class_name TEXT NOT NULL,
  confidence DECIMAL NOT NULL,
  x_center DECIMAL,
  y_center DECIMAL,
  width DECIMAL,
  height DECIMAL,
  frame_number INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  image_url TEXT,
  severity TEXT DEFAULT 'normal' -- 'normal', 'warning', 'critical'
);

-- IoT Alerts Table
CREATE TABLE IF NOT EXISTS iot_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- 'iot_sensor', 'yolo_detection'
  source_id UUID, -- sensor_id or camera_id
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'warning', -- 'info', 'warning', 'critical'
  status TEXT DEFAULT 'active', -- 'active', 'resolved', 'acknowledged'
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE iot_sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE iot_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE yolo_cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE yolo_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE iot_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for iot_sensors
CREATE POLICY "Users can view their tenant's sensors"
  ON iot_sensors FOR SELECT
  USING (tenant_id = auth.jwt() ->> 'tenant_id'::text);

CREATE POLICY "Users can insert sensors for their tenant"
  ON iot_sensors FOR INSERT
  WITH CHECK (tenant_id = auth.jwt() ->> 'tenant_id'::text);

CREATE POLICY "Users can update their tenant's sensors"
  ON iot_sensors FOR UPDATE
  USING (tenant_id = auth.jwt() ->> 'tenant_id'::text);

-- RLS Policies for iot_readings
CREATE POLICY "Users can view their tenant's readings"
  ON iot_readings FOR SELECT
  USING (sensor_id IN (SELECT id FROM iot_sensors WHERE tenant_id = auth.jwt() ->> 'tenant_id'::text));

CREATE POLICY "Users can insert readings"
  ON iot_readings FOR INSERT
  WITH CHECK (sensor_id IN (SELECT id FROM iot_sensors WHERE tenant_id = auth.jwt() ->> 'tenant_id'::text));

-- RLS Policies for yolo_cameras
CREATE POLICY "Users can view their tenant's cameras"
  ON yolo_cameras FOR SELECT
  USING (tenant_id = auth.jwt() ->> 'tenant_id'::text);

CREATE POLICY "Users can insert cameras for their tenant"
  ON yolo_cameras FOR INSERT
  WITH CHECK (tenant_id = auth.jwt() ->> 'tenant_id'::text);

-- RLS Policies for yolo_detections
CREATE POLICY "Users can view detections from their cameras"
  ON yolo_detections FOR SELECT
  USING (camera_id IN (SELECT id FROM yolo_cameras WHERE tenant_id = auth.jwt() ->> 'tenant_id'::text));

-- RLS Policies for iot_alerts
CREATE POLICY "Users can view their tenant's alerts"
  ON iot_alerts FOR SELECT
  USING (tenant_id = auth.jwt() ->> 'tenant_id'::text);

CREATE POLICY "Users can insert alerts for their tenant"
  ON iot_alerts FOR INSERT
  WITH CHECK (tenant_id = auth.jwt() ->> 'tenant_id'::text);

-- Create Indexes for better performance
CREATE INDEX idx_iot_sensors_tenant_id ON iot_sensors(tenant_id);
CREATE INDEX idx_iot_readings_sensor_id ON iot_readings(sensor_id);
CREATE INDEX idx_iot_readings_timestamp ON iot_readings(timestamp DESC);
CREATE INDEX idx_yolo_cameras_tenant_id ON yolo_cameras(tenant_id);
CREATE INDEX idx_yolo_detections_camera_id ON yolo_detections(camera_id);
CREATE INDEX idx_yolo_detections_timestamp ON yolo_detections(timestamp DESC);
CREATE INDEX idx_iot_alerts_tenant_id ON iot_alerts(tenant_id);
CREATE INDEX idx_iot_alerts_status ON iot_alerts(status);
