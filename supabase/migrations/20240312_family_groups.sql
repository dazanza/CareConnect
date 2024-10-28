-- Drop existing tables if they exist
do $$ begin
    drop table if exists patient_family_group cascade;
    drop table if exists family_groups cascade;
end $$;

-- Create family groups table
create table family_groups (
  id serial primary key,
  name text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create patient family group relationship table
create table patient_family_group (
  id uuid default uuid_generate_v4() primary key,
  patient_id integer not null references patients(id) on delete cascade,
  family_group_id integer not null references family_groups(id) on delete cascade,
  relationship text,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Prevent duplicate patient in same group
  unique(patient_id, family_group_id)
);

-- Add indexes
create index family_groups_user_id_idx on family_groups(user_id);
create index patient_family_group_patient_id_idx on patient_family_group(patient_id);
create index patient_family_group_family_group_id_idx on patient_family_group(family_group_id);
create index patient_family_group_user_id_idx on patient_family_group(user_id);

-- Add RLS policies
alter table family_groups enable row level security;
alter table patient_family_group enable row level security;

-- Family groups policies
create policy "Users can view their family groups"
  on family_groups for select
  using (auth.uid()::uuid = user_id);

create policy "Users can create family groups"
  on family_groups for insert
  with check (auth.uid()::uuid = user_id);

create policy "Users can update their family groups"
  on family_groups for update
  using (auth.uid()::uuid = user_id);

create policy "Users can delete their family groups"
  on family_groups for delete
  using (auth.uid()::uuid = user_id);

-- Patient family group policies
create policy "Users can view their patient family group relationships"
  on patient_family_group for select
  using (
    auth.uid()::uuid = user_id or
    exists (
      select 1 from family_groups
      where id = family_group_id
      and user_id = auth.uid()::uuid
    )
  );

create policy "Users can create patient family group relationships"
  on patient_family_group for insert
  with check (
    auth.uid()::uuid = user_id and
    exists (
      select 1 from family_groups
      where id = family_group_id
      and user_id = auth.uid()::uuid
    )
  );

create policy "Users can update their patient family group relationships"
  on patient_family_group for update
  using (auth.uid()::uuid = user_id);

create policy "Users can delete their patient family group relationships"
  on patient_family_group for delete
  using (auth.uid()::uuid = user_id);
