-- Create materialized view for patient analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_patient_analytics AS
SELECT 
  p.id as patient_id,
  p.user_id,
  COUNT(DISTINCT m.id) as total_medications,
  COUNT(DISTINCT CASE WHEN m.status = 'active' THEN m.id END) as active_medications,
  COUNT(DISTINCT a.id) as total_appointments,
  COUNT(DISTINCT CASE WHEN a.date > CURRENT_TIMESTAMP THEN a.id END) as upcoming_appointments,
  COUNT(DISTINCT ps.id) as total_shares,
  MAX(a.date) as last_appointment,
  MIN(CASE WHEN a.date > CURRENT_TIMESTAMP THEN a.date END) as next_appointment
FROM patients p
LEFT JOIN medications m ON p.id = m.patient_id
LEFT JOIN appointments a ON p.id = a.patient_id
LEFT JOIN patient_shares ps ON p.id = ps.patient_id
GROUP BY p.id, p.user_id;

-- Create index on patient analytics
CREATE UNIQUE INDEX IF NOT EXISTS idx_patient_analytics_patient 
ON mv_patient_analytics (patient_id);

CREATE INDEX IF NOT EXISTS idx_patient_analytics_user 
ON mv_patient_analytics (user_id);

-- Create secure view for patient analytics
CREATE OR REPLACE VIEW patient_analytics AS
SELECT a.*
FROM mv_patient_analytics a
WHERE a.user_id = auth.uid()
   OR EXISTS (
     SELECT 1 FROM patient_shares ps 
     WHERE ps.patient_id = a.patient_id 
     AND ps.shared_with_user_id = auth.uid()
     AND (ps.expires_at IS NULL OR ps.expires_at > CURRENT_TIMESTAMP)
   );

-- Create materialized view for medication adherence
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_medication_adherence AS
SELECT 
  m.id as medication_id,
  m.patient_id,
  m.user_id,
  m.name,
  m.status,
  m.start_date,
  m.end_date,
  m.frequency,
  CASE 
    WHEN m.status = 'active' AND m.start_date <= CURRENT_DATE THEN
      CASE 
        WHEN m.frequency LIKE '%daily%' THEN 
          EXTRACT(DAY FROM CURRENT_DATE - m.start_date)::int
        WHEN m.frequency LIKE '%weekly%' THEN 
          FLOOR(EXTRACT(DAY FROM CURRENT_DATE - m.start_date) / 7)::int
        ELSE 1
      END
    ELSE 0
  END as expected_doses,
  0 as taken_doses -- This would be updated from your medication tracking system
FROM medications m;

-- Create indexes on medication adherence
CREATE UNIQUE INDEX IF NOT EXISTS idx_medication_adherence_med 
ON mv_medication_adherence (medication_id);

CREATE INDEX IF NOT EXISTS idx_medication_adherence_patient 
ON mv_medication_adherence (patient_id);

-- Create secure view for medication adherence
CREATE OR REPLACE VIEW medication_adherence AS
SELECT a.*
FROM mv_medication_adherence a
WHERE a.user_id = auth.uid()
   OR EXISTS (
     SELECT 1 FROM patient_shares ps 
     WHERE ps.patient_id = a.patient_id 
     AND ps.shared_with_user_id = auth.uid()
     AND (ps.expires_at IS NULL OR ps.expires_at > CURRENT_TIMESTAMP)
   );

-- Create refresh functions
CREATE OR REPLACE FUNCTION refresh_analytics()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_patient_analytics;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_medication_adherence;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER refresh_analytics_medications
AFTER INSERT OR UPDATE OR DELETE ON medications
FOR EACH STATEMENT EXECUTE FUNCTION refresh_analytics();

CREATE TRIGGER refresh_analytics_appointments
AFTER INSERT OR UPDATE OR DELETE ON appointments
FOR EACH STATEMENT EXECUTE FUNCTION refresh_analytics();

CREATE TRIGGER refresh_analytics_shares
AFTER INSERT OR UPDATE OR DELETE ON patient_shares
FOR EACH STATEMENT EXECUTE FUNCTION refresh_analytics(); 