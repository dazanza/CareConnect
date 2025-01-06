-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own profile
CREATE POLICY "Users can view own profile"
    ON users
    FOR SELECT
    USING (auth.uid() = id);

-- Policy to allow users to update their own profile
CREATE POLICY "Users can update own profile"
    ON users
    FOR UPDATE
    USING (auth.uid() = id);

-- Policy to allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
    ON users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy to allow authenticated users to create their initial profile
CREATE POLICY "Users can create initial profile"
    ON users
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL); 