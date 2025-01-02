-- Check table structure
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('clerk_id', 'supabase_id', 'email');

-- Check if users table has any data
SELECT COUNT(*) as total_users,
       COUNT(clerk_id) as users_with_clerk_id,
       COUNT(supabase_id) as users_with_supabase_id
FROM users;

-- Check the first few user records
SELECT id, email, 
       CASE 
           WHEN clerk_id IS NOT NULL THEN 'has_clerk_id'
           ELSE 'no_clerk_id'
       END as clerk_id_status,
       CASE 
           WHEN supabase_id IS NOT NULL THEN 'has_supabase_id'
           ELSE 'no_supabase_id'
       END as supabase_id_status
FROM users
LIMIT 5; 