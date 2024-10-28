create table notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('appointment', 'todo', 'prescription')),
  message text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  data jsonb
);

-- Add indexes
create index notifications_user_id_idx on notifications(user_id);
create index notifications_read_idx on notifications(read);
create index notifications_created_at_idx on notifications(created_at);
