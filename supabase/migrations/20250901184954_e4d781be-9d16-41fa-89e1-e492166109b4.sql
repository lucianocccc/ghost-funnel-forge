-- Remove the temporary debug policy
DROP POLICY IF EXISTS "Debug: Allow all submissions temporarily" ON funnel_submissions;

-- Create a proper, secure RLS policy for anonymous submissions to public funnels
CREATE POLICY "Allow anonymous submissions to public funnels" 
ON funnel_submissions 
FOR INSERT 
WITH CHECK (
  -- Verify the funnel exists and is public
  EXISTS (
    SELECT 1 
    FROM interactive_funnels 
    WHERE id = funnel_id 
    AND is_public = true 
    AND status = 'active'
  )
  -- And verify the step belongs to the funnel
  AND EXISTS (
    SELECT 1 
    FROM interactive_funnel_steps 
    WHERE id = step_id 
    AND funnel_id = funnel_submissions.funnel_id
  )
);

-- Also ensure we can handle the trigger that consolidates leads properly
-- Check if our consolidation trigger is working correctly by testing the function exists
SELECT EXISTS(
  SELECT 1 FROM pg_proc 
  WHERE proname = 'consolidate_funnel_submission'
) as consolidation_function_exists;