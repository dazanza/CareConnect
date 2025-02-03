-- Add indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_appointments_user_date 
ON appointments (user_id, date);

CREATE INDEX IF NOT EXISTS idx_medications_user_status 
ON medications (user_id, status);

CREATE INDEX IF NOT EXISTS idx_patient_shares_patient_user 
ON patient_shares (patient_id, shared_with_user_id);

CREATE INDEX IF NOT EXISTS idx_patients_user_name 
ON patients (user_id, first_name, last_name);

-- Create materialized view for user statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_user_stats_raw AS
SELECT 
  u.id as user_id,
  COUNT(DISTINCT p.id) as patient_count,
  COUNT(DISTINCT a.id) as appointment_count,
  COUNT(DISTINCT m.id) as active_medication_count,
  COUNT(DISTINCT CASE WHEN ps.expires_at IS NULL OR ps.expires_at > CURRENT_TIMESTAMP AT TIME ZONE 'UTC' THEN ps.id END) as active_share_count
FROM auth.users u
LEFT JOIN patients p ON u.id = p.user_id
LEFT JOIN appointments a ON u.id = a.user_id
LEFT JOIN medications m ON u.id = m.user_id AND m.status = 'active'
LEFT JOIN patient_shares ps ON u.id = ps.shared_by_user_id
GROUP BY u.id;

-- Create a secure view on top of the materialized view
CREATE OR REPLACE VIEW user_stats AS
SELECT stats.*
FROM mv_user_stats_raw stats
WHERE stats.user_id = auth.uid();

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_stats_raw;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to refresh materialized view
CREATE TRIGGER refresh_user_stats_patients
AFTER INSERT OR UPDATE OR DELETE ON patients
FOR EACH STATEMENT EXECUTE FUNCTION refresh_user_stats();

CREATE TRIGGER refresh_user_stats_appointments
AFTER INSERT OR UPDATE OR DELETE ON appointments
FOR EACH STATEMENT EXECUTE FUNCTION refresh_user_stats();

CREATE TRIGGER refresh_user_stats_medications
AFTER INSERT OR UPDATE OR DELETE ON medications
FOR EACH STATEMENT EXECUTE FUNCTION refresh_user_stats();

CREATE TRIGGER refresh_user_stats_shares
AFTER INSERT OR UPDATE OR DELETE ON patient_shares
FOR EACH STATEMENT EXECUTE FUNCTION refresh_user_stats(); 