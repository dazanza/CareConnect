-- Create backup schema
CREATE SCHEMA IF NOT EXISTS backup_20240105;

-- Drop existing backup tables if they exist
DROP TABLE IF EXISTS backup_20240105.rls_policies;
DROP TABLE IF EXISTS backup_20240105.unique_clerk_users;
DROP TABLE IF EXISTS user_id_mapping;

-- First, let's find all unique Clerk user IDs from our tables
CREATE TEMP TABLE unique_clerk_users AS
SELECT DISTINCT user_id as clerk_id
FROM (
    SELECT user_id FROM todos
    UNION
    SELECT user_id FROM medical_files
    UNION
    SELECT user_id FROM medications
    UNION
    SELECT user_id FROM notes
    UNION
    SELECT user_id FROM patient_doctors
    UNION
    SELECT user_id FROM patients
    UNION
    SELECT user_id FROM prescriptions
    UNION
    SELECT user_id FROM vitals
) all_users
WHERE user_id IS NOT NULL
AND user_id LIKE 'user_%'; -- Only get Clerk IDs

-- Add new columns to users table if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS supabase_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS old_clerk_id TEXT;

-- Insert records into users table for each unique Clerk user with a temporary email
INSERT INTO users (id, clerk_id, email)
SELECT 
    gen_random_uuid() as id,
    clerk_id,
    clerk_id || '@temp-migration.com' as email
FROM unique_clerk_users
ON CONFLICT (clerk_id) DO NOTHING;

-- Create mapping table that handles both Clerk IDs and existing UUIDs
CREATE TABLE user_id_mapping AS
-- For Clerk IDs, use the new UUID from users table
SELECT id as new_id, clerk_id as old_id
FROM users
WHERE clerk_id LIKE 'user_%'
UNION ALL
-- For existing UUIDs, use them as-is
SELECT user_id::uuid as new_id, user_id as old_id
FROM (
    SELECT DISTINCT user_id
    FROM (
        SELECT user_id FROM todos
        UNION
        SELECT user_id FROM medical_files
        UNION
        SELECT user_id FROM medications
        UNION
        SELECT user_id FROM notes
        UNION
        SELECT user_id FROM patient_doctors
        UNION
        SELECT user_id FROM patients
        UNION
        SELECT user_id FROM prescriptions
        UNION
        SELECT user_id FROM vitals
    ) all_users
    WHERE user_id IS NOT NULL
    AND user_id NOT LIKE 'user_%'
    AND user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
) existing_uuids;

-- Backup existing policies
CREATE TABLE backup_20240105.rls_policies AS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public';

-- Drop existing RLS policies temporarily
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

-- Update user_id in tables that have data
UPDATE todos t
SET user_id = m.new_id::text
FROM user_id_mapping m
WHERE t.user_id = m.old_id;

UPDATE patient_doctors t
SET user_id = m.new_id::text
FROM user_id_mapping m
WHERE t.user_id = m.old_id;

UPDATE patients t
SET user_id = m.new_id::text
FROM user_id_mapping m
WHERE t.user_id = m.old_id;

UPDATE vitals t
SET user_id = m.new_id::text
FROM user_id_mapping m
WHERE t.user_id = m.old_id;

-- Re-enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitals ENABLE ROW LEVEL SECURITY;

-- Create new RLS policies using auth.uid()
-- Users table policies
CREATE POLICY "Users can view their own data"
    ON users FOR SELECT
    USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own data"
    ON users FOR UPDATE
    USING (auth.uid()::text = id::text);

-- Todos policies
CREATE POLICY "Users can view their own todos"
    ON todos FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own todos"
    ON todos FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own todos"
    ON todos FOR UPDATE
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own todos"
    ON todos FOR DELETE
    USING (auth.uid()::text = user_id);

-- Patient Doctors policies
CREATE POLICY "Users can view their patient_doctors"
    ON patient_doctors FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert patient_doctors"
    ON patient_doctors FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update patient_doctors"
    ON patient_doctors FOR UPDATE
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete patient_doctors"
    ON patient_doctors FOR DELETE
    USING (auth.uid()::text = user_id);

-- Patients policies
CREATE POLICY "Users can view their patients"
    ON patients FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert patients"
    ON patients FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update patients"
    ON patients FOR UPDATE
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete patients"
    ON patients FOR DELETE
    USING (auth.uid()::text = user_id);

-- Vitals policies
CREATE POLICY "Users can view their vitals"
    ON vitals FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert vitals"
    ON vitals FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update vitals"
    ON vitals FOR UPDATE
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete vitals"
    ON vitals FOR DELETE
    USING (auth.uid()::text = user_id);

-- Verify final state
SELECT table_name, COUNT(*) as records_with_uuid_user_id
FROM (
    SELECT 'todos' as table_name, user_id FROM todos
    UNION ALL
    SELECT 'patient_doctors', user_id FROM patient_doctors
    UNION ALL
    SELECT 'patients', user_id FROM patients
    UNION ALL
    SELECT 'vitals', user_id FROM vitals
) all_records
WHERE user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
GROUP BY table_name
ORDER BY table_name; 