-- Secure the market_intelligence table by restricting access to authenticated users only

-- Drop any existing public read policies that expose competitive intelligence
DROP POLICY IF EXISTS "Public read access to market intelligence" ON public.market_intelligence;
DROP POLICY IF EXISTS "Anyone can view market intelligence" ON public.market_intelligence;
DROP POLICY IF EXISTS "Authenticated users can view market intelligence" ON public.market_intelligence;
DROP POLICY IF EXISTS "Public can view market intelligence" ON public.market_intelligence;

-- Create secure policies that restrict access to authenticated users only
CREATE POLICY "Authenticated users can view market intelligence" 
ON public.market_intelligence 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert market intelligence" 
ON public.market_intelligence 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update market intelligence" 
ON public.market_intelligence 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Ensure RLS is enabled (should already be enabled but let's make sure)
ALTER TABLE public.market_intelligence ENABLE ROW LEVEL SECURITY;