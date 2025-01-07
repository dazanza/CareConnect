-- Add foreign key constraints for patient_shares table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_patient_shares_shared_by_user'
    ) THEN
        ALTER TABLE patient_shares
        ADD CONSTRAINT fk_patient_shares_shared_by_user
        FOREIGN KEY (shared_by_user_id) REFERENCES users(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_patient_shares_shared_with_user'
    ) THEN
        ALTER TABLE patient_shares
        ADD CONSTRAINT fk_patient_shares_shared_with_user
        FOREIGN KEY (shared_with_user_id) REFERENCES users(id);
    END IF;
END $$;

-- Drop existing notification insert policy
DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;
DROP POLICY IF EXISTS "System can create share notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications for themselves" ON notifications;

-- Create new notification policies
CREATE POLICY "Users can insert share notifications"
ON notifications
FOR INSERT
WITH CHECK (
  -- Allow notifications to be created when:
  -- 1. The notification is for the current user (self-notifications)
  -- 2. OR it's a share notification and the current user is the sharer
  (auth.uid() = user_id) OR
  (
    type = 'share_received' AND
    EXISTS (
      SELECT 1 FROM patient_shares ps
      WHERE ps.shared_with_user_id = notifications.user_id
      AND ps.shared_by_user_id = auth.uid()
      AND ps.id = (notifications.data->>'shareId')::uuid
    )
  )
);

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema'; 