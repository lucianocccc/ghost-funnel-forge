-- Verify and strengthen leads table security

-- Check if we need to assign existing orphaned leads to an admin user
-- First, let's see if there are any leads without user_id that should be assigned
-- We'll assign them to the first admin user we find

DO $$
DECLARE
    admin_user_id UUID;
    orphaned_leads_count INTEGER;
BEGIN
    -- Find the first admin user
    SELECT id INTO admin_user_id 
    FROM public.profiles 
    WHERE role = 'admin'::app_role 
    LIMIT 1;
    
    -- Count orphaned leads
    SELECT COUNT(*) INTO orphaned_leads_count 
    FROM public.leads 
    WHERE user_id IS NULL;
    
    -- If we have an admin user and orphaned leads, assign them
    IF admin_user_id IS NOT NULL AND orphaned_leads_count > 0 THEN
        UPDATE public.leads 
        SET user_id = admin_user_id 
        WHERE user_id IS NULL;
        
        RAISE NOTICE 'Assigned % orphaned leads to admin user %', orphaned_leads_count, admin_user_id;
    END IF;
END $$;

-- Ensure the user_id column is NOT NULL for better security
-- (This will prevent future issues)
ALTER TABLE public.leads ALTER COLUMN user_id SET NOT NULL;

-- Update the policies to be more restrictive now that all leads have owners
DROP POLICY IF EXISTS "Allow anonymous lead creation" ON public.leads;
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can create their own leads" ON public.leads;

-- Create updated secure policies
CREATE POLICY "Users can view their own leads" 
ON public.leads 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public forms can create leads for users" 
ON public.leads 
FOR INSERT 
WITH CHECK (user_id IS NOT NULL);