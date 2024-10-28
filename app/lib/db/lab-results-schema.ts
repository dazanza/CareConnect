export const labResultsSchema = {
  id: 'uuid default uuid_generate_v4() primary key',
  patient_id: 'uuid references patients(id)',
  doctor_id: 'uuid references doctors(id)',
  test_name: 'text not null',
  test_type: 'text not null',
  result_value: 'text not null',
  reference_range: 'text not null',
  unit: 'text not null',
  date: 'timestamp with time zone not null',
  notes: 'text',
  status: 'text check (status in (\'normal\', \'abnormal\', \'critical\')) default \'normal\'',
  created_at: 'timestamp with time zone default now()',
  updated_at: 'timestamp with time zone default now()'
}
