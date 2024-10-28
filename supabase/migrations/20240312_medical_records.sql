-- Drop type if exists
do $$ begin
    if exists (select 1 from pg_type where typname = 'event_type') then
        drop type event_type cascade;
    end if;
end $$;

-- Drop existing tables if they exist
do $$ begin
    drop table if exists timeline_events cascade;
    drop table if exists lab_results cascade;
    drop table if exists documents cascade;
end $$;

-- Create documents table
create table documents (
  id uuid default uuid_generate_v4() primary key,
  patient_id integer not null references patients(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  size integer not null,
  url text not null,
  category text not null check (category in ('lab_result', 'prescription', 'imaging', 'other')),
  uploaded_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indexes for documents
create index documents_patient_id_idx on documents(patient_id);
create index documents_user_id_idx on documents(user_id);
create index documents_category_idx on documents(category);

-- Create lab_results table
create table lab_results (
  id serial primary key,
  patient_id integer not null references patients(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  test_name text not null,
  test_type text not null,
  result_value text not null,
  reference_range text,
  unit text,
  date timestamp with time zone not null,
  notes text,
  status text not null check (status in ('normal', 'abnormal', 'critical')),
  doctor_id integer references doctors(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indexes for lab_results
create index lab_results_patient_id_idx on lab_results(patient_id);
create index lab_results_user_id_idx on lab_results(user_id);
create index lab_results_date_idx on lab_results(date);

-- Add RLS policies for lab_results
alter table lab_results enable row level security;

create policy "Users can view lab results for their patients"
  on lab_results for select
  using (
    auth.uid()::uuid = user_id::uuid or
    exists (
      select 1 from patient_shares
      where patient_id = lab_results.patient_id
      and shared_with_user_id = auth.uid()::uuid
      and access_level in ('read', 'write', 'admin')
      and (expires_at is null or expires_at > now())
    )
  );

-- Now we can create the timeline_events table and triggers
create type event_type as enum (
  'appointment',
  'prescription',
  'vitals',
  'lab_result',
  'note'
);

create table timeline_events (
  id uuid default uuid_generate_v4() primary key,
  patient_id integer not null references patients(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type event_type not null,
  date timestamp with time zone not null,
  title text not null,
  description text,
  metadata jsonb,
  created_by uuid not null references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Add reference ID columns for different event types
  appointment_id integer references appointments(id) on delete set null,
  prescription_id integer references prescriptions(id) on delete set null,
  vitals_id integer references vitals(id) on delete set null,
  lab_result_id integer references lab_results(id) on delete set null
);

-- Add indexes for timeline_events
create index timeline_events_patient_id_idx on timeline_events(patient_id);
create index timeline_events_user_id_idx on timeline_events(user_id);
create index timeline_events_date_idx on timeline_events(date);
create index timeline_events_type_idx on timeline_events(type);

-- Add RLS policies for timeline_events
alter table timeline_events enable row level security;

create policy "Users can view timeline events for their patients"
  on timeline_events for select
  using (
    auth.uid()::uuid = user_id::uuid or
    exists (
      select 1 from patient_shares
      where patient_id = timeline_events.patient_id
      and shared_with_user_id = auth.uid()::uuid
      and access_level in ('read', 'write', 'admin')
      and (expires_at is null or expires_at > now())
    )
  );

-- Add RLS policies for documents
alter table documents enable row level security;

create policy "Users can view documents for their patients"
  on documents for select
  using (
    auth.uid()::uuid = user_id::uuid or
    exists (
      select 1 from patient_shares
      where patient_id = documents.patient_id
      and shared_with_user_id = auth.uid()::uuid
      and access_level in ('read', 'write', 'admin')
      and (expires_at is null or expires_at > now())
    )
  );

create policy "Users can upload documents for their patients"
  on documents for insert
  with check (
    auth.uid()::uuid = user_id::uuid
  );

create policy "Users can update documents they uploaded"
  on documents for update
  using (
    auth.uid()::uuid = user_id::uuid or
    exists (
      select 1 from patient_shares
      where patient_id = documents.patient_id
      and shared_with_user_id = auth.uid()::uuid
      and access_level in ('write', 'admin')
      and (expires_at is null or expires_at > now())
    )
  );
