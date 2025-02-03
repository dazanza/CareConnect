-- Add composite indexes for common join patterns
CREATE INDEX IF NOT EXISTS idx_medications_patient_date 
ON medications (patient_id, start_date DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_appointments_patient_date 
ON appointments (patient_id, date DESC NULLS LAST);

-- Create materialized view for patient timeline
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_patient_timeline AS
SELECT 
  'medication' as event_type,
  m.id as event_id,
  m.patient_id,
  m.name as title,
  m.start_date as event_date,
  m.status,
  m.dosage || ' - ' || m.frequency as description
FROM medications m
UNION ALL
SELECT 
  'appointment' as event_type,
  a.id as event_id,
  a.patient_id,
  a.type as title,
  a.date as event_date,
  NULL as status,
  a.notes as description
FROM appointments a;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_patient_timeline 
ON mv_patient_timeline (patient_id, event_date DESC NULLS LAST);

-- Create secure view for timeline access
CREATE OR REPLACE VIEW patient_timeline AS
SELECT t.*
FROM mv_patient_timeline t
JOIN patients p ON t.patient_id = p.id
WHERE p.user_id = auth.uid()
   OR EXISTS (
     SELECT 1 FROM patient_shares ps 
     WHERE ps.patient_id = t.patient_id 
     AND ps.shared_with_user_id = auth.uid()
     AND (ps.expires_at IS NULL OR ps.expires_at > CURRENT_TIMESTAMP)
   );

-- Create function to refresh timeline
CREATE OR REPLACE FUNCTION refresh_patient_timeline()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_patient_timeline;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to refresh timeline
CREATE TRIGGER refresh_timeline_medications
AFTER INSERT OR UPDATE OR DELETE ON medications
FOR EACH STATEMENT EXECUTE FUNCTION refresh_patient_timeline();

CREATE TRIGGER refresh_timeline_appointments
AFTER INSERT OR UPDATE OR DELETE ON appointments
FOR EACH STATEMENT EXECUTE FUNCTION refresh_patient_timeline(); 