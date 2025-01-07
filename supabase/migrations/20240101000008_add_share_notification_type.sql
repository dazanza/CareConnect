-- Drop the existing constraint
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add new constraint with all types including share_received
ALTER TABLE notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type = ANY (ARRAY[
    'appointment'::text,
    'todo'::text,
    'prescription'::text,
    'share'::text,
    'family'::text,
    'share_received'::text
])); 