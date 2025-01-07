-- Drop existing notifications policies
DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;

-- Create a more permissive insert policy for notifications
CREATE POLICY "Users can insert notifications"
    ON notifications
    FOR INSERT
    WITH CHECK (
        -- Allow users to create notifications for themselves
        auth.uid() = user_id
        OR 
        -- Allow creating notifications for share recipients
        EXISTS (
            SELECT 1 FROM patient_shares ps
            WHERE ps.shared_by_user_id = auth.uid()
            AND ps.shared_with_user_id = notifications.user_id
        )
        OR
        EXISTS (
            SELECT 1 FROM pending_shares ps
            WHERE ps.shared_by_user_id = auth.uid()
            AND ps.email = (
                SELECT email FROM auth.users WHERE id = notifications.user_id
            )
        )
    ); 