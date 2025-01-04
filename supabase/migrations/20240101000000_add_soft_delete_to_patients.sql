-- Add deleted_at and status columns to patients table
ALTER TABLE patients 
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deleted'));

-- Create an index on deleted_at for better query performance
CREATE INDEX idx_patients_deleted_at ON patients(deleted_at);

-- Create a view for active patients only
CREATE OR REPLACE VIEW active_patients AS
SELECT *
FROM patients
WHERE deleted_at IS NULL AND status = 'active';

-- Update RLS policies to exclude deleted patients
ALTER POLICY "Users can view their own patients" ON patients
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Function to soft delete a patient
CREATE OR REPLACE FUNCTION soft_delete_patient(patient_id INTEGER)
RETURNS VOID AS $$
BEGIN
    -- Update the patient record
    UPDATE patients
    SET deleted_at = NOW(),
        status = 'deleted'
    WHERE id = patient_id;
    
    -- Here you could add additional logic for related records
    -- For example, cancelling appointments, etc.
END;
$$ LANGUAGE plpgsql; 