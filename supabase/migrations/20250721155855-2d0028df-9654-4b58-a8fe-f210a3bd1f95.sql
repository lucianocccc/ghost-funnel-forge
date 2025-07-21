
-- Aggiorna la constraint per includere tutte le tipologie di step necessarie
ALTER TABLE interactive_funnel_steps DROP CONSTRAINT IF EXISTS interactive_funnel_steps_step_type_check;

-- Aggiungi la nuova constraint con tutte le tipologie di step supportate
ALTER TABLE interactive_funnel_steps ADD CONSTRAINT interactive_funnel_steps_step_type_check 
CHECK (step_type IN (
  -- Tipologie base del sistema intelligente
  'lead_capture',
  'qualification', 
  'discovery',
  'conversion',
  'contact_form',
  'thank_you',
  
  -- Tipologie legacy per compatibilità
  'education',
  'follow_up',
  'form',
  'info',
  'survey',
  'contact',
  
  -- Tipologie AI-generated specializzate
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
  'discovery_form',
  'urgency_builder',
  'form_submission',
  'signup',
  'registration',
  'subscribe'
));

-- Crea una nuova tabella per le tipologie di funnel specializzati
CREATE TABLE IF NOT EXISTS funnel_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  industry TEXT,
  target_audience TEXT,
  complexity_level TEXT DEFAULT 'intermediate',
  template_steps JSONB DEFAULT '[]'::jsonb,
  ai_prompts JSONB DEFAULT '{}'::jsonb,
  conversion_optimization JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Abilita RLS per la tabella funnel_types
ALTER TABLE funnel_types ENABLE ROW LEVEL SECURITY;

-- Policy per permettere a tutti di visualizzare i tipi di funnel
CREATE POLICY "Anyone can view funnel types" ON funnel_types
  FOR SELECT USING (is_active = true);

-- Policy per permettere agli admin di gestire i tipi di funnel
CREATE POLICY "Admins can manage funnel types" ON funnel_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'::app_role
    )
  );

-- Inserisci le tipologie di funnel base
INSERT INTO funnel_types (name, description, category, industry, target_audience, complexity_level, template_steps, ai_prompts) VALUES 
-- B2B & SaaS
('SaaS Trial Conversion', 'Converte visitatori in trial gratuiti e poi in clienti paganti', 'saas', 'tecnologia', 'aziende', 'advanced', 
 '[{"type": "lead_capture", "title": "Inizia il tuo trial gratuito"}, {"type": "qualification", "title": "Configura il tuo account"}, {"type": "discovery", "title": "Scopri le funzionalità"}, {"type": "conversion", "title": "Attiva il piano premium"}]'::jsonb,
 '{"system_prompt": "Sei un esperto di conversioni SaaS. Crea funnel che massimizzano i trial-to-paid.", "focus": "trial_conversion", "key_metrics": ["trial_signup", "feature_adoption", "upgrade_rate"]}'::jsonb),

('B2B Lead Generation', 'Genera lead qualificati per aziende B2B', 'b2b', 'generale', 'aziende', 'intermediate',
 '[{"type": "lead_capture", "title": "Scarica la risorsa gratuita"}, {"type": "qualification", "title": "Qualifica la tua azienda"}, {"type": "discovery", "title": "Scopri la soluzione"}, {"type": "contact_form", "title": "Richiedi una demo"}]'::jsonb,
 '{"system_prompt": "Crea funnel B2B che catturano lead di alta qualità attraverso content marketing e qualification intelligente.", "focus": "lead_quality", "key_metrics": ["lead_score", "sql_conversion", "demo_requests"]}'::jsonb),

-- E-commerce
('E-commerce Conversion', 'Ottimizza le vendite online con strategie di conversione avanzate', 'ecommerce', 'retail', 'consumatori', 'intermediate',
 '[{"type": "lead_capture", "title": "Offerta esclusiva"}, {"type": "product_showcase", "title": "Prodotti consigliati"}, {"type": "urgency_builder", "title": "Offerta limitata"}, {"type": "conversion", "title": "Completa l''acquisto"}]'::jsonb,
 '{"system_prompt": "Esperto e-commerce: crea funnel che massimizzano AOV e conversion rate con urgency, social proof e personalizzazione.", "focus": "sales_optimization", "key_metrics": ["conversion_rate", "aov", "cart_abandonment"]}'::jsonb),

