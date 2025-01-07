-- Drop existing function if it exists
drop function if exists public.check_user_exists;

-- Create a security definer function that only returns minimal user info
create or replace function public.check_user_exists(email_to_check text)
returns table (user_exists boolean, user_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  found_user_id uuid;
begin
  select id into found_user_id
  from users
  where email = email_to_check
  and deleted_at is null;

  return query
  select 
    found_user_id is not null as user_exists,
    found_user_id as user_id;
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.check_user_exists(text) to authenticated;
grant execute on function public.check_user_exists(text) to anon; 