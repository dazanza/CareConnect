export const allergiesSchema = {
  id: 'uuid default uuid_generate_v4() primary key',
  patient_id: 'uuid references patients(id)',
  allergen: 'text not null',
  reaction: 'text not null',
  severity: 'text check (severity in (\'mild\', \'moderate\', \'severe\')) not null',
  notes: 'text',
  date_identified: 'timestamp with time zone not null',
  status: 'text check (status in (\'active\', \'inactive\')) default \'active\'',
  created_at: 'timestamp with time zone default now()',
  updated_at: 'timestamp with time zone default now()'
}
