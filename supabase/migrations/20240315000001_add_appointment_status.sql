-- Add status column to appointments table
ALTER TABLE appointments 
ADD COLUMN status TEXT NOT NULL DEFAULT 'scheduled' 
CHECK (status IN ('scheduled', 'cancelled', 'completed'));

-- Create index for better query performance
CREATE INDEX idx_appointments_status ON appointments(status);

-- Update timeline trigger to handle status changes
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
      WHEN TG_OP = 'UPDATE' AND NEW.status = 'cancelled' THEN 'Appointment Cancelled'
      WHEN TG_OP = 'UPDATE' AND NEW.status = 'completed' THEN 'Appointment Completed'
      WHEN TG_OP = 'UPDATE' AND OLD.date != NEW.date THEN 'Appointment Rescheduled'
      ELSE 'Appointment Updated'
    END,
    CASE
      WHEN TG_OP = 'INSERT' THEN format('Scheduled with %s', v_doctor_name)
      WHEN TG_OP = 'UPDATE' AND NEW.status = 'cancelled' THEN format('Cancelled appointment with %s', v_doctor_name)
      WHEN TG_OP = 'UPDATE' AND NEW.status = 'completed' THEN format('Completed appointment with %s', v_doctor_name)
      WHEN TG_OP = 'UPDATE' AND OLD.date != NEW.date THEN format('Rescheduled appointment with %s', v_doctor_name)
      ELSE format('Updated appointment with %s', v_doctor_name)
    END,
    NULL,
    auth.uid(),
    auth.uid()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema'; 