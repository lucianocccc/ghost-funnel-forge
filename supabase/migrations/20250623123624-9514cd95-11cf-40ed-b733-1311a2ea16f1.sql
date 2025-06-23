
-- 1. Creare tabelle per aree di business e sottoaree
CREATE TABLE IF NOT EXISTS public.business_areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color_hex TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT 'briefcase',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.business_sub_areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_area_id UUID NOT NULL REFERENCES public.business_areas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_area_id, name)
);

-- 2. Creare tabella per lead consolidati
CREATE TABLE IF NOT EXISTS public.consolidated_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  business_area_id UUID REFERENCES public.business_areas(id),
  business_sub_area_id UUID REFERENCES public.business_sub_areas(id),
  source_funnel_id UUID REFERENCES public.interactive_funnels(id),
  lead_score INTEGER DEFAULT 0,
  priority_level TEXT DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'in_progress', 'qualified', 'converted', 'lost')),
  tags JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  ai_analysis JSONB,
  ai_insights JSONB DEFAULT '[]'::jsonb,
  ai_recommendations JSONB DEFAULT '[]'::jsonb,
  action_plan JSONB DEFAULT '[]'::jsonb,
  next_follow_up DATE,
  last_interaction_at TIMESTAMP WITH TIME ZONE,
  analyzed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Creare tabella per mappare submission a lead consolidati
CREATE TABLE IF NOT EXISTS public.lead_submissions_mapping (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consolidated_lead_id UUID NOT NULL REFERENCES public.consolidated_leads(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES public.funnel_submissions(id) ON DELETE CASCADE,
  submission_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(consolidated_lead_id, submission_id)
);

-- 4. Creare tabella per tracciare interazioni con i lead
CREATE TABLE IF NOT EXISTS public.lead_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consolidated_lead_id UUID NOT NULL REFERENCES public.consolidated_leads(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('email', 'call', 'meeting', 'note', 'task', 'automation')),
  subject TEXT,
  content TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Inserire aree di business predefinite
INSERT INTO public.business_areas (name, description, color_hex, icon) VALUES
('E-commerce', 'Negozi online e vendita digitale', '#10B981', 'shopping-cart'),
('Servizi Professionali', 'Consulenze, studi legali, commercialisti', '#6366F1', 'briefcase'),
('Ristoranti e Food', 'Ristorazione e settore alimentare', '#F59E0B', 'utensils'),
('Immobiliare', 'Agenzie immobiliari e costruzioni', '#8B5CF6', 'home'),
('Salute e Benessere', 'Centri medici, palestre, spa', '#EF4444', 'heart'),
('Tecnologia', 'Software, IT, servizi digitali', '#06B6D4', 'cpu'),
('Educazione', 'Scuole, corsi, formazione', '#84CC16', 'graduation-cap'),
('Altro', 'Altri settori non classificati', '#6B7280', 'more-horizontal')
ON CONFLICT (name) DO NOTHING;

-- 6. Inserire sottoaree per E-commerce
INSERT INTO public.business_sub_areas (business_area_id, name, description) 
SELECT id, unnest(ARRAY[
  'Fashion e Abbigliamento',
  'Elettronica e Gadget',
  'Casa e Giardino',
  'Sport e Tempo Libero',
  'Bellezza e Cosmetici',
  'Libri e Media',
  'Alimentari e Bevande'
]), unnest(ARRAY[
  'Vendita di abbigliamento e accessori online',
  'Dispositivi elettronici e gadget tecnologici',
  'Prodotti per la casa e il giardino',
  'Attrezzature sportive e hobby',
  'Prodotti di bellezza e cura personale',
  'Libri, ebook, contenuti digitali',
  'Vendita di prodotti alimentari online'
])
FROM public.business_areas WHERE name = 'E-commerce';

-- 7. Inserire sottoaree per Servizi Professionali
INSERT INTO public.business_sub_areas (business_area_id, name, description) 
SELECT id, unnest(ARRAY[
  'Consulenza Aziendale',
  'Servizi Legali',
  'Contabilità e Fiscale',
  'Marketing e Comunicazione',
  'Design e Creatività',
  'Traduzione e Linguistica'
]), unnest(ARRAY[
  'Consulenza strategica e operativa per aziende',
  'Studi legali e assistenza giuridica',
  'Servizi di contabilità e consulenza fiscale',
  'Agenzie di marketing e comunicazione',
  'Servizi di design grafico e web',
  'Traduzione e servizi linguistici'
])
FROM public.business_areas WHERE name = 'Servizi Professionali';

-- 8. Abilitare RLS per le nuove tabelle
ALTER TABLE public.business_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_sub_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consolidated_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_submissions_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_interactions ENABLE ROW LEVEL SECURITY;

-- 9. Creare policy RLS per business areas (pubbliche per tutti gli utenti autenticati)
CREATE POLICY "Users can view business areas" ON public.business_areas FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can view business sub areas" ON public.business_sub_areas FOR SELECT USING (auth.uid() IS NOT NULL);

-- 10. Policy RLS per consolidated_leads (solo i propri lead)
CREATE POLICY "Users can view their own consolidated leads" ON public.consolidated_leads 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own consolidated leads" ON public.consolidated_leads 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own consolidated leads" ON public.consolidated_leads 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own consolidated leads" ON public.consolidated_leads 
  FOR DELETE USING (auth.uid() = user_id);

-- 11. Policy RLS per lead_submissions_mapping
CREATE POLICY "Users can view their lead submissions mapping" ON public.lead_submissions_mapping 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.consolidated_leads cl 
      WHERE cl.id = consolidated_lead_id AND cl.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can create lead submissions mapping" ON public.lead_submissions_mapping 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.consolidated_leads cl 
      WHERE cl.id = consolidated_lead_id AND cl.user_id = auth.uid()
    )
  );