('Abandoned Cart Recovery', 'Recupera carrelli abbandonati con strategie personalizzate', 'ecommerce', 'retail', 'consumatori', 'advanced',
 '[{"type": "lead_capture", "title": "Recupera il tuo carrello"}, {"type": "urgency_builder", "title": "Scorte limitate"}, {"type": "social_proof", "title": "Altri hanno acquistato"}, {"type": "conversion", "title": "Completa ora"}]'::jsonb,
 '{"system_prompt": "Specialista cart recovery: crea sequenze che riconquistano clienti con incentivi, urgency e personalizzazione.", "focus": "cart_recovery", "key_metrics": ["recovery_rate", "time_to_purchase", "discount_effectiveness"]}'::jsonb),

-- Lead Magnet & Content Marketing
('Lead Magnet Funnel', 'Cattura lead con contenuti di valore', 'content', 'generale', 'generale', 'basic',
 '[{"type": "lead_capture", "title": "Scarica la risorsa gratuita"}, {"type": "qualification", "title": "Personalizza il contenuto"}, {"type": "discovery", "title": "Contenuti bonus"}, {"type": "contact_form", "title": "Rimani aggiornato"}]'::jsonb,
 '{"system_prompt": "Crea funnel lead magnet che offrono valore immediato e costruiscono fiducia per conversioni future.", "focus": "value_delivery", "key_metrics": ["download_rate", "engagement", "email_signup"]}'::jsonb),

('Webinar Registration', 'Massimizza le registrazioni e partecipazioni ai webinar', 'content', 'education', 'professionisti', 'intermediate',
 '[{"type": "lead_capture", "title": "Registrati al webinar"}, {"type": "qualification", "title": "I tuoi obiettivi"}, {"type": "discovery", "title": "Anteprima contenuti"}, {"type": "contact_form", "title": "Rimani connesso"}]'::jsonb,
 '{"system_prompt": "Esperto webinar: crea funnel che massimizzano registrazioni e show-up rate con preview e value stacking.", "focus": "event_marketing", "key_metrics": ["registration_rate", "show_up_rate", "engagement"]}'::jsonb),

-- Consulenza & Servizi
('Consultation Booking', 'Prenota consulenze con qualification automatica', 'consultation', 'servizi', 'aziende', 'intermediate',
 '[{"type": "lead_capture", "title": "Richiedi consulenza gratuita"}, {"type": "qualification", "title": "La tua situazione"}, {"type": "calendar_booking", "title": "Prenota la chiamata"}, {"type": "thank_you", "title": "Preparazione chiamata"}]'::jsonb,
 '{"system_prompt": "Crea funnel consulenza che pre-qualificano clienti e ottimizzano il booking rate con domande strategiche.", "focus": "consultation_booking", "key_metrics": ["booking_rate", "qualified_calls", "conversion_rate"]}'::jsonb),

('Service Inquiry', 'Genera richieste qualificate per servizi professionali', 'services', 'servizi', 'aziende', 'basic',
 '[{"type": "lead_capture", "title": "Richiedi preventivo"}, {"type": "qualification", "title": "Dettagli progetto"}, {"type": "discovery", "title": "La nostra proposta"}, {"type": "contact_form", "title": "Parliamone"}]'::jsonb,
 '{"system_prompt": "Crea funnel servizi che catturano progetti qualificati con brief dettagliati e value proposition chiari.", "focus": "service_inquiry", "key_metrics": ["inquiry_quality", "project_value", "conversion_rate"]}'::jsonb),

-- Settori Specializzati
('Real Estate Lead Gen', 'Genera lead qualificati nel settore immobiliare', 'real_estate', 'immobiliare', 'acquirenti', 'intermediate',
 '[{"type": "lead_capture", "title": "Trova la casa ideale"}, {"type": "property_preferences", "title": "Le tue preferenze"}, {"type": "location_selector", "title": "Zona desiderata"}, {"type": "viewing_scheduler", "title": "Prenota visita"}]'::jsonb,
 '{"system_prompt": "Esperto immobiliare: crea funnel che qualificano acquirenti con preferenze, budget e timeline specifici.", "focus": "property_matching", "key_metrics": ["lead_quality", "viewing_bookings", "sales_conversion"]}'::jsonb),

