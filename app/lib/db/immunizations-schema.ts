export const immunizationsSchema = {
  id: 'uuid default uuid_generate_v4() primary key',
  patient_id: 'uuid references patients(id)',
  doctor_id: 'uuid references doctors(id)',
  vaccine_name: 'text not null',
  vaccine_type: 'text not null',
  dose_number: 'integer not null',
  date_administered: 'timestamp with time zone not null',
  next_due_date: 'timestamp with time zone',
  administered_by: 'text not null',
  batch_number: 'text not null',
  manufacturer: 'text not null',
  location: 'text not null',
  notes: 'text',
  status: 'text check (status in (\'completed\', \'scheduled\', \'overdue\')) default \'completed\'',
  side_effects: 'text',
  created_at: 'timestamp with time zone default now()',
  updated_at: 'timestamp with time zone default now()'
}
