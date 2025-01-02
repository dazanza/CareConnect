-- Enable RLS on tables
ALTER TABLE public.medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allergies ENABLE ROW LEVEL SECURITY;

-- Create immutable version of requesting_user_id
CREATE OR REPLACE FUNCTION requesting_user_id_immutable()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    (current_setting('request.jwt.claims', true)::json->>'email')::text
  );
$$;

-- Add RLS policies for medical_history
CREATE POLICY "Users can manage medical history" ON public.medical_history
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM patients
    WHERE patients.id = medical_history.patient_id
    AND patients.user_id = requesting_user_id_immutable()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM patients
    WHERE patients.id = medical_history.patient_id
    AND patients.user_id = requesting_user_id_immutable()
  )
);

CREATE POLICY "Users can view shared medical history" ON public.medical_history
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM patient_shares
    WHERE patient_shares.patient_id = medical_history.patient_id
    AND patient_shares.shared_with_user_id::text = requesting_user_id_immutable()
    AND patient_shares.access_level = ANY (ARRAY['read', 'write', 'admin'])
    AND (patient_shares.expires_at IS NULL OR patient_shares.expires_at > now())
  )
);

-- Add RLS policies for admin_users
CREATE POLICY "Admins can manage admin_users" ON public.admin_users
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users a
    WHERE a.user_id::text = requesting_user_id_immutable()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users a
    WHERE a.user_id::text = requesting_user_id_immutable()
  )
);

-- Add RLS policies for allergies
CREATE POLICY "Users can manage allergies" ON public.allergies
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM patients
    WHERE patients.id = allergies.patient_id
    AND patients.user_id = requesting_user_id_immutable()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM patients
    WHERE patients.id = allergies.patient_id
    AND patients.user_id = requesting_user_id_immutable()
  )
);

CREATE POLICY "Users can view shared allergies" ON public.allergies
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM patient_shares
    WHERE patient_shares.patient_id = allergies.patient_id
    AND patient_shares.shared_with_user_id::text = requesting_user_id_immutable()
    AND patient_shares.access_level = ANY (ARRAY['read', 'write', 'admin'])
    AND (patient_shares.expires_at IS NULL OR patient_shares.expires_at > now())
  )
);

-- Update default values to use immutable function
ALTER TABLE public.app_logins ALTER COLUMN user_id SET DEFAULT requesting_user_id_immutable();
ALTER TABLE public.appointments ALTER COLUMN user_id SET DEFAULT requesting_user_id_immutable();
ALTER TABLE public.doctors ALTER COLUMN user_id SET DEFAULT requesting_user_id_immutable();
ALTER TABLE public.immunizations ALTER COLUMN user_id SET DEFAULT requesting_user_id_immutable();
ALTER TABLE public.medical_files ALTER COLUMN user_id SET DEFAULT requesting_user_id_immutable();
ALTER TABLE public.medications ALTER COLUMN user_id SET DEFAULT requesting_user_id_immutable();
ALTER TABLE public.notes ALTER COLUMN user_id SET DEFAULT requesting_user_id_immutable();
ALTER TABLE public.patient_doctors ALTER COLUMN user_id SET DEFAULT requesting_user_id_immutable();
ALTER TABLE public.patients ALTER COLUMN user_id SET DEFAULT requesting_user_id_immutable();
ALTER TABLE public.prescriptions ALTER COLUMN user_id SET DEFAULT requesting_user_id_immutable();
ALTER TABLE public.todos ALTER COLUMN user_id SET DEFAULT requesting_user_id_immutable();
ALTER TABLE public.user_family_group ALTER COLUMN user_id SET DEFAULT requesting_user_id_immutable();
ALTER TABLE public.users ALTER COLUMN user_id SET DEFAULT requesting_user_id_immutable();
ALTER TABLE public.vitals ALTER COLUMN user_id SET DEFAULT requesting_user_id_immutable(); 