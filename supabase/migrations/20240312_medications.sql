 -- Create medications table
CREATE TABLE IF NOT EXISTS medications (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  generic_name TEXT,
  strength TEXT NOT NULL,
  form TEXT NOT NULL, -- tablet, capsule, liquid, etc.
  manufacturer TEXT,
  description TEXT,
  warnings TEXT,
  side_effects TEXT,
  interactions TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  user_id TEXT DEFAULT requesting_user_id()
);

-- Add RLS policies for medications
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage medications"
ON medications FOR ALL
TO authenticated
USING (user_id = requesting_user_id());

CREATE POLICY "Users can view medications"
ON medications FOR SELECT
TO authenticated
USING (
  user_id = requesting_user_id() OR
  EXISTS (
    SELECT 1 FROM patient_shares
    WHERE patient_shares.patient_id = medications.patient_id
    AND patient_shares.shared_with_user_id::text = requesting_user_id()
    AND patient_shares.access_level = ANY(ARRAY['read', 'write', 'admin'])
    AND (patient_shares.expires_at IS NULL OR patient_shares.expires_at > now())
  )
);

-- Update prescriptions table with medication relationship
ALTER TABLE prescriptions 
ADD COLUMN IF NOT EXISTS medication_id INTEGER REFERENCES medications(id),
ADD COLUMN IF NOT EXISTS dosage TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS frequency TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS duration TEXT,
ADD COLUMN IF NOT EXISTS refills INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS prescribed_by INTEGER REFERENCES doctors(id);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_medications_user_id ON medications(user_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_medication_id ON prescriptions(medication_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_prescribed_by ON prescriptions(prescribed_by);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_medications_updated_at
    BEFORE UPDATE ON medications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();