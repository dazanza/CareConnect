-- First drop all RLS policies
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname 
              FROM pg_policies 
              WHERE schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- First remove default values that use requesting_user_id_immutable()
ALTER TABLE app_logins ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE appointments ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE doctors ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE immunizations ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE user_family_group ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE users ALTER COLUMN user_id DROP DEFAULT;

-- Now we can drop the function
DROP FUNCTION IF EXISTS requesting_user_id_immutable();

-- Drop Clerk-specific columns and mapping table
ALTER TABLE users DROP COLUMN IF EXISTS clerk_id;
ALTER TABLE users DROP COLUMN IF EXISTS old_clerk_id;
ALTER TABLE users DROP COLUMN IF EXISTS supabase_id;
ALTER TABLE users DROP COLUMN IF EXISTS user_id;
DROP TABLE IF EXISTS user_id_mapping;

-- Update user_id columns to UUID type
ALTER TABLE todos ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE patient_doctors ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE patients ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE vitals ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE doctors ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE appointments ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE medical_files ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE medications ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE notes ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE prescriptions ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE immunizations ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE app_logins ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE pending_shares ALTER COLUMN shared_by_user_id TYPE uuid USING shared_by_user_id::uuid;
ALTER TABLE pending_shares ALTER COLUMN claimed_by_user_id TYPE uuid USING claimed_by_user_id::uuid;
ALTER TABLE user_family_group ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

-- Update default values to use auth.uid()
ALTER TABLE todos ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE patient_doctors ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE patients ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE vitals ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE doctors ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE appointments ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE medical_files ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE medications ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE notes ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE prescriptions ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE immunizations ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE app_logins ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE user_family_group ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE pending_shares ALTER COLUMN shared_by_user_id SET DEFAULT auth.uid();

-- Delete all data from tables except users
TRUNCATE TABLE todos CASCADE;
TRUNCATE TABLE patient_doctors CASCADE;
TRUNCATE TABLE patients CASCADE;
TRUNCATE TABLE vitals CASCADE;
TRUNCATE TABLE doctors CASCADE;
TRUNCATE TABLE appointments CASCADE;
TRUNCATE TABLE medical_files CASCADE;
TRUNCATE TABLE medications CASCADE;
TRUNCATE TABLE notes CASCADE;
TRUNCATE TABLE prescriptions CASCADE;
TRUNCATE TABLE immunizations CASCADE;
TRUNCATE TABLE app_logins CASCADE;
TRUNCATE TABLE medical_history CASCADE;
TRUNCATE TABLE allergies CASCADE;
TRUNCATE TABLE lab_results CASCADE;
TRUNCATE TABLE documents CASCADE;
TRUNCATE TABLE timeline_events CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE patient_shares CASCADE;
TRUNCATE TABLE pending_shares CASCADE;
TRUNCATE TABLE user_family_group CASCADE;
TRUNCATE TABLE family_groups CASCADE;
TRUNCATE TABLE patient_family_group CASCADE;

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE immunizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_family_group ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_family_group ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies using auth.uid()
-- Users table policies
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Todos policies
CREATE POLICY "Users can view their own todos" ON todos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own todos" ON todos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos" ON todos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos" ON todos
    FOR DELETE USING (auth.uid() = user_id);

-- Patient policies
CREATE POLICY "Users can view their own patients" ON patients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared patients" ON patients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM patient_shares
            WHERE patient_shares.patient_id = patients.id
            AND patient_shares.shared_with_user_id = auth.uid()
            AND patient_shares.access_level = ANY (ARRAY['read', 'write', 'admin'])
            AND (patient_shares.expires_at IS NULL OR patient_shares.expires_at > now())
        )
    );

CREATE POLICY "Users can insert their own patients" ON patients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own patients" ON patients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can update shared patients" ON patients
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM patient_shares
            WHERE patient_shares.patient_id = patients.id
            AND patient_shares.shared_with_user_id = auth.uid()
            AND patient_shares.access_level = ANY (ARRAY['write', 'admin'])
            AND (patient_shares.expires_at IS NULL OR patient_shares.expires_at > now())
        )
    );

CREATE POLICY "Users can delete their own patients" ON patients
    FOR DELETE USING (auth.uid() = user_id);

-- Patient doctors policies
CREATE POLICY "Users can view their patient_doctors" ON patient_doctors
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM patient_shares
            WHERE patient_shares.patient_id = patient_doctors.patient_id
            AND patient_shares.shared_with_user_id = auth.uid()
            AND patient_shares.access_level = ANY (ARRAY['read', 'write', 'admin'])
            AND (patient_shares.expires_at IS NULL OR patient_shares.expires_at > now())
        )
    );

