-- Update notification types to include new types
alter table notifications 
  drop constraint notifications_type_check,
  add constraint notifications_type_check 
    check (type in ('appointment', 'todo', 'prescription', 'share', 'family'));
