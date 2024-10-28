export const prescriptionsSchema = {
  id: 'uuid default uuid_generate_v4() primary key',
  patient_id: 'uuid references patients(id)',
  doctor_id: 'uuid references doctors(id)',
  medication: 'text not null',
  dosage: 'text not null',
  frequency: 'text not null',
  duration: 'integer not null',
  start_date: 'timestamp with time zone not null',
  end_date: 'timestamp with time zone not null',
  instructions: 'text',
  status: 'text check (status in (\'active\', \'completed\', \'cancelled\')) default \'active\'',
  created_at: 'timestamp with time zone default now()',
  updated_at: 'timestamp with time zone default now()'
}
