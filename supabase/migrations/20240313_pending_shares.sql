CREATE TABLE pending_shares (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  email TEXT NOT NULL,
  access_level TEXT NOT NULL,
  shared_by_user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  claimed_by_user_id TEXT
);

-- Add RLS policies
ALTER TABLE pending_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage pending shares they created"
ON pending_shares FOR ALL
TO authenticated
USING (shared_by_user_id = requesting_user_id());

CREATE POLICY "Users can view pending shares for their email"
ON pending_shares FOR SELECT
TO authenticated
USING (email = (SELECT email FROM users WHERE user_id = requesting_user_id())); 