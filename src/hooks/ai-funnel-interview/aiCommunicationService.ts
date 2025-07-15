
import { supabase } from '@/integrations/supabase/client';

export const sendMessageToAI = async (
  message: string,
  sessionId: string
): Promise<{ success: boolean; message: string; sessionId: string; error?: string }> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    // Enhanced prompt per personalizzazione completa del funnel
    const enhancedPrompt = `${message}

CONTESTO: L'utente sta descrivendo il suo prodotto/servizio per creare un funnel personalizzato. Il tuo obiettivo è capire profondamente le sue esigenze e creare contenuti specifici per ogni sezione del funnel.

APPROCCIO CONVERSAZIONALE:
- Fai UNA domanda alla volta per mantenere la conversazione naturale
- Concentrati su: settore, target audience, pain points specifici, benefici unici, urgenza naturale
- Evita domande generiche, sii specifico sul suo business

QUANDO HAI ABBASTANZA INFORMAZIONI, genera UN SOLO funnel usando ESATTAMENTE questo formato JSON:

{
  "name": "[Nome Specifico del Funnel]",
  "description": "[Descrizione dettagliata del prodotto/servizio]",
  "steps": [
    {
      "step_order": 1,
      "step_type": "form",
      "title": "Richiedi Informazioni",
      "description": "Form personalizzato per il lead specifico",
      "fields_config": [
        {"type": "text", "name": "nome", "label": "Nome", "required": true, "placeholder": "Il tuo nome"},
        {"type": "email", "name": "email", "label": "Email", "required": true, "placeholder": "La tua email"},
        {"type": "tel", "name": "telefono", "label": "Telefono", "required": false, "placeholder": "Il tuo numero"},
        {"type": "select", "name": "esigenza", "label": "[Domanda specifica per il business]", "required": true, "options": ["[Opzione 1 specifica]", "[Opzione 2 specifica]", "[Opzione 3 specifica]"]},
        {"type": "textarea", "name": "dettagli", "label": "[Domanda approfondita specifica]", "required": false, "placeholder": "[Placeholder specifico per il business]"}
      ],
      "settings": {
        "submitButtonText": "[Call-to-action specifica]",
        "description": "[Descrizione personalizzata per il form]"
      }
    }
  ],
  "settings": {
    "productSpecific": true,
    "focusType": "consultative",
    "product_name": "[Nome del prodotto/servizio]",
    "personalizedSections": {
      "hero": {
        "title": "[Titolo hero magnetico e specifico]",
        "subtitle": "[Sottotitolo che parla direttamente al target]",
        "value_proposition": "[Proposta di valore unica e specifica]",
        "cta_text": "[Call-to-action specifica]"
      },
      "attraction": {
        "main_headline": "[Headline principale per attrazione]",
        "benefits": [
          {
            "title": "[Beneficio 1 specifico]",
            "description": "[Descrizione dettagliata del beneficio]",
            "icon_name": "target"
          },
          {
            "title": "[Beneficio 2 specifico]",
            "description": "[Descrizione dettagliata del beneficio]",
            "icon_name": "zap"
          },
          {
            "title": "[Beneficio 3 specifico]",
            "description": "[Descrizione dettagliata del beneficio]",
            "icon_name": "heart"
          },
          {
            "title": "[Beneficio 4 specifico]",
            "description": "[Descrizione dettagliata del beneficio]",
            "icon_name": "trending-up"
          }
        ],
        "social_proof": {
          "stats": [
            {"number": "[Numero specifico]", "label": "[Label specifica]"},
            {"number": "[Numero specifico]", "label": "[Label specifica]"},
            {"number": "[Numero specifico]", "label": "[Label specifica]"}
          ],
          "testimonial": "[Testimonianza specifica e credibile]"
        }
      },
      "urgency": {
        "main_title": "[Titolo urgenza specifico]",
        "subtitle": "[Sottotitolo urgenza]",
        "urgency_reasons": [
          {
            "title": "[Motivo urgenza 1]",
            "description": "[Descrizione motivo]",
            "icon_name": "users"
          },
          {
            "title": "[Motivo urgenza 2]",
            "description": "[Descrizione motivo]",
            "icon_name": "flame"
          }
        ],
        "cta_text": "[Call-to-action urgente]",
        "warning_text": "[Testo di avvertimento]"
      },
      "benefits": {
        "section_title": "[Titolo sezione benefici]",
        "main_benefits": [
          {
            "title": "[Beneficio principale 1]",
            "description": "[Descrizione dettagliata]",
            "highlight": "[Metrica/numero]",
            "icon_name": "zap"
          },
          {
            "title": "[Beneficio principale 2]",
            "description": "[Descrizione dettagliata]",
            "highlight": "[Metrica/numero]",
            "icon_name": "trending-up"
          },
          {
            "title": "[Beneficio principale 3]",
            "description": "[Descrizione dettagliata]",
            "highlight": "[Metrica/numero]",
            "icon_name": "shield"
          }
        ],
        "bonus_list": [
          "[Bonus 1 specifico con valore]",
          "[Bonus 2 specifico con valore]",
          "[Bonus 3 specifico con valore]",
          "[Bonus 4 specifico con valore]",
          "[Bonus 5 specifico con valore]",
          "[Bonus 6 specifico con valore]"
        ],
        "total_value": "[Valore totale in euro]",
        "testimonial": {
          "text": "[Testimonianza specifica]",
          "author": "[Nome autore testimonial]"
        }
      }
    },
    "customer_facing": {
      "hero_title": "[Titolo hero]",
      "hero_subtitle": "[Sottotitolo hero]",
      "value_proposition": "[Proposta di valore]",
      "style_theme": "modern",
      "brand_colors": {
        "primary": "#D4AF37",
        "secondary": "#2563EB",
        "accent": "#7C3AED"
      }
    }
  }
}

IMPORTANTE: 
- Assicurati che tutti i contenuti siano specifici per il business dell'utente
- Evita frasi generiche come "migliore soluzione" o "risultati garantiti"
- Usa linguaggio diretto e benefici concreti
- Le domande del form devono essere rilevanti per il tipo di servizio
- I benefici devono essere specifici e misurabili quando possibile`;

    const { data, error } = await supabase.functions.invoke('chatbot-ai', {
      body: { 
        messages: [{ role: 'user', content: enhancedPrompt }],
        sessionId: sessionId 
      },
      headers: {
        'Authorization': `Bearer ${session?.access_token}`
      }
    });

    if (error) throw error;

    return {
      success: data.success,
      message: data.message,
      sessionId: data.sessionId || sessionId,
      error: data.error
    };
  } catch (error) {
    console.error('Error communicating with AI:', error);
    return {
      success: false,
      message: '',
      sessionId: sessionId,
      error: 'Errore nella comunicazione con l\'AI. Riprova.'
    };
  }
};
