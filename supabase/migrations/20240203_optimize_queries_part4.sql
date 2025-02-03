-- Enable the pg_trgm extension for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create search document materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_patient_search AS
SELECT 
  p.id as patient_id,
  p.user_id,
  p.first_name,
  p.last_name,
  p.date_of_birth,
  array_agg(DISTINCT m.name) as medications,
  array_agg(DISTINCT m.dosage) as dosages,
  array_agg(DISTINCT a.type) as appointment_types,
  array_agg(DISTINCT a.notes) FILTER (WHERE a.notes IS NOT NULL) as appointment_notes,
  to_tsvector('english',
    concat_ws(' ',
      p.first_name,
      p.last_name,
      string_agg(DISTINCT m.name, ' '),
      string_agg(DISTINCT m.dosage, ' '),
      string_agg(DISTINCT a.type, ' '),
      string_agg(DISTINCT a.notes, ' ')
    )
  ) as search_vector
FROM patients p
LEFT JOIN medications m ON p.id = m.patient_id
LEFT JOIN appointments a ON p.id = a.patient_id
GROUP BY p.id, p.user_id;

-- Create GIN indexes for fast text search
CREATE INDEX IF NOT EXISTS idx_patient_search_trgm 
ON mv_patient_search USING GIN (
  (first_name || ' ' || last_name) gin_trgm_ops
);

CREATE INDEX IF NOT EXISTS idx_patient_search_vector 
ON mv_patient_search USING GIN (search_vector);

-- Create secure view for search
CREATE OR REPLACE VIEW patient_search AS
SELECT s.*
FROM mv_patient_search s
WHERE s.user_id = auth.uid()
   OR EXISTS (
     SELECT 1 FROM patient_shares ps 
     WHERE ps.patient_id = s.patient_id 
     AND ps.shared_with_user_id = auth.uid()
     AND (ps.expires_at IS NULL OR ps.expires_at > CURRENT_TIMESTAMP)
   );

-- Create refresh function
CREATE OR REPLACE FUNCTION refresh_search()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_patient_search;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER refresh_search_patients
AFTER INSERT OR UPDATE OR DELETE ON patients
FOR EACH STATEMENT EXECUTE FUNCTION refresh_search();

CREATE TRIGGER refresh_search_medications
AFTER INSERT OR UPDATE OR DELETE ON medications
FOR EACH STATEMENT EXECUTE FUNCTION refresh_search();

CREATE TRIGGER refresh_search_appointments
AFTER INSERT OR UPDATE OR DELETE ON appointments
FOR EACH STATEMENT EXECUTE FUNCTION refresh_search(); 