-- Add soft delete columns to users table
ALTER TABLE users 
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;

-- Update RLS policies to exclude deleted users
ALTER POLICY "Users can view their own data" ON users
USING (auth.uid() = id AND (is_deleted IS NULL OR is_deleted = FALSE));

ALTER POLICY "Users can update their own data" ON users
USING (auth.uid() = id AND (is_deleted IS NULL OR is_deleted = FALSE));

ALTER POLICY "Users can insert their own data" ON users
WITH CHECK (auth.uid() = id AND (is_deleted IS NULL OR is_deleted = FALSE)); 