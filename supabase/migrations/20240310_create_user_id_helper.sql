-- Helper function to get the current user's ID as text
create or replace function requesting_user_id()
returns text
language sql stable
as $$
  select auth.uid()::text;
$$; 