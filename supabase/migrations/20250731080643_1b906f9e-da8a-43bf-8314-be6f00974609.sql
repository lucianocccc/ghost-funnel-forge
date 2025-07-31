-- Add missing columns for Ghost Funnel data that the orchestrator expects
ALTER TABLE public.ai_generated_funnels 
ADD COLUMN IF NOT EXISTS industry text,
ADD COLUMN IF NOT EXISTS use_case text DEFAULT 'Ghost Funnel';