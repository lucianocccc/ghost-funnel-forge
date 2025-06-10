
-- Add missing columns to the leads table for GPT analysis functionality
ALTER TABLE public.leads 
ADD COLUMN gpt_analysis JSONB,
ADD COLUMN analyzed_at TIMESTAMP WITH TIME ZONE;
