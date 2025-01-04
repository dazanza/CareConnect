-- Verify emails for all users
UPDATE auth.users
SET 
  email_confirmed_at = NOW(),
  raw_user_meta_data = jsonb_set(
    CASE 
      WHEN raw_user_meta_data IS NULL THEN '{}'::jsonb
      ELSE raw_user_meta_data 
    END,
    '{email_verified}',
    'true'
  ),
  confirmation_token = '',
  updated_at = NOW()
WHERE email_confirmed_at IS NULL
   OR raw_user_meta_data->>'email_verified' IS NULL
   OR raw_user_meta_data->>'email_verified' = 'false'; 