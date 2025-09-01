-- Fix overly restrictive RLS policy for funnel_submissions
-- The current policy is too strict on user_agent validation and causing 401 errors

-- Drop the existing overly restrictive policy
DROP POLICY IF EXISTS "Allow validated submissions to public active funnels" ON funnel_submissions;

-- Create a more lenient policy that still validates essential data but is less strict
CREATE POLICY "Allow submissions to public active funnels with basic validation" 
ON funnel_submissions 
FOR INSERT 
WITH CHECK (
  -- Ensure funnel exists and is public/active
  funnel_id IN (
    SELECT id FROM interactive_funnels 
    WHERE is_public = true AND status = 'active'
  ) 
  AND
  -- Ensure step belongs to the funnel
  step_id IN (
    SELECT id FROM interactive_funnel_steps 
    WHERE funnel_id = funnel_submissions.funnel_id
  )
  AND
  -- Basic data validation (less strict)
  submission_data IS NOT NULL 
  AND
  jsonb_typeof(submission_data) = 'object'
  AND
  -- More lenient user_agent validation (allow empty or very long)
  (user_agent IS NULL OR char_length(COALESCE(user_agent, '')) <= 1000)
  AND
  -- Basic email validation if provided
  (user_email IS NULL OR user_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
  AND
  -- Basic name validation if provided
  (user_name IS NULL OR (char_length(COALESCE(user_name, '')) <= 200))
);