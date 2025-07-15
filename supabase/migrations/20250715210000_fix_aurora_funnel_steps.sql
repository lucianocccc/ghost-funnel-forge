
-- Add default steps for the Aurora funnel that currently has no steps
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
(
  (SELECT id FROM interactive_funnels WHERE name = 'Aurora: Inizia la tua giornata con chiarezza' LIMIT 1),
  'Benvenuto nella tua Aurora mattutina',
  'Scopri come iniziare ogni giornata con maggiore chiarezza e focus',
  'quiz',
  1,
  true,
  '[
    {
      "id": "morning_routine",
      "type": "radio",
      "label": "Qual è la tua routine mattutina attuale?",
      "required": true,
      "options": [
        "Mi sveglio sempre di fretta",
        "Ho una routine ma non sempre la seguo",
        "Ho una routine consolidata",
        "Non ho una routine specifica"
      ]
    }
  ]'::jsonb,
  '{"submitButtonText": "Continua"}'::jsonb
),
(
  (SELECT id FROM interactive_funnels WHERE name = 'Aurora: Inizia la tua giornata con chiarezza' LIMIT 1),
  'Le tue sfide mattutine',
  'Identifichiamo insieme cosa ti impedisce di avere mattine più serene',
  'assessment',
  2,
  true,
  '[
    {
      "id": "morning_challenges",
      "type": "checkbox",
      "label": "Quali sono le tue principali sfide al mattino?",
      "required": true,
      "options": [
        "Difficoltà a svegliarmi",
        "Stress per la giornata che mi aspetta",
        "Mancanza di energia",
        "Troppo poco tempo",
        "Non so da dove iniziare",
        "Distrazione da telefono/social"
      ]
    }
  ]'::jsonb,
  '{"submitButtonText": "Avanti"}'::jsonb
),
(
  (SELECT id FROM interactive_funnels WHERE name = 'Aurora: Inizia la tua giornata con chiarezza' LIMIT 1),
  'I tuoi dati di contatto',
  'Lasciaci i tuoi dati per ricevere un piano personalizzato per le tue mattine',
  'contact_form',
  3,
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
      "placeholder": "La tua email per ricevere il piano"
    },
    {
      "id": "phone",
      "type": "tel",
      "label": "Telefono (opzionale)",
      "required": false,
      "placeholder": "Il tuo numero di telefono"
    }
  ]'::jsonb,
  '{"submitButtonText": "Ricevi il mio piano Aurora"}'::jsonb
)
ON CONFLICT DO NOTHING;

-- Update the funnel to ensure it's properly configured
UPDATE interactive_funnels 
SET 
  is_public = true,
  status = 'active',
  updated_at = now()
WHERE name = 'Aurora: Inizia la tua giornata con chiarezza';
