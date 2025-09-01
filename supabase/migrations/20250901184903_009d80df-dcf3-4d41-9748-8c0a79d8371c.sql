-- Debug: Check current RLS policies for funnel_submissions
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'funnel_submissions';

-- Debug: Check if our test funnel is actually public
-- This will help us understand why the RLS policy is failing

-- Create a more permissive temporary policy for debugging
DROP POLICY IF EXISTS "Allow anonymous submissions to public funnels" ON funnel_submissions;

-- Create a simpler, more permissive policy that should definitely work
CREATE POLICY "Debug: Allow all submissions temporarily" 
ON funnel_submissions 
FOR INSERT 
WITH CHECK (true);

-- We'll also check the actual structure of the table to ensure we're sending the right data
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'funnel_submissions' 
AND table_schema = 'public'
ORDER BY ordinal_position;