CREATE OR REPLACE FUNCTION share_patient_with_notification(
  p_patient_id INT,
  p_shared_by_user_id UUID,
  p_shared_with_user_id UUID,
  p_access_level TEXT,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_patient RECORD;
  v_share RECORD;
  v_result JSONB;
BEGIN
  -- Get patient details
  SELECT first_name, last_name INTO v_patient
  FROM patients
  WHERE id = p_patient_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Patient not found';
  END IF;

  -- Check if share already exists
  SELECT id INTO v_share
  FROM patient_shares
  WHERE patient_id = p_patient_id
  AND shared_with_user_id = p_shared_with_user_id;

  IF FOUND THEN
    RAISE EXCEPTION 'Patient is already shared with this user';
  END IF;

  -- Create share
  INSERT INTO patient_shares (
    patient_id,
    shared_by_user_id,
    shared_with_user_id,
    access_level,
    expires_at
  )
  VALUES (
    p_patient_id,
    p_shared_by_user_id,
    p_shared_with_user_id,
    p_access_level,
    p_expires_at
  )
  RETURNING * INTO v_share;

  -- Create notification
  INSERT INTO notifications (
    user_id,
    type,
    message,
    data
  )
  VALUES (
    p_shared_with_user_id,
    'share_received',
    format('You have been given %s access to patient %s %s', 
      p_access_level, 
      v_patient.first_name, 
      v_patient.last_name
    ),
    jsonb_build_object(
      'patientId', p_patient_id,
      'shareId', v_share.id,
      'accessLevel', p_access_level
    )
  );

  -- Return the share data
  v_result := jsonb_build_object(
    'id', v_share.id,
    'patient_id', v_share.patient_id,
    'shared_by_user_id', v_share.shared_by_user_id,
    'shared_with_user_id', v_share.shared_with_user_id,
    'access_level', v_share.access_level,
    'expires_at', v_share.expires_at,
    'created_at', v_share.created_at
  );

  RETURN v_result;
END;
$$; 