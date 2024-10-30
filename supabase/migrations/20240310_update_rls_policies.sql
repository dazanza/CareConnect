- Drop existing policies first
do $$
declare
  r record;
begin
  for r in (
    select policyname, tablename 
    from pg_policies 
    where schemaname = 'public' 
    and tablename in (
      'Event_Categories',
      'app_logins',
      'appointments',
      'doctors',
      'documents',
      'family_groups',
      'lab_results',
      'medical_files',
      'notes',
      'notifications',
      'patient_doctors',
      'patient_family_group',
      'patient_shares',
      'patients',
      'prescriptions',
      'timeline_events',
      'todos',
      'user_family_group',
      'users',
      'vitals'
    )
  ) loop
    execute format('drop policy if exists %I on %I', r.policyname, r.tablename);
  end loop;
end $$;

-- Enable RLS on all tables
alter table "Event_Categories" enable row level security;
alter table app_logins enable row level security;
alter table appointments enable row level security;
alter table doctors enable row level security;
alter table documents enable row level security;
alter table family_groups enable row level security;
alter table lab_results enable row level security;
alter table medical_files enable row level security;
alter table notes enable row level security;
alter table notifications enable row level security;
alter table patient_doctors enable row level security;
alter table patient_family_group enable row level security;
alter table patient_shares enable row level security;
alter table patients enable row level security;
alter table prescriptions enable row level security;
alter table timeline_events enable row level security;
alter table todos enable row level security;
alter table user_family_group enable row level security;
alter table users enable row level security;
alter table vitals enable row level security;

-- Event Categories (public read)
create policy "Enable read access for all users" on "Event_Categories"
  for select using (true);

-- App Logins (text user_id)
create policy "Enable read for own logins" on app_logins
  for select using (user_id = requesting_user_id());
create policy "Enable insert own logins" on app_logins
  for insert with check (user_id = requesting_user_id());

-- Appointments (text user_id)
create policy "Users can view appointments" on appointments
  for select using (
    user_id = requesting_user_id() or
    exists (
      select 1 from patient_shares
      where patient_shares.patient_id = appointments.patient_id
      and patient_shares.shared_with_user_id::text = requesting_user_id()
      and patient_shares.access_level = any(array['read', 'write', 'admin'])
      and (patient_shares.expires_at is null or patient_shares.expires_at > now())
    )
  );
create policy "Users can manage appointments" on appointments
  for all using (user_id = requesting_user_id());

-- Doctors (text user_id)
create policy "Users can view doctors" on doctors
  for select using (user_id = requesting_user_id());
create policy "Users can manage doctors" on doctors
  for all using (user_id = requesting_user_id());

-- Documents (uuid user_id)
create policy "Users can view documents" on documents
  for select using (
    user_id::text = requesting_user_id() or
    exists (
      select 1 from patient_shares
      where patient_shares.patient_id = documents.patient_id
      and patient_shares.shared_with_user_id::text = requesting_user_id()
      and patient_shares.access_level = any(array['read', 'write', 'admin'])
      and (patient_shares.expires_at is null or patient_shares.expires_at > now())
    )
  );
create policy "Users can manage documents" on documents
  for all using (user_id::text = requesting_user_id());

-- Family Groups (uuid user_id)
create policy "Users can view family groups" on family_groups
  for select using (user_id::text = requesting_user_id());
create policy "Users can manage family groups" on family_groups
  for all using (user_id::text = requesting_user_id());

-- Lab Results (uuid user_id)
create policy "Users can view lab results" on lab_results
  for select using (
    user_id::text = requesting_user_id() or
    exists (
      select 1 from patient_shares
      where patient_shares.patient_id = lab_results.patient_id
      and patient_shares.shared_with_user_id::text = requesting_user_id()
      and patient_shares.access_level = any(array['read', 'write', 'admin'])
      and (patient_shares.expires_at is null or patient_shares.expires_at > now())
    )
  );
create policy "Users can manage lab results" on lab_results
  for all using (user_id::text = requesting_user_id());

-- Medical Files (text user_id)
create policy "Users can view medical files" on medical_files
  for select using (user_id = requesting_user_id());
