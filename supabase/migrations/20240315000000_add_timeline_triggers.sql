-- Function to handle appointment timeline events
CREATE OR REPLACE FUNCTION handle_appointment_timeline()
RETURNS TRIGGER AS $$
DECLARE
  v_doctor_name text;
BEGIN
  -- Get doctor name
  SELECT concat('Dr. ', first_name, ' ', last_name) INTO v_doctor_name
  FROM doctors
  WHERE id = NEW.doctor_id;

  -- Create timeline event
  PERFORM create_timeline_event(
    NEW.patient_id,
    'appointment'::text,
    NEW.date,
    CASE
      WHEN TG_OP = 'INSERT' THEN 'Appointment Scheduled'
      WHEN TG_OP = 'UPDATE' THEN 'Appointment Updated'
      ELSE 'Appointment Cancelled'
    END,
    CASE
      WHEN TG_OP = 'INSERT' THEN format('Scheduled with %s', v_doctor_name)
      WHEN TG_OP = 'UPDATE' THEN format('Updated appointment with %s', v_doctor_name)
      ELSE format('Cancelled appointment with %s', v_doctor_name)
    END,
    NULL,
    auth.uid(),
    auth.uid()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle prescription timeline events
CREATE OR REPLACE FUNCTION handle_prescription_timeline()
RETURNS TRIGGER AS $$
BEGIN
  -- Create timeline event
  PERFORM create_timeline_event(
    NEW.patient_id,
    'prescription'::text,
    COALESCE(NEW.start_date::timestamptz, now()),
    CASE
      WHEN TG_OP = 'INSERT' THEN 'New Prescription'
      WHEN TG_OP = 'UPDATE' THEN 'Prescription Updated'
      ELSE 'Prescription Discontinued'
    END,
    CASE
      WHEN TG_OP = 'INSERT' THEN format('Prescribed %s - %s', NEW.medication_name, NEW.dosage_instructions)
      WHEN TG_OP = 'UPDATE' THEN format('Updated prescription for %s', NEW.medication_name)
      ELSE format('Discontinued %s', NEW.medication_name)
    END,
    NULL,
    auth.uid(),
    auth.uid()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle lab result timeline events
CREATE OR REPLACE FUNCTION handle_lab_result_timeline()
RETURNS TRIGGER AS $$
BEGIN
  -- Create timeline event
  PERFORM create_timeline_event(
    NEW.patient_id,
    'lab_result'::text,
    COALESCE(NEW.test_date::timestamptz, now()),
    'New Lab Result',
    format('Lab result for %s: %s %s', NEW.test_name, NEW.result_value, NEW.unit),
    NULL,
    auth.uid(),
    auth.uid()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for appointments
DROP TRIGGER IF EXISTS appointment_timeline_insert_trigger ON appointments;
CREATE TRIGGER appointment_timeline_insert_trigger
  AFTER INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION handle_appointment_timeline();

DROP TRIGGER IF EXISTS appointment_timeline_update_trigger ON appointments;
CREATE TRIGGER appointment_timeline_update_trigger
  AFTER UPDATE ON appointments
  FOR EACH ROW
  WHEN (OLD.date != NEW.date OR OLD.status != NEW.status)
  EXECUTE FUNCTION handle_appointment_timeline();

-- Create triggers for prescriptions
DROP TRIGGER IF EXISTS prescription_timeline_insert_trigger ON prescriptions;
CREATE TRIGGER prescription_timeline_insert_trigger
  AFTER INSERT ON prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION handle_prescription_timeline();

DROP TRIGGER IF EXISTS prescription_timeline_update_trigger ON prescriptions;
CREATE TRIGGER prescription_timeline_update_trigger
  AFTER UPDATE ON prescriptions
  FOR EACH ROW
  WHEN (OLD.status != NEW.status OR OLD.dosage_instructions != NEW.dosage_instructions)
  EXECUTE FUNCTION handle_prescription_timeline();

-- Create trigger for lab results
DROP TRIGGER IF EXISTS lab_result_timeline_trigger ON lab_results;
CREATE TRIGGER lab_result_timeline_trigger
  AFTER INSERT ON lab_results
  FOR EACH ROW
  EXECUTE FUNCTION handle_lab_result_timeline();

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema'; 
