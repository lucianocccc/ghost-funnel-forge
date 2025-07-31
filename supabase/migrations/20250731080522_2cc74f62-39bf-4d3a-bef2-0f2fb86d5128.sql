-- Add missing ai_generated column to ai_generated_funnels table
ALTER TABLE public.ai_generated_funnels 
ADD COLUMN IF NOT EXISTS ai_generated boolean DEFAULT true;

-- Add missing columns for Ghost Funnel integration
ALTER TABLE public.ai_generated_funnels 
ADD COLUMN IF NOT EXISTS funnel_type text DEFAULT 'ghost_funnel';

-- Update RLS policies for ai_generated_funnels to allow users to manage their own funnels
DROP POLICY IF EXISTS "Users can create their own generated funnels" ON public.ai_generated_funnels;
DROP POLICY IF EXISTS "Users can view their own generated funnels" ON public.ai_generated_funnels;
DROP POLICY IF EXISTS "Users can update their own generated funnels" ON public.ai_generated_funnels;

CREATE POLICY "Users can create their own generated funnels" 
ON public.ai_generated_funnels 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own generated funnels" 
ON public.ai_generated_funnels 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own generated funnels" 
ON public.ai_generated_funnels 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Enable RLS if not already enabled
ALTER TABLE public.ai_generated_funnels ENABLE ROW LEVEL SECURITY;