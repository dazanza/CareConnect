create table patient_shares (
  id uuid default uuid_generate_v4() primary key,
  patient_id integer not null references patients(id) on delete cascade,
  shared_by_user_id uuid not null references auth.users(id) on delete cascade,
  shared_with_user_id uuid not null references auth.users(id) on delete cascade,
  access_level text not null check (access_level in ('read', 'write', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone,
  
  -- Prevent duplicate shares
  unique(patient_id, shared_with_user_id),
  
  -- Prevent sharing with self
  constraint no_self_share check (shared_by_user_id != shared_with_user_id)
);

-- Add indexes
create index patient_shares_patient_id_idx on patient_shares(patient_id);
create index patient_shares_shared_by_user_id_idx on patient_shares(shared_by_user_id);
create index patient_shares_shared_with_user_id_idx on patient_shares(shared_with_user_id);

-- Add RLS policies
alter table patient_shares enable row level security;

create policy "Users can view shares they created or received"
  on patient_shares for select
  using (
    auth.uid()::uuid = shared_by_user_id or 
    auth.uid()::uuid = shared_with_user_id
  );

create policy "Users can create shares for their patients"
  on patient_shares for insert
  with check (
    exists (
      select 1 from patients
      where id = patient_id
      and user_id::uuid = auth.uid()::uuid
    )
  );

create policy "Users can delete shares they created"
  on patient_shares for delete
  using (auth.uid()::uuid = shared_by_user_id);
