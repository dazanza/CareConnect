-- Create medications table
CREATE TABLE IF NOT EXISTS medications (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  instructions TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'discontinued', 'completed')),
  reason_for_discontinuation TEXT,
  side_effects TEXT,
  adherence_rate INTEGER CHECK (adherence_rate BETWEEN 0 AND 100),
  doctor_id INTEGER REFERENCES doctors(id),
  patient_id INTEGER REFERENCES patients(id),
  user_id TEXT DEFAULT requesting_user_id(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create immunizations table
CREATE TABLE IF NOT EXISTS immunizations (
  id SERIAL PRIMARY KEY,
  vaccine_name TEXT NOT NULL,
  vaccine_type TEXT NOT NULL,
  dose_number INTEGER NOT NULL,
  date_administered TIMESTAMP WITH TIME ZONE NOT NULL,
  next_due_date TIMESTAMP WITH TIME ZONE,
  administered_by TEXT NOT NULL,
  batch_number TEXT,
  manufacturer TEXT,
  location TEXT,
  notes TEXT,
  status TEXT NOT NULL CHECK (status IN ('completed', 'scheduled', 'overdue')),
  side_effects TEXT,
  patient_id INTEGER REFERENCES patients(id),
  doctor_id INTEGER REFERENCES doctors(id),
  user_id TEXT DEFAULT requesting_user_id(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add RLS policies for medications
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage medications" ON medications
  FOR ALL USING (user_id = requesting_user_id());

CREATE POLICY "Users can view medications" ON medications
  FOR SELECT USING (
    user_id = requesting_user_id() OR
    EXISTS (
      SELECT 1 FROM patient_shares
      WHERE patient_shares.patient_id = medications.patient_id
      AND patient_shares.shared_with_user_id::text = requesting_user_id()
      AND patient_shares.access_level IN ('read', 'write', 'admin')
      AND (patient_shares.expires_at IS NULL OR patient_shares.expires_at > now())
    )
  );

-- Add RLS policies for immunizations
ALTER TABLE immunizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage immunizations" ON immunizations
  FOR ALL USING (user_id = requesting_user_id());

CREATE POLICY "Users can view immunizations" ON immunizations
  FOR SELECT USING (
    user_id = requesting_user_id() OR
    EXISTS (
      SELECT 1 FROM patient_shares
      WHERE patient_shares.patient_id = immunizations.patient_id
      AND patient_shares.shared_with_user_id::text = requesting_user_id()
      AND patient_shares.access_level IN ('read', 'write', 'admin')
      AND (patient_shares.expires_at IS NULL OR patient_shares.expires_at > now())
    )
  ); 