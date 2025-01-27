-- Create a function to handle timeline event creation with proper type casting
CREATE OR REPLACE FUNCTION create_timeline_event(
  p_patient_id INTEGER,
  p_type TEXT,
  p_date TIMESTAMPTZ,
  p_title TEXT,
  p_description TEXT,
  p_vitals_id INTEGER,
  p_user_id UUID,
  p_created_by UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Insert the timeline event with proper type casting
  INSERT INTO timeline_events (
    patient_id,
    type,
    date,
    title,
    description,
    vitals_id,
    user_id,
    created_by
  )
  VALUES (
    p_patient_id,
    p_type::event_type,
    p_date,
    p_title,
    p_description,
    p_vitals_id,
    p_user_id,
    p_created_by
  )
  RETURNING jsonb_build_object(
    'id', id,
    'patient_id', patient_id,
    'type', type,
    'date', date,
    'title', title,
    'description', description,
    'vitals_id', vitals_id,
    'user_id', user_id,
    'created_by', created_by,
    'created_at', created_at
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_timeline_event TO authenticated;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema'; 