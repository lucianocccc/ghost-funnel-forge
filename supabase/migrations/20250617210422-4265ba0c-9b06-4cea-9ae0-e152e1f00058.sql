
-- First, let's add the missing columns to ai_generated_funnels to support chatbot integration
ALTER TABLE public.ai_generated_funnels 
ADD COLUMN IF NOT EXISTS session_id uuid,
ADD COLUMN IF NOT EXISTS source text DEFAULT 'chatbot',
ADD COLUMN IF NOT EXISTS is_from_chatbot boolean DEFAULT false;

-- Create index for better performance on session queries
CREATE INDEX IF NOT EXISTS idx_ai_generated_funnels_session_id ON public.ai_generated_funnels(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_generated_funnels_source ON public.ai_generated_funnels(source);

-- Add RLS policies for ai_generated_funnels if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_generated_funnels' AND policyname = 'Users can view their own generated funnels') THEN
        CREATE POLICY "Users can view their own generated funnels" 
        ON public.ai_generated_funnels 
        FOR SELECT 
        USING (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_generated_funnels' AND policyname = 'Users can create their own generated funnels') THEN
        CREATE POLICY "Users can create their own generated funnels" 
        ON public.ai_generated_funnels 
        FOR INSERT 
        WITH CHECK (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_generated_funnels' AND policyname = 'Users can update their own generated funnels') THEN
        CREATE POLICY "Users can update their own generated funnels" 
        ON public.ai_generated_funnels 
        FOR UPDATE 
        USING (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_generated_funnels' AND policyname = 'Users can delete their own generated funnels') THEN
        CREATE POLICY "Users can delete their own generated funnels" 
        ON public.ai_generated_funnels 
        FOR DELETE 
        USING (user_id = auth.uid());
    END IF;
END $$;

-- Enable RLS on ai_generated_funnels if not already enabled
ALTER TABLE public.ai_generated_funnels ENABLE ROW LEVEL SECURITY;

-- Create a function to migrate existing chatbot funnels to the unified system
CREATE OR REPLACE FUNCTION migrate_chatbot_funnels_to_unified_system()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Insert existing chatbot_generated_funnels into ai_generated_funnels
    INSERT INTO public.ai_generated_funnels (
        user_id,
        name,
        description,
        funnel_data,
        session_id,
        source,
        is_from_chatbot,
        created_at,
        updated_at,
        interview_id
    )
    SELECT 
        cgf.user_id,
        cgf.funnel_name,
        cgf.funnel_description,
        cgf.funnel_data,
        ci.session_id,
        'chatbot',
        true,
        cgf.created_at,
        cgf.updated_at,
        cgf.interview_id
    FROM public.chatbot_generated_funnels cgf
    JOIN public.chatbot_interviews ci ON cgf.interview_id = ci.id
    WHERE NOT EXISTS (
        SELECT 1 FROM public.ai_generated_funnels agf 
        WHERE agf.interview_id = cgf.interview_id 
        AND agf.name = cgf.funnel_name
        AND agf.user_id = cgf.user_id
    );
END;
$$;

-- Run the migration
SELECT migrate_chatbot_funnels_to_unified_system();

-- Drop the migration function as it's no longer needed
DROP FUNCTION migrate_chatbot_funnels_to_unified_system();