create policy "Users can manage medical files" on medical_files
  for all using (user_id = requesting_user_id());

-- Notes (text user_id)
create policy "Users can view notes" on notes
  for select using (user_id = requesting_user_id());
create policy "Users can manage notes" on notes
  for all using (user_id = requesting_user_id());

-- Notifications (uuid user_id)
create policy "Users can view notifications" on notifications
  for select using (user_id::text = requesting_user_id());
create policy "Users can manage notifications" on notifications
  for all using (user_id::text = requesting_user_id());

-- Patient Doctors (text user_id)
create policy "Users can view patient doctors" on patient_doctors
  for select using (user_id = requesting_user_id());
create policy "Users can manage patient doctors" on patient_doctors
  for all using (user_id = requesting_user_id());

-- Patient Family Group (uuid user_id)
create policy "Users can view patient family group" on patient_family_group
  for select using (user_id::text = requesting_user_id());
create policy "Users can manage patient family group" on patient_family_group
  for all using (user_id::text = requesting_user_id());

-- Patient Shares (uuid shared_by_user_id and shared_with_user_id)
create policy "Users can view shares" on patient_shares
  for select using (
    shared_by_user_id::text = requesting_user_id() or 
    shared_with_user_id::text = requesting_user_id()
  );
create policy "Users can create shares" on patient_shares
  for insert with check (
    exists (
      select 1 from patients
      where patients.id = patient_shares.patient_id
      and patients.user_id = requesting_user_id()
    )
  );
create policy "Users can manage own shares" on patient_shares
  for all using (shared_by_user_id::text = requesting_user_id());

-- Patients (text user_id)
create policy "Users can view patients" on patients
  for select using (user_id = requesting_user_id());
create policy "Users can manage patients" on patients
  for all using (user_id = requesting_user_id());

-- Prescriptions (text user_id)
create policy "Users can view prescriptions" on prescriptions
  for select using (
    user_id = requesting_user_id() or
    exists (
      select 1 from patient_shares
      where patient_shares.patient_id = prescriptions.patient_id
      and patient_shares.shared_with_user_id::text = requesting_user_id()
      and patient_shares.access_level = any(array['read', 'write', 'admin'])
      and (patient_shares.expires_at is null or patient_shares.expires_at > now())
    )
  );
create policy "Users can manage prescriptions" on prescriptions
  for all using (user_id = requesting_user_id());

-- Timeline Events (uuid user_id)
create policy "Users can view timeline events" on timeline_events
  for select using (
    user_id::text = requesting_user_id() or
    exists (
      select 1 from patient_shares
      where patient_shares.patient_id = timeline_events.patient_id
      and patient_shares.shared_with_user_id::text = requesting_user_id()
      and patient_shares.access_level = any(array['read', 'write', 'admin'])
      and (patient_shares.expires_at is null or patient_shares.expires_at > now())
    )
  );
create policy "Users can manage timeline events" on timeline_events
  for all using (user_id::text = requesting_user_id());

-- Todos (text user_id)
create policy "Users can view todos" on todos
  for select using (user_id = requesting_user_id());
create policy "Users can manage todos" on todos
  for all using (user_id = requesting_user_id());

-- User Family Group (text user_id)
create policy "Users can view user family group" on user_family_group
  for select using (user_id = requesting_user_id());
create policy "Users can manage user family group" on user_family_group
  for all using (user_id = requesting_user_id());

-- Users (text user_id)
create policy "Users can view own profile" on users
  for select using (user_id = requesting_user_id());
create policy "Users can manage own profile" on users
  for all using (user_id = requesting_user_id());

-- Vitals (text user_id)
create policy "Users can view vitals" on vitals
  for select using (
    user_id = requesting_user_id() or
    exists (
      select 1 from patient_shares
      where patient_shares.patient_id = vitals.patient_id
      and patient_shares.shared_with_user_id::text = requesting_user_id()
      and patient_shares.access_level = any(array['read', 'write', 'admin'])
      and (patient_shares.expires_at is null or patient_shares.expires_at > now())
    )
  );
create policy "Users can manage vitals" on vitals
  for all using (user_id = requesting_user_id());