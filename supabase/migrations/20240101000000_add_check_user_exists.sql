-- Drop existing function if it exists
drop function if exists public.check_user_exists(text);

-- Create a function to check if a user exists by email
create or replace function public.check_user_exists(email_to_check text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  user_id uuid;
begin
  if email_to_check is null then
    raise exception 'Email parameter cannot be null';
  end if;

  -- First try to get from users table
  select id into user_id
  from public.users
  where email = email_to_check
  and (deleted_at is null or deleted_at > now())
  limit 1;

  -- If not found in users table, check auth.users
  if user_id is null then
    select au.id into user_id
    from auth.users au
    where au.email = email_to_check
    and au.deleted_at is null
    limit 1;
  end if;

  return user_id;
exception
  when others then
    -- Log the error (will appear in Postgres logs)
    raise warning 'Error in check_user_exists: %', SQLERRM;
    -- Re-raise the error
    raise;
end;
$$; 