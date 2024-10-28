export const billingSchema = {
  id: 'uuid default uuid_generate_v4() primary key',
  patient_id: 'uuid references patients(id)',
  service_id: 'uuid references services(id)',
  amount: 'decimal(10,2) not null',
  description: 'text not null',
  date: 'timestamp with time zone not null',
  status: 'text check (status in (\'pending\', \'paid\', \'overdue\', \'cancelled\')) default \'pending\'',
  insurance_claim_id: 'text',
  payment_method: 'text',
  payment_date: 'timestamp with time zone',
  created_at: 'timestamp with time zone default now()',
  updated_at: 'timestamp with time zone default now()'
}

export const servicesSchema = {
  id: 'uuid default uuid_generate_v4() primary key',
  name: 'text not null',
  code: 'text not null unique',
  description: 'text',
  base_price: 'decimal(10,2) not null',
  created_at: 'timestamp with time zone default now()',
  updated_at: 'timestamp with time zone default now()'
}
