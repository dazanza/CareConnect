-- Create medication reference table
CREATE TABLE medication_references (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  generic_name TEXT,
  strength TEXT,
  form TEXT CHECK (form IN ('tablet', 'capsule', 'liquid', 'injection', 'topical', 'inhaler', 'patch')),
  manufacturer TEXT,
  description TEXT,
  warnings TEXT,
  side_effects TEXT,
  interactions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add some common medications
INSERT INTO medication_references (name, generic_name, strength, form) VALUES
('Lipitor', 'Atorvastatin', '10mg', 'tablet'),
('Lipitor', 'Atorvastatin', '20mg', 'tablet'),
('Lipitor', 'Atorvastatin', '40mg', 'tablet'),
('Lipitor', 'Atorvastatin', '80mg', 'tablet'),
('Zestril', 'Lisinopril', '5mg', 'tablet'),
('Zestril', 'Lisinopril', '10mg', 'tablet'),
('Zestril', 'Lisinopril', '20mg', 'tablet'),
('Zestril', 'Lisinopril', '40mg', 'tablet'),
('Glucophage', 'Metformin', '500mg', 'tablet'),
('Glucophage', 'Metformin', '850mg', 'tablet'),
('Glucophage', 'Metformin', '1000mg', 'tablet'),
('Synthroid', 'Levothyroxine', '25mcg', 'tablet'),
('Synthroid', 'Levothyroxine', '50mcg', 'tablet'),
('Synthroid', 'Levothyroxine', '75mcg', 'tablet'),
('Synthroid', 'Levothyroxine', '100mcg', 'tablet'),
('Ventolin HFA', 'Albuterol', '90mcg', 'inhaler'),
('ProAir HFA', 'Albuterol', '90mcg', 'inhaler'),
('Flonase', 'Fluticasone', '50mcg', 'inhaler'),
('Advair Diskus', 'Fluticasone-Salmeterol', '100-50mcg', 'inhaler'),
('Advair Diskus', 'Fluticasone-Salmeterol', '250-50mcg', 'inhaler'),
('Advair Diskus', 'Fluticasone-Salmeterol', '500-50mcg', 'inhaler');

-- Add RLS policies
ALTER TABLE medication_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view medication references" ON medication_references
  FOR SELECT
  USING (true);

-- Update the medications search function to use the new table
CREATE OR REPLACE FUNCTION search_medications(search_term TEXT)
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  strength TEXT,
  form TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mr.id,
    mr.name,
    mr.strength,
    mr.form
  FROM medication_references mr
  WHERE 
    mr.name ILIKE '%' || search_term || '%' OR
    mr.generic_name ILIKE '%' || search_term || '%'
  ORDER BY 
    CASE 
      WHEN mr.name ILIKE search_term || '%' THEN 1
      WHEN mr.generic_name ILIKE search_term || '%' THEN 2
      ELSE 3
    END,
    mr.name,
    mr.strength
  LIMIT 10;
END;
$$ LANGUAGE plpgsql; 