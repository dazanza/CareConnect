-- Create enum for audit action types
CREATE TYPE share_audit_action AS ENUM ('created', 'modified', 'expired', 'revoked');

-- Create share audit logs table
CREATE TABLE share_audit_logs (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Reference to the share being audited (can be either pending or active share)
  share_id UUID NOT NULL,
  
  -- Type of change that occurred
  action share_audit_action NOT NULL,
  
  -- Previous and new states stored as JSONB for flexibility
  previous_state JSONB,
  new_state JSONB,
  
  -- Who made the change
  changed_by_user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- When the change occurred
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  
  -- Additional metadata
  metadata JSONB
);

-- Add indexes for common query patterns
CREATE INDEX idx_share_audit_logs_share_id ON share_audit_logs(share_id);
CREATE INDEX idx_share_audit_logs_changed_by ON share_audit_logs(changed_by_user_id);
CREATE INDEX idx_share_audit_logs_created_at ON share_audit_logs(created_at);

-- Add RLS policies
ALTER TABLE share_audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can view audit logs for shares they created or have access to
CREATE POLICY "Users can view audit logs for their shares" ON share_audit_logs
  FOR SELECT
  USING (
    auth.uid() = changed_by_user_id OR
    EXISTS (
      SELECT 1 FROM patient_shares ps
      WHERE ps.id = share_audit_logs.share_id
      AND (
        ps.shared_by_user_id = auth.uid() OR
        ps.shared_with_user_id = auth.uid()
      )
    ) OR
    EXISTS (
      SELECT 1 FROM pending_shares ps
      WHERE ps.id = share_audit_logs.share_id
      AND ps.shared_by_user_id = auth.uid()
    )
  );

-- Only the system can insert audit logs
CREATE POLICY "System can insert audit logs" ON share_audit_logs
  FOR INSERT
  WITH CHECK (auth.uid() = changed_by_user_id);

-- No updates allowed to audit logs
CREATE POLICY "No updates to audit logs" ON share_audit_logs
  FOR UPDATE
  USING (false);

-- No deletes allowed to audit logs
CREATE POLICY "No deletes from audit logs" ON share_audit_logs
  FOR DELETE
  USING (false);

-- Create function to automatically log share changes
CREATE OR REPLACE FUNCTION log_share_change()
RETURNS TRIGGER AS $$
DECLARE
  action_type share_audit_action;
  previous_data JSONB;
  new_data JSONB;