CREATE POLICY "Users can insert patient_doctors" ON patient_doctors
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update patient_doctors" ON patient_doctors
    FOR UPDATE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM patient_shares
            WHERE patient_shares.patient_id = patient_doctors.patient_id
            AND patient_shares.shared_with_user_id = auth.uid()
            AND patient_shares.access_level = ANY (ARRAY['write', 'admin'])
            AND (patient_shares.expires_at IS NULL OR patient_shares.expires_at > now())
        )
    );

CREATE POLICY "Users can delete patient_doctors" ON patient_doctors
    FOR DELETE USING (auth.uid() = user_id);

-- Vitals policies with sharing
CREATE POLICY "Users can view their vitals" ON vitals
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM patient_shares
            WHERE patient_shares.patient_id = vitals.patient_id
            AND patient_shares.shared_with_user_id = auth.uid()
            AND patient_shares.access_level = ANY (ARRAY['read', 'write', 'admin'])
            AND (patient_shares.expires_at IS NULL OR patient_shares.expires_at > now())
        )
    );

CREATE POLICY "Users can insert vitals" ON vitals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update vitals" ON vitals
    FOR UPDATE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM patient_shares
            WHERE patient_shares.patient_id = vitals.patient_id
            AND patient_shares.shared_with_user_id = auth.uid()
            AND patient_shares.access_level = ANY (ARRAY['write', 'admin'])
            AND (patient_shares.expires_at IS NULL OR patient_shares.expires_at > now())
        )
    );

CREATE POLICY "Users can delete vitals" ON vitals
    FOR DELETE USING (auth.uid() = user_id);

-- Doctors policies
CREATE POLICY "Users can view their doctors" ON doctors
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert doctors" ON doctors
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update doctors" ON doctors
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete doctors" ON doctors
    FOR DELETE USING (auth.uid() = user_id);

-- Appointments policies with sharing
CREATE POLICY "Users can view their appointments" ON appointments
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM patient_shares
            WHERE patient_shares.patient_id = appointments.patient_id
            AND patient_shares.shared_with_user_id = auth.uid()
            AND patient_shares.access_level = ANY (ARRAY['read', 'write', 'admin'])
            AND (patient_shares.expires_at IS NULL OR patient_shares.expires_at > now())
        )
    );

CREATE POLICY "Users can insert appointments" ON appointments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update appointments" ON appointments
    FOR UPDATE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM patient_shares
            WHERE patient_shares.patient_id = appointments.patient_id
            AND patient_shares.shared_with_user_id = auth.uid()
            AND patient_shares.access_level = ANY (ARRAY['write', 'admin'])
            AND (patient_shares.expires_at IS NULL OR patient_shares.expires_at > now())
        )
    );

CREATE POLICY "Users can delete appointments" ON appointments
    FOR DELETE USING (auth.uid() = user_id);

-- Medical files policies with sharing
CREATE POLICY "Users can view their medical_files" ON medical_files
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM patient_shares
            WHERE patient_shares.patient_id = medical_files.patient_id
            AND patient_shares.shared_with_user_id = auth.uid()
            AND patient_shares.access_level = ANY (ARRAY['read', 'write', 'admin'])
            AND (patient_shares.expires_at IS NULL OR patient_shares.expires_at > now())
        )
    );

CREATE POLICY "Users can insert medical_files" ON medical_files
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update medical_files" ON medical_files
    FOR UPDATE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM patient_shares
            WHERE patient_shares.patient_id = medical_files.patient_id
            AND patient_shares.shared_with_user_id = auth.uid()
            AND patient_shares.access_level = ANY (ARRAY['write', 'admin'])
            AND (patient_shares.expires_at IS NULL OR patient_shares.expires_at > now())
        )
    );

CREATE POLICY "Users can delete medical_files" ON medical_files
    FOR DELETE USING (auth.uid() = user_id);

-- Medications policies with sharing
CREATE POLICY "Users can view their medications" ON medications
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM patient_shares
            WHERE patient_shares.patient_id = medications.patient_id
            AND patient_shares.shared_with_user_id = auth.uid()
            AND patient_shares.access_level = ANY (ARRAY['read', 'write', 'admin'])
            AND (patient_shares.expires_at IS NULL OR patient_shares.expires_at > now())
        )
    );

CREATE POLICY "Users can insert medications" ON medications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update medications" ON medications
    FOR UPDATE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM patient_shares
            WHERE patient_shares.patient_id = medications.patient_id
            AND patient_shares.shared_with_user_id = auth.uid()
            AND patient_shares.access_level = ANY (ARRAY['write', 'admin'])
            AND (patient_shares.expires_at IS NULL OR patient_shares.expires_at > now())
        )
    );

