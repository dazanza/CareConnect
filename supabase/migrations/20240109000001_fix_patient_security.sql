-- Drop the existing SECURITY DEFINER view
DROP VIEW IF EXISTS public.active_patients;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own patients" ON patients;
DROP POLICY IF EXISTS "Providers can insert their own patients" ON patients;
DROP POLICY IF EXISTS "Providers can update their own patients" ON patients;
DROP POLICY IF EXISTS "Providers can delete their own patients" ON patients;

-- Create a new view without SECURITY DEFINER
CREATE VIEW public.active_patients AS
SELECT 
  p.*,
  u.email as provider_email,
  u.first_name as provider_first_name,
  u.last_name as provider_last_name
FROM patients p
JOIN users u ON p.user_id = u.id
WHERE p.status = 'active';

-- Enable RLS on the view
ALTER VIEW public.active_patients SET (security_invoker = true);

-- Create RLS policies for the patients table
CREATE POLICY "Users can view their own patients"
ON patients
FOR SELECT
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM patient_shares ps
    WHERE ps.patient_id = patients.id
    AND ps.shared_with_user_id = auth.uid()
    AND (ps.expires_at IS NULL OR ps.expires_at > NOW())
  )
);

CREATE POLICY "Providers can insert their own patients"
ON patients
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Providers can update their own patients"
ON patients
FOR UPDATE
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM patient_shares ps
    WHERE ps.patient_id = patients.id
    AND ps.shared_with_user_id = auth.uid()
    AND ps.access_level IN ('write', 'admin')
    AND (ps.expires_at IS NULL OR ps.expires_at > NOW())
  )
);

CREATE POLICY "Providers can delete their own patients"
ON patients
FOR DELETE
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM patient_shares ps
    WHERE ps.patient_id = patients.id
    AND ps.shared_with_user_id = auth.uid()
    AND ps.access_level = 'admin'
    AND (ps.expires_at IS NULL OR ps.expires_at > NOW())
  )
);

-- Enable RLS on the patients table if not already enabled
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema'; 