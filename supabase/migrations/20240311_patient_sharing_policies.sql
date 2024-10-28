-- Add RLS policies for patients table
alter table patients enable row level security;

create policy "Users can view patients they own"
  on patients for select
  using (
    auth.uid()::uuid = user_id::uuid
  );

create policy "Users can view shared patients"
  on patients for select
  using (
    exists (
      select 1 from patient_shares
      where patient_id = patients.id
      and shared_with_user_id = auth.uid()::uuid
      and (expires_at is null or expires_at > now())
    )
  );

create policy "Users can update patients they own"
  on patients for update
  using (auth.uid()::uuid = user_id::uuid);

create policy "Users with write access can update shared patients"
  on patients for update
  using (
    exists (
      select 1 from patient_shares
      where patient_id = patients.id
      and shared_with_user_id = auth.uid()::uuid
      and access_level in ('write', 'admin')
      and (expires_at is null or expires_at > now())
    )
  );

-- Add similar policies for related tables (appointments, prescriptions, etc.)
create policy "Users can view appointments for shared patients"
  on appointments for select
  using (
    auth.uid()::uuid = user_id::uuid
    or exists (
      select 1 from patient_shares
      where patient_id = appointments.patient_id
      and shared_with_user_id = auth.uid()::uuid
      and (expires_at is null or expires_at > now())
    )
  );

-- Repeat for other tables as needed
