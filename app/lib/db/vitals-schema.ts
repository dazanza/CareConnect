export const vitalsSchema = {
  id: 'uuid default uuid_generate_v4() primary key',
  patient_id: 'uuid references patients(id)',
  blood_pressure: 'text',
  heart_rate: 'integer',
  temperature: 'decimal(4,1)',
  oxygen_level: 'integer',
  date: 'timestamp with time zone',
  created_at: 'timestamp with time zone default now()',
  updated_at: 'timestamp with time zone default now()'
}
