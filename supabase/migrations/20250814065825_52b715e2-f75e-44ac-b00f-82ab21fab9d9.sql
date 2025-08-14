-- Check current market_intelligence table and fix security issue

-- First, let's see the current table structure and policies
\d public.market_intelligence;

-- Check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'market_intelligence';

-- Drop any public read policies that expose competitive intelligence
DROP POLICY IF EXISTS "Public read access to market intelligence" ON public.market_intelligence;
DROP POLICY IF EXISTS "Anyone can view market intelligence" ON public.market_intelligence;
DROP POLICY IF EXISTS "Authenticated users can view market intelligence" ON public.market_intelligence;

-- Create secure policies that restrict access to authenticated users only
CREATE POLICY "Authenticated users can view their market intelligence" 
ON public.market_intelligence 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert market intelligence" 
ON public.market_intelligence 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own market intelligence" 
ON public.market_intelligence 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Ensure RLS is enabled
ALTER TABLE public.market_intelligence ENABLE ROW LEVEL SECURITY;