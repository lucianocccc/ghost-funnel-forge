-- Add missing ai_generated column to ai_generated_funnels table
ALTER TABLE public.ai_generated_funnels 
ADD COLUMN IF NOT EXISTS ai_generated boolean DEFAULT true;

-- Add missing columns for Ghost Funnel integration
ALTER TABLE public.ai_generated_funnels 
ADD COLUMN IF NOT EXISTS share_token text DEFAULT encode(gen_random_bytes(32), 'base64url'),
ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS funnel_type text DEFAULT 'ghost_funnel';

-- Create unique constraint on share_token if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'ai_generated_funnels_share_token_key'
    ) THEN
        ALTER TABLE public.ai_generated_funnels 
        ADD CONSTRAINT ai_generated_funnels_share_token_key UNIQUE (share_token);
    END IF;
END $$;

-- Update RLS policies for ai_generated_funnels to allow users to manage their own funnels
DROP POLICY IF EXISTS "Users can create their own generated funnels" ON public.ai_generated_funnels;
DROP POLICY IF EXISTS "Users can view their own generated funnels" ON public.ai_generated_funnels;
DROP POLICY IF EXISTS "Users can update their own generated funnels" ON public.ai_generated_funnels;

CREATE POLICY "Users can create their own generated funnels" 
ON public.ai_generated_funnels 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view their own generated funnels" 
ON public.ai_generated_funnels 
FOR SELECT 
USING (auth.uid() = created_by OR created_by IS NULL);

CREATE POLICY "Users can update their own generated funnels" 
ON public.ai_generated_funnels 
FOR UPDATE 
USING (auth.uid() = created_by);

-- Enable RLS if not already enabled
ALTER TABLE public.ai_generated_funnels ENABLE ROW LEVEL SECURITY;