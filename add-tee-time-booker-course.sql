-- Add booker_name and course columns to tee_time table

ALTER TABLE tee_time
ADD COLUMN IF NOT EXISTS booker_name TEXT,
ADD COLUMN IF NOT EXISTS course TEXT;
