
-- First, let's check if there's a trigger causing the consolidated_leads insertion
-- and modify the RLS policy to allow public submissions to be consolidated

-- Update the RLS policy for consolidated_leads to allow system-level insertions
-- when the user_id is NULL (for public funnel submissions)
DROP POLICY IF EXISTS "Users can create their own consolidated leads" ON public.consolidated_leads;

CREATE POLICY "Users can create their own consolidated leads" ON public.consolidated_leads
  FOR INSERT 
  WITH CHECK (
    -- Allow users to create their own leads
    (auth.uid() = user_id) OR 
    -- Allow system to create leads for public submissions (user_id can be NULL)
    (user_id IS NULL)
  );

-- Also update the SELECT policy to allow users to see consolidated leads from their funnels
DROP POLICY IF EXISTS "Users can view their own consolidated leads" ON public.consolidated_leads;

CREATE POLICY "Users can view their own consolidated leads" ON public.consolidated_leads
  FOR SELECT 
  USING (
    -- Users can see their own leads
    (auth.uid() = user_id) OR 
    -- Users can see leads from their public funnels (even if user_id is NULL)
    (source_funnel_id IN (
      SELECT id FROM public.interactive_funnels 
      WHERE created_by = auth.uid()
    ))
  );

-- Update the UPDATE policy
DROP POLICY IF EXISTS "Users can update their own consolidated leads" ON public.consolidated_leads;

CREATE POLICY "Users can update their own consolidated leads" ON public.consolidated_leads
  FOR UPDATE 
  USING (
    -- Users can update their own leads
    (auth.uid() = user_id) OR 
    -- Users can update leads from their public funnels
    (source_funnel_id IN (
      SELECT id FROM public.interactive_funnels 
      WHERE created_by = auth.uid()
    ))
  );

-- Update the DELETE policy
DROP POLICY IF EXISTS "Users can delete their own consolidated leads" ON public.consolidated_leads;

CREATE POLICY "Users can delete their own consolidated leads" ON public.consolidated_leads
  FOR DELETE 
  USING (
    -- Users can delete their own leads
    (auth.uid() = user_id) OR 
    -- Users can delete leads from their public funnels
    (source_funnel_id IN (
      SELECT id FROM public.interactive_funnels 
      WHERE created_by = auth.uid()
    ))
  );