-- 12. Policy RLS per lead_interactions
CREATE POLICY "Users can view their lead interactions" ON public.lead_interactions 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.consolidated_leads cl 
      WHERE cl.id = consolidated_lead_id AND cl.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can create lead interactions" ON public.lead_interactions 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.consolidated_leads cl 
      WHERE cl.id = consolidated_lead_id AND cl.user_id = auth.uid()
    )
  );

-- 13. Creare funzione per aggiornare updated_at
CREATE OR REPLACE FUNCTION public.update_consolidated_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 14. Trigger per aggiornare updated_at
CREATE TRIGGER update_consolidated_leads_updated_at_trigger
    BEFORE UPDATE ON public.consolidated_leads
    FOR EACH ROW
    EXECUTE FUNCTION public.update_consolidated_leads_updated_at();

-- 15. Creare indici per performance
CREATE INDEX IF NOT EXISTS idx_consolidated_leads_user_id ON public.consolidated_leads(user_id);
CREATE INDEX IF NOT EXISTS idx_consolidated_leads_business_area ON public.consolidated_leads(business_area_id);
CREATE INDEX IF NOT EXISTS idx_consolidated_leads_status ON public.consolidated_leads(status);
CREATE INDEX IF NOT EXISTS idx_consolidated_leads_priority ON public.consolidated_leads(priority_level);
CREATE INDEX IF NOT EXISTS idx_consolidated_leads_email ON public.consolidated_leads(email);
CREATE INDEX IF NOT EXISTS idx_lead_submissions_mapping_lead_id ON public.lead_submissions_mapping(consolidated_lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_interactions_lead_id ON public.lead_interactions(consolidated_lead_id);

-- 16. Creare funzione per consolidare automaticamente le submission in lead
CREATE OR REPLACE FUNCTION public.consolidate_funnel_submission()
RETURNS TRIGGER AS $$
DECLARE
    existing_lead_id UUID;
    business_area_id_var UUID;
    business_sub_area_id_var UUID;
    lead_name TEXT;
    lead_email TEXT;
    lead_phone TEXT;
    lead_company TEXT;
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

    -- Cerca un lead esistente con la stessa email
    SELECT id INTO existing_lead_id 
    FROM public.consolidated_leads 
    WHERE email = lead_email 
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
            NULL, -- user_id sarà aggiunto tramite trigger o processo separato
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
$$ LANGUAGE plpgsql;

-- 17. Trigger per consolidare automaticamente le submission
CREATE TRIGGER trigger_consolidate_funnel_submission
    AFTER INSERT ON public.funnel_submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.consolidate_funnel_submission();
