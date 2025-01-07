-- Drop existing foreign key constraints if they exist
ALTER TABLE patient_shares 
  DROP CONSTRAINT IF EXISTS patient_shares_shared_by_user_id_fkey,
  DROP CONSTRAINT IF EXISTS patient_shares_shared_with_user_id_fkey,
  DROP CONSTRAINT IF EXISTS patient_shares_patient_id_fkey;

-- Add proper foreign key constraints
ALTER TABLE patient_shares
  ADD CONSTRAINT patient_shares_shared_by_user_id_fkey 
    FOREIGN KEY (shared_by_user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE,
  ADD CONSTRAINT patient_shares_shared_with_user_id_fkey 
    FOREIGN KEY (shared_with_user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE,
  ADD CONSTRAINT patient_shares_patient_id_fkey 
    FOREIGN KEY (patient_id) 
    REFERENCES patients(id) 
    ON DELETE CASCADE; 