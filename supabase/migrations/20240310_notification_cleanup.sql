-- Function to clean up old notifications
create or replace function cleanup_old_notifications()
returns void
language plpgsql
security definer
as $$
begin
  -- Delete notifications older than 30 days
  delete from notifications
  where created_at < now() - interval '30 days';
end;
$$;

-- Create a scheduled job to run cleanup daily
select
  cron.schedule(
    'cleanup-old-notifications', -- job name
    '0 0 * * *',                -- run at midnight every day
    'select cleanup_old_notifications();'
  );