('Healthcare Appointment', 'Prenota appuntamenti sanitari con pre-screening', 'healthcare', 'sanità', 'pazienti', 'advanced',
 '[{"type": "lead_capture", "title": "Prenota visita"}, {"type": "health_assessment", "title": "Valutazione iniziale"}, {"type": "specialist_finder", "title": "Specialista adatto"}, {"type": "appointment_booking", "title": "Conferma appuntamento"}]'::jsonb,
 '{"system_prompt": "Specialista healthcare: crea funnel che pre-screening pazienti e ottimizzano il booking sanitario.", "focus": "patient_screening", "key_metrics": ["booking_rate", "show_up_rate", "patient_satisfaction"]}'::jsonb),

-- Educazione & Formazione
('Course Enrollment', 'Massimizza le iscrizioni ai corsi online', 'education', 'formazione', 'studenti', 'intermediate',
 '[{"type": "lead_capture", "title": "Accesso gratuito"}, {"type": "qualification", "title": "I tuoi obiettivi"}, {"type": "discovery", "title": "Anteprima corso"}, {"type": "conversion", "title": "Iscriviti ora"}]'::jsonb,
 '{"system_prompt": "Crea funnel educativi che mostrano valore del corso e superano obiezioni con preview e testimonials.", "focus": "course_enrollment", "key_metrics": ["enrollment_rate", "completion_rate", "satisfaction"]}'::jsonb),

('Skill Assessment', 'Valuta competenze e consiglia percorsi formativi', 'education', 'formazione', 'professionisti', 'advanced',
 '[{"type": "lead_capture", "title": "Testa le tue competenze"}, {"type": "assessment", "title": "Valutazione skills"}, {"type": "discovery", "title": "Percorso consigliato"}, {"type": "conversion", "title": "Inizia il percorso"}]'::jsonb,
 '{"system_prompt": "Crea assessment interattivi che valutano competenze e guidano verso soluzioni formative personalizzate.", "focus": "skill_assessment", "key_metrics": ["assessment_completion", "recommendation_accuracy", "enrollment_rate"]}'::jsonb),

-- Finanza & Investimenti
('Investment Consultation', 'Consulenza finanziaria e investimenti personalizzati', 'finance', 'finanza', 'investitori', 'advanced',
 '[{"type": "lead_capture", "title": "Consulenza gratuita"}, {"type": "qualification", "title": "Profilo investitore"}, {"type": "discovery", "title": "Strategia personalizzata"}, {"type": "contact_form", "title": "Prenota chiamata"}]'::jsonb,
 '{"system_prompt": "Esperto finanziario: crea funnel che profilano investitori e offrono consulenza personalizzata conforme.", "focus": "investment_profiling", "key_metrics": ["profile_completion", "consultation_booking", "client_acquisition"]}'::jsonb),

('Insurance Quote', 'Genera preventivi assicurativi personalizzati', 'insurance', 'assicurazioni', 'consumatori', 'intermediate',
 '[{"type": "lead_capture", "title": "Preventivo gratuito"}, {"type": "qualification", "title": "Le tue esigenze"}, {"type": "calculator", "title": "Calcola premio"}, {"type": "contact_form", "title": "Richiedi polizza"}]'::jsonb,
 '{"system_prompt": "Specialista assicurazioni: crea funnel che raccolgono dati per quote accurate e spingono verso conversione.", "focus": "insurance_quoting", "key_metrics": ["quote_accuracy", "conversion_rate", "customer_satisfaction"]}'::jsonb);

-- Aggiorna il trigger per updated_at
CREATE OR REPLACE FUNCTION update_funnel_types_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crea il trigger se non exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_funnel_types_updated_at_trigger'
    ) THEN
        CREATE TRIGGER update_funnel_types_updated_at_trigger
            BEFORE UPDATE ON funnel_types
            FOR EACH ROW
            EXECUTE FUNCTION update_funnel_types_updated_at();
    END IF;
END $$;
