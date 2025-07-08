-- Fix RLS policies for funnel_submissions to allow public submissions
-- First, drop the existing problematic policy
DROP POLICY IF EXISTS "Public can submit to shared funnels" ON public.funnel_submissions;

-- Create a more permissive policy for public submissions
-- This allows anyone to insert funnel submissions for public funnels
CREATE POLICY "Allow public submissions to shared funnels" 
ON public.funnel_submissions 
FOR INSERT 
WITH CHECK (
  -- Allow if the funnel is public
  EXISTS (
    SELECT 1 
    FROM public.interactive_funnels 
    WHERE id = funnel_submissions.funnel_id 
    AND is_public = true
  )
);

-- Keep the existing policies for authenticated users
-- Users can still manage submissions for their own funnels
-- The existing policies for SELECT, UPDATE, DELETE remain unchanged

-- Add a policy to allow anonymous users to insert without authentication
CREATE POLICY "Anonymous public funnel submissions" 
ON public.funnel_submissions 
FOR INSERT 
WITH CHECK (
  -- Allow if the funnel is public, regardless of authentication
  funnel_id IN (
    SELECT id 
    FROM public.interactive_funnels 
    WHERE is_public = true
  )
);