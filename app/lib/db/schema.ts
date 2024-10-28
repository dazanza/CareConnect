export const medicalHistorySchema = {
  id: 'uuid',
  patient_id: 'uuid references patients(id)',
  doctor_id: 'uuid references doctors(id)',
  type: 'text check (type in (\'appointment\', \'prescription\', \'diagnosis\', \'test\'))',
  title: 'text',
  description: 'text',
  date: 'timestamp with time zone',
  created_at: 'timestamp with time zone default now()',
  updated_at: 'timestamp with time zone default now()'
}