BEGIN
  -- Determine the action type
  IF TG_OP = 'INSERT' THEN
    action_type := 'created';
    previous_data := NULL;
    new_data := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.expires_at IS NOT NULL AND NEW.expires_at <= now() THEN
      action_type := 'expired';
    ELSE
      action_type := 'modified';
    END IF;
    previous_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'revoked';
    previous_data := to_jsonb(OLD);
    new_data := NULL;
  END IF;

  -- Insert the audit log
  INSERT INTO share_audit_logs (
    share_id,
    action,
    previous_state,
    new_state,
    changed_by_user_id,
    metadata
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    action_type,
    previous_data,
    new_data,
    COALESCE(NEW.shared_by_user_id, OLD.shared_by_user_id),
    jsonb_build_object(
      'trigger_op', TG_OP,
      'table_name', TG_TABLE_NAME,
      'timestamp', now()
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add triggers to both share tables
CREATE TRIGGER log_patient_share_changes
  AFTER INSERT OR UPDATE OR DELETE ON patient_shares
  FOR EACH ROW EXECUTE FUNCTION log_share_change();

CREATE TRIGGER log_pending_share_changes
  AFTER INSERT OR UPDATE OR DELETE ON pending_shares
  FOR EACH ROW EXECUTE FUNCTION log_share_change();

-- Create table for share analytics
CREATE TABLE share_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  total_active_shares INTEGER NOT NULL,
  pending_invitations INTEGER NOT NULL,
  shares_by_access_level JSONB NOT NULL,
  expiring_soon INTEGER NOT NULL,
  avg_time_to_claim FLOAT NOT NULL,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Add RLS to analytics
ALTER TABLE share_analytics ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view analytics
CREATE POLICY "Users can view share analytics" ON share_analytics
  FOR SELECT
  USING (true);

-- Function to update analytics
CREATE OR REPLACE FUNCTION update_share_analytics()
RETURNS void AS $$
BEGIN
  -- Clear existing analytics
  DELETE FROM share_analytics;
  
  -- Insert new analytics
  WITH share_stats AS (
    SELECT
      COUNT(*) FILTER (WHERE expires_at IS NULL OR expires_at > now()) as total_active_shares,
      jsonb_build_object(
        'read', COUNT(*) FILTER (WHERE access_level = 'read'),
        'write', COUNT(*) FILTER (WHERE access_level = 'write'),
        'admin', COUNT(*) FILTER (WHERE access_level = 'admin')
      ) as shares_by_access_level,
      COUNT(*) FILTER (
        WHERE expires_at IS NOT NULL 
        AND expires_at > now() 
        AND expires_at <= now() + interval '30 days'
      ) as expiring_soon
    FROM patient_shares
  ),
  pending_stats AS (
    SELECT
      COUNT(*) FILTER (WHERE claimed_at IS NULL) as pending_invitations,
      EXTRACT(epoch FROM AVG(claimed_at - created_at))/3600 as avg_time_to_claim
    FROM pending_shares
    WHERE claimed_at IS NOT NULL
  )
  INSERT INTO share_analytics (
    total_active_shares,
    pending_invitations,
    shares_by_access_level,
    expiring_soon,
    avg_time_to_claim
  )
  SELECT
    s.total_active_shares,
    p.pending_invitations,
    s.shares_by_access_level,
    s.expiring_soon,
    COALESCE(p.avg_time_to_claim, 0) as avg_time_to_claim
  FROM share_stats s
  CROSS JOIN pending_stats p;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to update analytics when shares change
CREATE OR REPLACE FUNCTION refresh_share_analytics()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_share_analytics();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER refresh_patient_share_analytics
  AFTER INSERT OR UPDATE OR DELETE ON patient_shares
  FOR EACH STATEMENT EXECUTE FUNCTION refresh_share_analytics();

CREATE TRIGGER refresh_pending_share_analytics
  AFTER INSERT OR UPDATE OR DELETE ON pending_shares
  FOR EACH STATEMENT EXECUTE FUNCTION refresh_share_analytics();

-- Initial analytics calculation
SELECT update_share_analytics();

COMMENT ON TABLE share_audit_logs IS 'Audit log for tracking changes to patient shares';
COMMENT ON COLUMN share_audit_logs.id IS 'Unique identifier for the audit log entry';
COMMENT ON COLUMN share_audit_logs.share_id IS 'ID of the share (patient or pending) being audited';
COMMENT ON COLUMN share_audit_logs.action IS 'Type of change that occurred';
COMMENT ON COLUMN share_audit_logs.previous_state IS 'State of the share before the change';
COMMENT ON COLUMN share_audit_logs.new_state IS 'State of the share after the change';
COMMENT ON COLUMN share_audit_logs.changed_by_user_id IS 'User who made the change';
COMMENT ON COLUMN share_audit_logs.created_at IS 'When the change occurred';
COMMENT ON COLUMN share_audit_logs.metadata IS 'Additional metadata about the change';

COMMENT ON TABLE share_analytics IS 'Analytics for patient shares and invitations';
COMMENT ON COLUMN share_analytics.total_active_shares IS 'Number of active shares';
COMMENT ON COLUMN share_analytics.pending_invitations IS 'Number of unclaimed share invitations';
COMMENT ON COLUMN share_analytics.shares_by_access_level IS 'Breakdown of shares by access level';
COMMENT ON COLUMN share_analytics.expiring_soon IS 'Number of shares expiring in next 30 days';
COMMENT ON COLUMN share_analytics.avg_time_to_claim IS 'Average hours to claim an invitation'; 