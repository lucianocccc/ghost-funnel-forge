
-- Fix the completion_time column to handle large timestamp values
ALTER TABLE funnel_submissions 
ALTER COLUMN completion_time TYPE bigint;
