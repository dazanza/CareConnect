-- Drop the existing constraint if it exists
ALTER TABLE timeline_events DROP CONSTRAINT IF EXISTS timeline_events_type_check;

-- First, temporarily change the type to text to remove the dependency
ALTER TABLE timeline_events 
ALTER COLUMN type TYPE text;

-- Also handle the backup table
ALTER TABLE backup_20240105.timeline_events 
ALTER COLUMN type TYPE text;

-- Now we can safely drop and recreate the type
DROP TYPE IF EXISTS event_type;

-- Create enum type for timeline event types
CREATE TYPE event_type AS ENUM (
  'appointment',
  'prescription',
  'vitals',
  'lab_result',
  'note'
);

-- Modify the columns back to use the new enum type
ALTER TABLE timeline_events 
ALTER COLUMN type TYPE event_type 
USING type::event_type;

ALTER TABLE backup_20240105.timeline_events 
ALTER COLUMN type TYPE event_type 
USING type::event_type;

-- Add a check constraint to ensure only valid types are used
ALTER TABLE timeline_events 
ADD CONSTRAINT timeline_events_type_check 
CHECK (type = ANY (ARRAY[
  'appointment'::event_type,
  'prescription'::event_type,
  'vitals'::event_type,
  'lab_result'::event_type,
  'note'::event_type
]));

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema'; 