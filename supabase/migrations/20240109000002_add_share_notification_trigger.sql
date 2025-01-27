-- Function to handle share notifications
CREATE OR REPLACE FUNCTION handle_share_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_patient_name text;
BEGIN
  -- Get patient name
  SELECT concat(first_name, ' ', last_name) INTO v_patient_name
  FROM patients
  WHERE id = NEW.patient_id;

  -- Create notification for share recipient
  INSERT INTO notifications (
    user_id,
    type,
    message,
    data
  ) VALUES (
    NEW.shared_with_user_id,
    'share_received',
    format('You have been given %s access to patient %s', NEW.access_level, v_patient_name),
    jsonb_build_object(
      'patientId', NEW.patient_id,
      'shareId', NEW.id,
      'accessLevel', NEW.access_level,
      'sharedBy', NEW.shared_by_user_id
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new shares
DROP TRIGGER IF EXISTS share_notification_trigger ON patient_shares;
CREATE TRIGGER share_notification_trigger
  AFTER INSERT ON patient_shares
  FOR EACH ROW
  EXECUTE FUNCTION handle_share_notification();

-- Create trigger for pending shares being claimed
CREATE OR REPLACE FUNCTION handle_pending_share_claim()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.claimed_at IS NOT NULL AND OLD.claimed_at IS NULL THEN
    -- Create notification for the person who shared
    INSERT INTO notifications (
      user_id,
      type,
      message,
      data
    ) VALUES (
      NEW.shared_by_user_id,
      'share_claimed',
      format('Your share invitation to %s has been accepted', NEW.email),
      jsonb_build_object(
        'patientId', NEW.patient_id,
        'shareId', NEW.id,
        'accessLevel', NEW.access_level,
        'claimedBy', NEW.claimed_by_user_id
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for pending share claims
DROP TRIGGER IF EXISTS pending_share_claim_trigger ON pending_shares;
CREATE TRIGGER pending_share_claim_trigger
  AFTER UPDATE ON pending_shares
  FOR EACH ROW
  EXECUTE FUNCTION handle_pending_share_claim();

-- Add new notification types to the check constraint
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type = ANY (ARRAY[
    'appointment'::text,
    'todo'::text,
    'prescription'::text,
    'share'::text,
    'family'::text,
    'share_received'::text,
    'share_claimed'::text
])); 