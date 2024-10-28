export const medicationsSchema = {
  id: 'uuid default uuid_generate_v4() primary key',
  patient_id: 'uuid references patients(id)',
  doctor_id: 'uuid references doctors(id)',
  name: 'text not null',
  dosage: 'text not null',
  frequency: 'text not null',
  start_date: 'timestamp with time zone not null',
  end_date: 'timestamp with time zone',
  instructions: 'text',
  status: 'text check (status in (\'active\', \'discontinued\', \'completed\')) default \'active\'',
  reason_for_discontinuation: 'text',
  side_effects: 'text',
  adherence_rate: 'integer',
  created_at: 'timestamp with time zone default now()',
  updated_at: 'timestamp with time zone default now()'
}
