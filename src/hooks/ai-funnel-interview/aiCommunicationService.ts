
import { supabase } from '@/integrations/supabase/client';

export const sendMessageToAI = async (
  message: string,
  sessionId: string
): Promise<{ success: boolean; message: string; sessionId: string; error?: string }> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    // Enhanced creative prompt for truly personalized funnels
    const enhancedPrompt = `${message}

OBIETTIVO: Crea funnel COMPLETAMENTE PERSONALIZZATI usando diverse tipologie di step e logiche specifiche per settore.

APPROCCIO CONVERSAZIONALE AVANZATO:
- Fai UNA domanda mirata alla volta per scoprire il business
- Identifica il SETTORE specifico (e-commerce, consulenza, SaaS, salute, immobiliare, etc.)
- Scopri la PSICOLOGIA del target (pain points, desideri, obiezioni)
- Determina il TIPO DI VENDITA (transazionale, consultiva, complessa)
- Analizza il CUSTOMER JOURNEY specifico

QUANDO HAI INFORMAZIONI SUFFICIENTI, genera UN funnel usando STEP DIVERSIFICATI:

TIPI DI STEP DISPONIBILI (non usare sempre "form"):
- "quiz" → Product discovery, segmentazione, personalizzazione
- "assessment" → Valutazione esigenze, problemi, situazione
- "calculator" → Budget, ROI, dimensionamento, pricing
- "demo_request" → Per software, servizi premium, B2B
- "calendar_booking" → Consulenze, appuntamenti, demo
- "social_proof" → Testimonial interattive, case studies
- "urgency_builder" → Scarcity, limited time offers
- "product_showcase" → Features, benefici, comparazioni
- "qualification" → Verifica fit cliente-servizio
- "discovery" → Raccolta esigenze, exploration
- "form" → Solo come step finale per dati completi

ESEMPI CREATIVI PER SETTORE:

E-COMMERCE MODA:
Step 1: quiz stile personale (radio buttons stili, checkbox occasioni)
Step 2: calculator budget + preferenze (range prezzo, slider qualità)
Step 3: product_showcase personalizzato (basato su quiz)
Step 4: urgency_builder (stock limitato per stile selezionato)

CONSULENZA BUSINESS:
Step 1: assessment situazione aziendale (scale problemi, textarea sfide)
Step 2: qualification budget/timeline (select range, radio urgenza)
Step 3: social_proof case studies settore (checkbox settori interesse)
Step 4: calendar_booking consulenza strategica

SaaS/SOFTWARE:
Step 1: demo_request con profilazione (select ruolo, number team size)
Step 2: feature_selection priority (checkbox features, drag&drop)
Step 3: qualification technical fit (select current tools, radio experience)
Step 4: trial_signup con onboarding path

STRUTTURA JSON RICHIESTA:

{
  "name": "Nome funnel specifico e magnetico",
  "description": "Descrizione dettagliata del valore e processo",
  "steps": [
    {
      "step_order": 1,
      "step_type": "quiz|assessment|calculator|demo_request|calendar_booking|etc",
      "title": "Titolo step coinvolgente e specifico",
      "description": "Spiegazione valore dello step per l'utente",
      "fields_config": [
        {
          "type": "radio|checkbox|select|scale|textarea|number|text|email|tel",
          "name": "nome_campo_meaningful",
          "label": "Label specifica per business e target",
          "required": true|false,
          "placeholder": "Placeholder helpful quando applicabile",
          "options": ["opzioni", "specifiche", "settore"], // per radio/checkbox/select
          "min": 1, "max": 10 // per scale/number
        }
      ],
      "settings": {
        "submitButtonText": "CTA specifica step (NON generica)",
        "description": "Testo motivazionale sotto form",
        "validation_rules": "regole specifiche se necessarie"
      }
    }
  ],
  "settings": {
    "productSpecific": true,
    "focusType": "consultative|sales|discovery|qualification",
    "product_name": "Nome prodotto/servizio specifico",
    "industry": "settore identificato",
    "target_psychology": "psicologia target audience",
    "personalizedSections": {
      "hero": {
        "title": "Titolo magnetico problema/desiderio specifico",
        "subtitle": "Sottotitolo value proposition amplificata",
        "value_proposition": "Proposta valore unica differenziante",
        "cta_text": "CTA specifica prima azione"
      },
      "conversion_strategy": {
        "primary_emotion": "emozione principale da attivare",
        "objection_handling": ["obiezione1", "obiezione2", "obiezione3"],
        "urgency_mechanism": "tipo urgency naturale per business"
      }
    },
    "customer_facing": {
      "hero_title": "Titolo pubblico orientato beneficio cliente",
      "hero_subtitle": "Sottotitolo risoluzione problema specifico",
      "value_proposition": "Value proposition customer-facing",
      "style_theme": "modern|professional|creative|trustworthy"
    }
  }
}

REGOLE CRITICHE:
1. NON usare mai solo step "form" - diversifica SEMPRE
2. Crea step SPECIFICI per il settore e business
3. Personalizza OGNI campo, label, opzione per il contesto
4. Usa psicologia appropriata al target
5. Step devono avere scopo strategico preciso nel customer journey

Ricorda: L'obiettivo è creare funnel che si sentono costruiti specificamente per quel business, non template generici con nomi cambiati.`;

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
