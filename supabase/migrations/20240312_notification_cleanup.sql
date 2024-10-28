-- Create function to clean up old notifications
create or replace function cleanup_old_notifications()
returns void
language plpgsql
security definer
as $$
begin
  -- Delete read notifications older than 30 days
  delete from notifications
  where read = true
  and created_at < now() - interval '30 days';
  
  -- Delete unread notifications older than 90 days
  delete from notifications
  where read = false
  and created_at < now() - interval '90 days';
end;
$$;

-- Create a scheduled job to run cleanup daily
select
  cron.schedule(
    'cleanup-old-notifications',
    '0 0 * * *', -- Run at midnight every day
    'select cleanup_old_notifications()'
  );
