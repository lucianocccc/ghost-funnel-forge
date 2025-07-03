
-- Create a SECURITY DEFINER function to check if a lead belongs to a funnel owned by the current user
CREATE OR REPLACE FUNCTION public.user_owns_lead_funnel(lead_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    funnel_owner_id UUID;
BEGIN
    -- Get the funnel owner for this lead
    SELECT if.created_by INTO funnel_owner_id
    FROM public.consolidated_leads cl
    JOIN public.interactive_funnels if ON cl.source_funnel_id = if.id
    WHERE cl.id = lead_id;
    
    RETURN funnel_owner_id = auth.uid();
END;
$$;

-- Update the INSERT policy for lead_submissions_mapping to allow system-level insertions
DROP POLICY IF EXISTS "Users can create lead submissions mapping" ON public.lead_submissions_mapping;

CREATE POLICY "Users can create lead submissions mapping" ON public.lead_submissions_mapping
  FOR INSERT 
  WITH CHECK (
    -- Allow users to create mappings for their own leads
    (EXISTS (
      SELECT 1 FROM public.consolidated_leads cl 
      WHERE cl.id = consolidated_lead_id AND cl.user_id = auth.uid()
    )) OR 
    -- Allow system to create mappings for leads from funnels owned by users (public submissions)
    (user_owns_lead_funnel(consolidated_lead_id))
  );

-- Update the SELECT policy for lead_submissions_mapping
DROP POLICY IF EXISTS "Users can view their lead submissions mapping" ON public.lead_submissions_mapping;

CREATE POLICY "Users can view their lead submissions mapping" ON public.lead_submissions_mapping
  FOR SELECT 
  USING (
    -- Users can see mappings for their own leads
    (EXISTS (
      SELECT 1 FROM public.consolidated_leads cl 
      WHERE cl.id = consolidated_lead_id AND cl.user_id = auth.uid()
    )) OR 
    -- Users can see mappings for leads from their funnels
    (user_owns_lead_funnel(consolidated_lead_id))
  );

-- Update the consolidation trigger function to handle the mapping insertion more safely
CREATE OR REPLACE FUNCTION public.consolidate_funnel_submission()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
    existing_lead_id UUID;
    business_area_id_var UUID;
    business_sub_area_id_var UUID;
    lead_name TEXT;
    lead_email TEXT;
    lead_phone TEXT;
    lead_company TEXT;
    funnel_owner_id UUID;
BEGIN
    -- Estrai informazioni dal submission_data
    lead_email := NEW.submission_data->>'email';
    lead_name := COALESCE(NEW.submission_data->>'name', NEW.submission_data->>'nome', NEW.user_name);
    lead_phone := COALESCE(NEW.submission_data->>'phone', NEW.submission_data->>'telefono');
    lead_company := COALESCE(NEW.submission_data->>'company', NEW.submission_data->>'azienda');

    -- Se non abbiamo email, non possiamo consolidare
    IF lead_email IS NULL THEN
        RETURN NEW;
    END IF;

    -- Get the funnel owner's user_id
    SELECT created_by INTO funnel_owner_id 
    FROM public.interactive_funnels 
    WHERE id = NEW.funnel_id 
    LIMIT 1;

    -- Cerca un lead esistente con la stessa email per lo stesso proprietario del funnel
    SELECT id INTO existing_lead_id 
    FROM public.consolidated_leads 
    WHERE email = lead_email 
    AND (user_id = funnel_owner_id OR source_funnel_id = NEW.funnel_id)
    LIMIT 1;

    -- Se non esiste, crea un nuovo lead consolidato
    IF existing_lead_id IS NULL THEN
        -- Determina l'area di business basata sul funnel o sui dati
        SELECT id INTO business_area_id_var 
        FROM public.business_areas 
        WHERE name = 'Altro' 
        LIMIT 1;

        INSERT INTO public.consolidated_leads (
            user_id,
            name,
            email,
            phone,
            company,
            business_area_id,
            source_funnel_id,
            status,
            last_interaction_at
        ) VALUES (
            funnel_owner_id, -- Set the funnel owner as the user_id
            lead_name,
            lead_email,
            lead_phone,
            lead_company,
            business_area_id_var,
            NEW.funnel_id,
            'new',
            NEW.created_at
        ) RETURNING id INTO existing_lead_id;
    ELSE
        -- Aggiorna il lead esistente con nuove informazioni
        UPDATE public.consolidated_leads 
        SET 
            name = COALESCE(lead_name, name),
            phone = COALESCE(lead_phone, phone),
            company = COALESCE(lead_company, company),
            last_interaction_at = NEW.created_at,
            updated_at = now()
        WHERE id = existing_lead_id;
    END IF;

    -- Crea il mapping tra submission e lead consolidato
    -- This will now work with the updated RLS policy
    INSERT INTO public.lead_submissions_mapping (
        consolidated_lead_id,
        submission_id,
        submission_data
    ) VALUES (
        existing_lead_id,
        NEW.id,
        NEW.submission_data
    ) ON CONFLICT (consolidated_lead_id, submission_id) DO NOTHING;

    RETURN NEW;
END;
$function$;
