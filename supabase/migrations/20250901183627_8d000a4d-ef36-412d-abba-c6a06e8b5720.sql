-- Fix the RLS policy for funnel_submissions to allow anonymous submissions to public funnels
-- This fixes the 401 error when users try to submit funnel data

-- Drop existing restrictive policies and recreate with proper anonymous access
DROP POLICY IF EXISTS "Allow public submissions to shared funnels" ON public.funnel_submissions;
DROP POLICY IF EXISTS "Anonymous public funnel submissions" ON public.funnel_submissions;

-- Create a policy that allows anonymous submissions to public funnels
CREATE POLICY "Allow anonymous submissions to public funnels" 
ON public.funnel_submissions 
FOR INSERT 
WITH CHECK (
  funnel_id IN (
    SELECT id 
    FROM public.interactive_funnels 
    WHERE is_public = true
  )
);

-- Ensure authenticated users can still manage their own funnel submissions
-- Update existing policy to be more permissive for viewing
DROP POLICY IF EXISTS "Users can view submissions for their funnels" ON public.funnel_submissions;
CREATE POLICY "Users can view submissions for their funnels" 
ON public.funnel_submissions 
FOR SELECT 
USING (
  funnel_id IN (
    SELECT id 
    FROM public.interactive_funnels 
    WHERE created_by = auth.uid()
  )
);

-- Update management policy to be clearer
DROP POLICY IF EXISTS "Users can manage submissions for their funnels" ON public.funnel_submissions;
CREATE POLICY "Users can manage submissions for their funnels" 
ON public.funnel_submissions 
FOR UPDATE 
USING (
  funnel_id IN (
    SELECT id 
    FROM public.interactive_funnels 
    WHERE created_by = auth.uid()
  )
);

-- Add delete policy
CREATE POLICY "Users can delete submissions for their funnels" 
ON public.funnel_submissions 
FOR DELETE 
USING (
  funnel_id IN (
    SELECT id 
    FROM public.interactive_funnels 
    WHERE created_by = auth.uid()
  )
);