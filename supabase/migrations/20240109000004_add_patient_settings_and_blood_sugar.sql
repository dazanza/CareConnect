-- Create patient_settings table
CREATE TABLE IF NOT EXISTS patient_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    track_blood_sugar BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(patient_id)
);

-- Add RLS policies for patient_settings
ALTER TABLE patient_settings ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their patients' settings
CREATE POLICY "Users can view their patients' settings"
    ON patient_settings
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM patients
            WHERE patients.id = patient_settings.patient_id
            AND (
                patients.user_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM patient_shares
                    WHERE patient_shares.patient_id = patients.id
                    AND patient_shares.shared_with_user_id = auth.uid()
                    AND patient_shares.access_level = ANY (ARRAY['read', 'write', 'admin'])
                    AND (patient_shares.expires_at IS NULL OR patient_shares.expires_at > now())
                )
            )
        )
    );

-- Policy to allow users to update their patients' settings
CREATE POLICY "Users can update their patients' settings"
    ON patient_settings
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM patients
            WHERE patients.id = patient_settings.patient_id
            AND (
                patients.user_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM patient_shares
                    WHERE patient_shares.patient_id = patients.id
                    AND patient_shares.shared_with_user_id = auth.uid()
                    AND patient_shares.access_level = ANY (ARRAY['write', 'admin'])
                    AND (patient_shares.expires_at IS NULL OR patient_shares.expires_at > now())
                )
            )
        )
    );

-- Policy to allow users to insert their patients' settings
CREATE POLICY "Users can insert their patients' settings"
    ON patient_settings
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM patients
            WHERE patients.id = patient_settings.patient_id
            AND (
                patients.user_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM patient_shares
                    WHERE patient_shares.patient_id = patients.id
                    AND patient_shares.shared_with_user_id = auth.uid()
                    AND patient_shares.access_level = ANY (ARRAY['write', 'admin'])
                    AND (patient_shares.expires_at IS NULL OR patient_shares.expires_at > now())
                )
            )
        )
    );

-- Add blood_sugar column to vitals table
ALTER TABLE vitals ADD COLUMN blood_sugar INTEGER;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema'; 