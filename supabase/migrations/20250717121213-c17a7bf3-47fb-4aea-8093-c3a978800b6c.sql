
-- Create comprehensive steps for the Aurora funnel based on its morning clarity focus
INSERT INTO interactive_funnel_steps (
  funnel_id,
  title,
  description,
  step_type,
  step_order,
  is_required,
  fields_config,
  settings
) VALUES 
-- Step 1: Welcome and Current Routine Assessment
(
  (SELECT id FROM interactive_funnels WHERE name = 'Aurora: Inizia la tua giornata con chiarezza' LIMIT 1),
  'Benvenuto nella tua Aurora mattutina',
  'Scopri come trasformare le tue mattine in momenti di chiarezza e focus per iniziare ogni giornata al meglio',
  'quiz',
  1,
  true,
  '[
    {
      "id": "current_routine",
      "type": "radio",
      "label": "Come descriveresti la tua routine mattutina attuale?",
      "required": true,
      "options": [
        "Sempre di fretta, non ho una routine fissa",
        "Ho alcuni rituali ma non sempre li seguo",
        "Ho una routine consolidata ma vorrei migliorarla",
        "La mia routine è caotica e stressante",
        "Non ho mai pensato all''importanza di una routine mattutina"
      ]
    },
    {
      "id": "wake_up_feeling",
      "type": "radio",
      "label": "Come ti senti solitamente quando ti svegli?",
      "required": true,
      "options": [
        "Energico e pronto per la giornata",
        "Un po'' confuso ma mi riprendo velocemente",
        "Stressato pensando alla giornata che mi aspetta",
        "Stanco e demotivato",
        "Dipende molto da come ho dormito"
      ]
    }
  ]'::jsonb,
  '{"submitButtonText": "Continua il viaggio", "progressText": "Conosciamoci meglio..."}'::jsonb
),
-- Step 2: Challenges and Pain Points Discovery
(
  (SELECT id FROM interactive_funnels WHERE name = 'Aurora: Inizia la tua giornata con chiarezza' LIMIT 1),
  'Identifichiamo le tue sfide mattutine',
  'Capire cosa ti impedisce di avere mattine serene è il primo passo per trasformarle',
  'assessment',
  2,
  true,
  '[
    {
      "id": "morning_challenges",
      "type": "checkbox",
      "label": "Quali sono le tue principali difficoltà al mattino? (puoi selezionare più opzioni)",
      "required": true,
      "options": [
        "Difficoltà a svegliarmi all''orario desiderato",
        "Ansia o stress per la giornata che mi aspetta",
        "Mancanza di energia e motivazione",
        "Sensazione di non avere abbastanza tempo",
        "Troppo tempo perso sui social o telefono",
        "Non so da dove iniziare o cosa prioritizzare",
        "Salto sempre la colazione",
        "Non riesco mai a fare attività fisica",
        "Mi sento sopraffatto dalle cose da fare"
      ]
    },
    {
      "id": "biggest_obstacle",
      "type": "textarea",
      "label": "Qual è il tuo ostacolo più grande per avere mattine migliori?",
      "required": false,
      "placeholder": "Descrivi con le tue parole cosa ti impedisce di iniziare bene la giornata..."
    }
  ]'::jsonb,
  '{"submitButtonText": "Andiamo avanti", "progressText": "Stiamo mappando le tue sfide..."}'::jsonb
),
-- Step 3: Goals and Aspirations
(
  (SELECT id FROM interactive_funnels WHERE name = 'Aurora: Inizia la tua giornata con chiarezza' LIMIT 1),
  'La tua mattina ideale',
  'Immagina come vorresti che fossero le tue mattine. Questo ci aiuterà a creare il tuo piano personalizzato',
  'qualification',
  3,
  true,
  '[
    {
      "id": "ideal_morning",
      "type": "radio",
      "label": "Come vorresti sentirti nelle prime ore del mattino?",
      "required": true,
      "options": [
        "Calmo, centrato e con le idee chiare",
        "Energico e motivato per affrontare la giornata",
        "Sereno, senza fretta né stress",
        "Produttivo e organizzato",
        "Ispirato e creativo"
      ]
    },
    {
      "id": "morning_activities",
      "type": "checkbox",
      "label": "Cosa ti piacerebbe includere nella tua routine mattutina ideale?",
      "required": true,
      "options": [
        "Meditazione o mindfulness",
        "Esercizio fisico o stretching",
        "Lettura o apprendimento",
        "Pianificazione della giornata",
        "Colazione sana e consapevole",
        "Momento di gratitudine o riflessione",
        "Tempo per hobby personali",
        "Preparazione mentale per obiettivi importanti"
      ]
    },
    {
      "id": "available_time",
      "type": "radio",
      "label": "Quanto tempo potresti realisticamente dedicare alla tua nuova routine mattutina?",
      "required": true,
      "options": [
        "15-20 minuti",
        "30-45 minuti",
        "1 ora",
        "Più di 1 ora",
        "Dipende dalla giornata"
      ]
    }
  ]'::jsonb,
  '{"submitButtonText": "Quasi finito!", "progressText": "Definendo la tua visione..."}'::jsonb
),
-- Step 4: Contact Information and Personalization
(
  (SELECT id FROM interactive_funnels WHERE name = 'Aurora: Inizia la tua giornata con chiarezza' LIMIT 1),
  'Ricevi il tuo Piano Aurora personalizzato',
  'Inserisci i tuoi dati per ricevere immediatamente il tuo piano mattutino personalizzato e iniziare la trasformazione',
  'contact_form',
  4,
  true,
  '[
    {
      "id": "name",
      "type": "text",
      "label": "Il tuo nome",
      "required": true,
      "placeholder": "Come ti chiami?"
    },
    {
      "id": "email",
      "type": "email",
      "label": "La tua email",
      "required": true,
      "placeholder": "La tua email per ricevere il Piano Aurora"
    },
    {
      "id": "phone",
      "type": "tel",
      "label": "Telefono (opzionale)",
      "required": false,
      "placeholder": "Per consigli personalizzati via WhatsApp"
    },
    {
      "id": "urgency",
      "type": "radio",
      "label": "Quanto è urgente per te migliorare le tue mattine?",
      "required": true,
      "options": [
        "Molto urgente - voglio iniziare subito",
        "Importante - nelle prossime settimane",
        "Moderato - quando avrò tempo",
        "Solo curiosità al momento"
      ]
    },
    {
      "id": "newsletter_consent",
      "type": "checkbox",
      "label": "Voglio ricevere consigli settimanali per ottimizzare le mie mattine",
      "required": false,
      "options": ["Sì, inviami tips e strategie per migliorare la mia routine mattutina"]
    }
  ]'::jsonb,
  '{"submitButtonText": "Ricevi il mio Piano Aurora", "progressText": "Creando il tuo piano personalizzato...", "completionMessage": "Perfetto! Il tuo Piano Aurora personalizzato ti arriverà via email tra pochi minuti."}'::jsonb
)
ON CONFLICT (funnel_id, step_order) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  step_type = EXCLUDED.step_type,
  is_required = EXCLUDED.is_required,
  fields_config = EXCLUDED.fields_config,
  settings = EXCLUDED.settings,
  updated_at = now();

