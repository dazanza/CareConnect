-- Create function for vitals timeline events
create or replace function create_timeline_event_vitals()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into timeline_events (
    patient_id,
    user_id,
    type,
    date,
    title,
    description,
    metadata,
    created_by,
    vitals_id
  ) values (
    NEW.patient_id,
    NEW.user_id,
    'vitals',
    NEW.date_time,
    'New vitals recorded',
    null,
    jsonb_build_object(
      'blood_pressure', NEW.blood_pressure,
      'heart_rate', NEW.heart_rate,
      'temperature', NEW.temperature,
      'oxygen_saturation', NEW.oxygen_saturation,
      'mood', NEW.mood
    ),
    auth.uid(),
    NEW.id
  );
  return NEW;
end;
$$;

-- Create function for lab results timeline events
create or replace function create_timeline_event_lab_results()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into timeline_events (
    patient_id,
    user_id,
    type,
    date,
    title,
    description,
    metadata,
    created_by,
    lab_result_id
  ) values (
    NEW.patient_id,
    NEW.user_id,
    'lab_result',
    NEW.date,
    format('Lab Result: %s', NEW.test_name),
    NEW.notes,
    jsonb_build_object(
      'test_type', NEW.test_type,
      'result_value', NEW.result_value,
      'reference_range', NEW.reference_range,
      'unit', NEW.unit,
      'status', NEW.status
    ),
    auth.uid(),
    NEW.id
  );
  return NEW;
end;
$$;

-- Add trigger for vitals
create trigger vitals_timeline_trigger
  after insert on vitals
  for each row
  execute function create_timeline_event_vitals();

-- Add trigger for lab results
create trigger lab_results_timeline_trigger
  after insert on lab_results
  for each row
  execute function create_timeline_event_lab_results();
