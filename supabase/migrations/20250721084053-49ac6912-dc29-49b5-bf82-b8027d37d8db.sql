
-- Prima, rimuoviamo il vincolo esistente che è troppo restrittivo
ALTER TABLE interactive_funnel_steps DROP CONSTRAINT IF EXISTS interactive_funnel_steps_step_type_check;

-- Aggiungiamo un nuovo vincolo che include tutti i tipi di step necessari per il sistema intelligente
ALTER TABLE interactive_funnel_steps ADD CONSTRAINT interactive_funnel_steps_step_type_check 
CHECK (step_type IN (
  -- Tipi di step standard del sistema intelligente
  'lead_capture',
  'qualification', 
  'discovery',
  'conversion',
  'contact_form',
  'thank_you',
  -- Tipi di step legacy per compatibilità
  'education',
  'follow_up',
  'form',
  'info',
  'survey',
  'contact',
  -- Tipi aggiuntivi che potrebbero essere generati dall'AI
  'quiz',
  'assessment',
  'calculator',
  'demo_request',
  'trial_signup',
  'calendar_booking',
  'social_proof',
  'product_showcase',
  'lead_magnet',
  'feature_selection',
  'technical_qualification',
  'onboarding',
  'property_preferences',
  'budget_calculator',
  'location_selector',
  'viewing_scheduler',
  'health_assessment',
  'symptom_checker',
  'specialist_finder',
  'appointment_booking',
  'medical_form',
  'case_study',
  'discovery_form'
));

-- Aggiungiamo una policy RLS più permissiva per permettere l'inserimento da parte dell'edge function
-- che usa il service role key
CREATE POLICY IF NOT EXISTS "Service role can manage all interactive funnel steps" 
ON interactive_funnel_steps 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Assicuriamoci che l'incremento delle submission funzioni correttamente
CREATE OR REPLACE FUNCTION public.increment_interactive_funnel_submissions(funnel_id_param uuid)
RETURNS void AS $$
BEGIN
  UPDATE interactive_funnels 
  SET submissions_count = COALESCE(submissions_count, 0) + 1,
      updated_at = now()
  WHERE id = funnel_id_param;
  
  -- Log per debug
  RAISE NOTICE 'Updated submission count for funnel: %, rows affected: %', funnel_id_param, ROW_COUNT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Assicuriamoci che l'incremento delle views funzioni correttamente
CREATE OR REPLACE FUNCTION public.increment_interactive_funnel_views(share_token_param text)
RETURNS void AS $$
BEGIN
  UPDATE public.interactive_funnels 
  SET views_count = COALESCE(views_count, 0) + 1,
      updated_at = now()
  WHERE share_token = share_token_param 
  AND is_public = true;
  
  -- Log per debug
  RAISE NOTICE 'Updated views for token: %, rows affected: %', share_token_param, ROW_COUNT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