-- Update the Aurora funnel settings to ensure it's properly configured for the new steps
UPDATE interactive_funnels 
SET 
  is_public = true,
  status = 'active',
  settings = jsonb_set(
    COALESCE(settings, '{}'::jsonb),
    '{customer_facing}',
    '{
      "hero_title": "Trasforma le tue mattine con Aurora",
      "hero_subtitle": "Scopri il metodo per iniziare ogni giornata con chiarezza, focus ed energia positiva",
      "completion_message": "Fantastico! Il tuo Piano Aurora personalizzato è in arrivo",
      "thank_you_text": "Grazie per aver completato la valutazione. Riceverai il tuo piano mattutino personalizzato via email tra pochi minuti."
    }'::jsonb
  ),
  updated_at = now()
WHERE name = 'Aurora: Inizia la tua giornata con chiarezza';

-- Also ensure the funnel has proper analytics tracking
INSERT INTO funnel_analytics_events (
  funnel_id,
  event_type,
  event_data
) 
SELECT 
  id,
  'funnel_setup_completed',
  jsonb_build_object(
    'steps_count', 4,
    'setup_date', now(),
    'funnel_focus', 'morning_routine_optimization'
  )
FROM interactive_funnels 
WHERE name = 'Aurora: Inizia la tua giornata con chiarezza'
ON CONFLICT DO NOTHING;
