-- Add INSERT policy for notifications table
CREATE POLICY "Users can insert notifications"
    ON notifications
    FOR INSERT
    WITH CHECK (auth.uid() = user_id); 