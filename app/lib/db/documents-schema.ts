export const documentsSchema = {
  id: 'uuid default uuid_generate_v4() primary key',
  patient_id: 'uuid references patients(id)',
  name: 'text not null',
  type: 'text not null',
  size: 'bigint not null',
  url: 'text not null',
  category: 'text check (category in (\'lab_result\', \'prescription\', \'imaging\', \'other\'))',
  uploaded_at: 'timestamp with time zone default now()',
  updated_at: 'timestamp with time zone default now()'
}