CREATE POLICY "Users can delete medications" ON medications
    FOR DELETE USING (auth.uid() = user_id);

-- Notes policies with sharing
CREATE POLICY "Users can view their notes" ON notes
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM patient_shares
            WHERE patient_shares.patient_id = notes.patient_id
            AND patient_shares.shared_with_user_id = auth.uid()
            AND patient_shares.access_level = ANY (ARRAY['read', 'write', 'admin'])
            AND (patient_shares.expires_at IS NULL OR patient_shares.expires_at > now())
        )
    );

CREATE POLICY "Users can insert notes" ON notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update notes" ON notes
    FOR UPDATE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM patient_shares
            WHERE patient_shares.patient_id = notes.patient_id
            AND patient_shares.shared_with_user_id = auth.uid()
            AND patient_shares.access_level = ANY (ARRAY['write', 'admin'])
            AND (patient_shares.expires_at IS NULL OR patient_shares.expires_at > now())
        )
    );

CREATE POLICY "Users can delete notes" ON notes
    FOR DELETE USING (auth.uid() = user_id);

-- Prescriptions policies with sharing
CREATE POLICY "Users can view their prescriptions" ON prescriptions
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM patient_shares
            WHERE patient_shares.patient_id = prescriptions.patient_id
            AND patient_shares.shared_with_user_id = auth.uid()
            AND patient_shares.access_level = ANY (ARRAY['read', 'write', 'admin'])
            AND (patient_shares.expires_at IS NULL OR patient_shares.expires_at > now())
        )
    );

CREATE POLICY "Users can insert prescriptions" ON prescriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update prescriptions" ON prescriptions
    FOR UPDATE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM patient_shares
            WHERE patient_shares.patient_id = prescriptions.patient_id
            AND patient_shares.shared_with_user_id = auth.uid()
            AND patient_shares.access_level = ANY (ARRAY['write', 'admin'])
            AND (patient_shares.expires_at IS NULL OR patient_shares.expires_at > now())
        )
    );

CREATE POLICY "Users can delete prescriptions" ON prescriptions
    FOR DELETE USING (auth.uid() = user_id);

-- Patient shares policies
CREATE POLICY "Users can view shares they created" ON patient_shares
    FOR SELECT USING (auth.uid() = shared_by_user_id);

CREATE POLICY "Users can view shares they received" ON patient_shares
    FOR SELECT USING (auth.uid() = shared_with_user_id);

CREATE POLICY "Users can create shares for their patients" ON patient_shares
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM patients
            WHERE patients.id = patient_id
            AND patients.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update shares they created" ON patient_shares
    FOR UPDATE USING (auth.uid() = shared_by_user_id);

CREATE POLICY "Users can delete shares they created" ON patient_shares
    FOR DELETE USING (auth.uid() = shared_by_user_id);

-- Pending shares policies
CREATE POLICY "Users can view pending shares they created" ON pending_shares
    FOR SELECT USING (auth.uid() = shared_by_user_id);

CREATE POLICY "Users can create pending shares" ON pending_shares
    FOR INSERT WITH CHECK (auth.uid() = shared_by_user_id);

CREATE POLICY "Users can update their pending shares" ON pending_shares
    FOR UPDATE USING (auth.uid() = shared_by_user_id);

CREATE POLICY "Users can delete their pending shares" ON pending_shares
    FOR DELETE USING (auth.uid() = shared_by_user_id);

-- Family groups policies
CREATE POLICY "Users can view their family groups" ON family_groups
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create family groups" ON family_groups
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their family groups" ON family_groups
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their family groups" ON family_groups
    FOR DELETE USING (auth.uid() = user_id);

-- User family group policies
CREATE POLICY "Users can view their family group memberships" ON user_family_group
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can join family groups" ON user_family_group
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave family groups" ON user_family_group
    FOR DELETE USING (auth.uid() = user_id);

-- Patient family group policies
CREATE POLICY "Users can view their patient family groups" ON patient_family_group
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add patients to family groups" ON patient_family_group
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update patient family group relationships" ON patient_family_group
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can remove patients from family groups" ON patient_family_group
    FOR DELETE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Timeline events policies
CREATE POLICY "Users can view their timeline events" ON timeline_events
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM patient_shares
            WHERE patient_shares.patient_id = timeline_events.patient_id
            AND patient_shares.shared_with_user_id = auth.uid()
            AND patient_shares.access_level = ANY (ARRAY['read', 'write', 'admin'])
            AND (patient_shares.expires_at IS NULL OR patient_shares.expires_at > now())
        )
    );

CREATE POLICY "Users can create timeline events" ON timeline_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update timeline events" ON timeline_events
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete timeline events" ON timeline_events
    FOR DELETE USING (auth.uid() = user_id); 