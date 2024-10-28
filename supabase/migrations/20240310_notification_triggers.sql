-- Trigger function for appointment reminders
create or replace function create_appointment_reminder()
returns trigger
language plpgsql
security definer
as $$
declare
  patient_name text;
  doctor_name text;
begin
  -- Get patient and doctor names
  select p.name into patient_name
  from patients p where p.id = NEW.patient_id;
  
  select concat(d.first_name, ' ', d.last_name) into doctor_name
  from doctors d where d.id = NEW.doctor_id;

  -- Create a notification 24 hours before the appointment
  insert into notifications (user_id, type, message, data)
  values (
    NEW.user_id,
    'appointment',
    format('Reminder: %s has an appointment with Dr. %s tomorrow at %s', 
           patient_name,
           doctor_name,
           to_char(NEW.date, 'HH:MI AM')),
    jsonb_build_object(
      'appointment_id', NEW.id,
      'patient_id', NEW.patient_id,
      'doctor_id', NEW.doctor_id,
      'date', NEW.date
    )
  );
  
  return NEW;
end;
$$;

-- Create the trigger
create trigger appointment_reminder_trigger
  after insert or update of date
  on appointments
  for each row
  when (NEW.date > now() + interval '23 hours' AND NEW.date <= now() + interval '25 hours')
  execute function create_appointment_reminder();
