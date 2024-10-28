-- Drop existing policies if they exist
do $$ 
begin
  -- Lab Results policies
  if exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'lab_results'
  ) then
    drop policy if exists "Users can view lab results for their patients" on lab_results;
    drop policy if exists "Users can create lab results for their patients" on lab_results;
    drop policy if exists "Users can update lab results they created" on lab_results;
  end if;

  -- Vitals policies
  if exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'vitals'
  ) then
    drop policy if exists "Users can view vitals for their patients" on vitals;
    drop policy if exists "Users can create vitals for their patients" on vitals;
    drop policy if exists "Users can update vitals they created" on vitals;
  end if;

  -- Prescriptions policies
  if exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'prescriptions'
  ) then
    drop policy if exists "Users can view prescriptions for their patients" on prescriptions;
    drop policy if exists "Users can create prescriptions for their patients" on prescriptions;
    drop policy if exists "Users can update prescriptions they created" on prescriptions;
  end if;

  -- Appointments policies
  if exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'appointments'
  ) then
    drop policy if exists "Users can view appointments for their patients" on appointments;
    drop policy if exists "Users can create appointments for their patients" on appointments;
    drop policy if exists "Users can update appointments they created" on appointments;
  end if;

  -- Timeline Events policies
  if exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'timeline_events'
  ) then
    drop policy if exists "Users can view timeline events for their patients" on timeline_events;
    drop policy if exists "Users can create timeline events for their patients" on timeline_events;
  end if;

  -- Documents policies
  if exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'documents'
  ) then
    drop policy if exists "Users can view documents for their patients" on documents;
    drop policy if exists "Users can upload documents for their patients" on documents;
    drop policy if exists "Users can update documents they uploaded" on documents;
  end if;
end $$;

-- Lab Results RLS
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

create policy "Users can create lab results for their patients"
  on lab_results for insert
  with check (
    auth.uid()::uuid = user_id::uuid
  );

create policy "Users can update lab results they created"
  on lab_results for update
  using (
    auth.uid()::uuid = user_id::uuid or
    exists (
      select 1 from patient_shares
      where patient_id = lab_results.patient_id
      and shared_with_user_id = auth.uid()::uuid
      and access_level in ('write', 'admin')
      and (expires_at is null or expires_at > now())
    )
  );

-- Vitals RLS
alter table vitals enable row level security;

create policy "Users can view vitals for their patients"
  on vitals for select
  using (
    auth.uid()::uuid = user_id::uuid or
    exists (
      select 1 from patient_shares
      where patient_id = vitals.patient_id
      and shared_with_user_id = auth.uid()::uuid
      and access_level in ('read', 'write', 'admin')
      and (expires_at is null or expires_at > now())
    )
  );

create policy "Users can create vitals for their patients"
  on vitals for insert
  with check (
    auth.uid()::uuid = user_id::uuid
  );

create policy "Users can update vitals they created"
  on vitals for update
  using (
    auth.uid()::uuid = user_id::uuid or
    exists (
      select 1 from patient_shares
      where patient_id = vitals.patient_id
      and shared_with_user_id = auth.uid()::uuid
      and access_level in ('write', 'admin')
      and (expires_at is null or expires_at > now())
    )
  );

-- Prescriptions RLS
alter table prescriptions enable row level security;

create policy "Users can view prescriptions for their patients"
  on prescriptions for select
  using (
    auth.uid()::uuid = user_id::uuid or
    exists (
      select 1 from patient_shares
      where patient_id = prescriptions.patient_id
      and shared_with_user_id = auth.uid()::uuid
      and access_level in ('read', 'write', 'admin')
      and (expires_at is null or expires_at > now())
    )
  );

create policy "Users can create prescriptions for their patients"
  on prescriptions for insert
  with check (
    auth.uid()::uuid = user_id::uuid
  );

create policy "Users can update prescriptions they created"
  on prescriptions for update
  using (
    auth.uid()::uuid = user_id::uuid or
    exists (
      select 1 from patient_shares
      where patient_id = prescriptions.patient_id
      and shared_with_user_id = auth.uid()::uuid
      and access_level in ('write', 'admin')
      and (expires_at is null or expires_at > now())
    )
  );

-- Appointments RLS
alter table appointments enable row level security;

create policy "Users can view appointments for their patients"
  on appointments for select
  using (
    auth.uid()::uuid = user_id::uuid or
    exists (
      select 1 from patient_shares
      where patient_id = appointments.patient_id
      and shared_with_user_id = auth.uid()::uuid
      and access_level in ('read', 'write', 'admin')
      and (expires_at is null or expires_at > now())
    )
  );

create policy "Users can create appointments for their patients"
  on appointments for insert
  with check (
    auth.uid()::uuid = user_id::uuid
  );

create policy "Users can update appointments they created"
  on appointments for update
  using (
    auth.uid()::uuid = user_id::uuid or
    exists (
      select 1 from patient_shares
      where patient_id = appointments.patient_id
      and shared_with_user_id = auth.uid()::uuid
      and access_level in ('write', 'admin')
      and (expires_at is null or expires_at > now())
    )
  );

-- Timeline Events RLS
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

create policy "Users can create timeline events for their patients"
  on timeline_events for insert
  with check (
    auth.uid()::uuid = user_id::uuid
  );

-- Documents RLS
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
