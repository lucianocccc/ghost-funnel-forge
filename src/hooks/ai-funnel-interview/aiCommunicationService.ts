
import { supabase } from '@/integrations/supabase/client';

export const sendMessageToAI = async (
  message: string,
  sessionId: string
): Promise<{ success: boolean; message: string; sessionId: string; error?: string }> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    // Enhanced prompt for legal/commercial professional services - COMPLIANT with Italian Bar regulations
    const enhancedPrompt = `${message}

SETTORE SPECIALIZZATO: STUDI LEGALI E CONSULENTI COMMERCIALI IN ITALIA

CONFORMITÀ NORMATIVA OBBLIGATORIA:
- RISPETTO del Codice Deontologico Forense (CNF) - Articoli 17-19
- NO promesse di risultati specifici o percentuali di successo
- NO confronti diretti con altri professionisti
- NO sollecitazione diretta della clientela (captazione vietata)
- SOLO informazioni veritiere, verificabili e decorose
- GDPR compliance per dati sensibili e segreto professionale

APPROCCIO CONVERSAZIONALE SPECIALIZZATO:
- Fai UNA domanda mirata per identificare l'area legale/commerciale specifica
- Determina il target (PMI, privati, grandi aziende)
- Scopri le esigenze legali specifiche del potenziale cliente
- Identifica il tipo di consulenza (urgente, pianificata, specialistica)
- Rispetta sempre il decoro e la dignità professionale

QUANDO HAI INFORMAZIONI SUFFICIENTI, genera UN funnel CONFORME usando STEP APPROPRIATI:

TIPI DI STEP CONFORMI per STUDI LEGALI/COMMERCIALI:
- "legal_assessment" → Valutazione preliminare caso/situazione legale
- "qualification" → Verifica competenza e compatibilità
- "information_request" → Richiesta informazioni per valutazione
- "calendar_booking" → Prenotazione consulenza/appuntamento
- "document_upload" → Upload documentazione preliminare (sicuro)
- "urgency_evaluation" → Valutazione tempistiche e urgenza
- "expertise_matching" → Matching con area di specializzazione
- "form" → Solo per dati di contatto e informazioni base

ESEMPI CONFORMI PER SETTORE LEGALE:

DIRITTO CIVILE/CONTRATTUALE:
Step 1: legal_assessment tipo controversia (radio: contrattuale, responsabilità, etc.)
Step 2: qualification valore causa e urgenza (select range, radio tempistiche)
Step 3: information_request dettagli specifici (textarea situazione, checkbox documenti)
Step 4: calendar_booking consulenza preliminare

DIRITTO SOCIETARIO:
Step 1: expertise_matching tipo operazione (select: costituzione, M&A, compliance)
Step 2: qualification dimensione azienda (radio: startup, PMI, grande impresa)
Step 3: urgency_evaluation scadenze normative (checkbox adempimenti, date)
Step 4: document_upload documentazione esistente

DIRITTO DEL LAVORO:
Step 1: legal_assessment tipo problematica (radio: licenziamento, mobbing, contratti)
Step 2: qualification ruolo lavoratore (select: dipendente, dirigente, consulente)
Step 3: urgency_evaluation tempistiche procedurali (radio urgenza, checkbox documentazione)
Step 4: calendar_booking consulenza strategica

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
        "title": "Titolo professionale problema legale specifico",
        "subtitle": "Sottotitolo informativo e rassicurante",
        "value_proposition": "Esperienza e competenza specifica (NO promesse risultati)",
        "cta_text": "CTA per informazioni/consulenza"
      },
      "legal_compliance": {
        "privacy_gdpr": "Clausole privacy conformi al segreto professionale",
        "professional_disclaimer": "Disclaimer responsabilità professionale",
        "data_protection": "Protezione dati sensibili e riservati"
      },
      "trust_elements": {
        "professional_credentials": "Titoli, specializzazioni, anni esperienza",
        "areas_expertise": "Aree di competenza specifiche",
        "contact_transparency": "Orari, modalità contatto, sede"
      }
    },
    "customer_facing": {
      "hero_title": "Titolo informativo orientato al problema legale",
      "hero_subtitle": "Sottotitolo professionale e rassicurante",
      "value_proposition": "Competenza e esperienza specifica (decorosa)",
      "style_theme": "professional|trustworthy|institutional"
    }
  }
}

REGOLE CRITICHE CONFORMITÀ DEONTOLOGICA:
1. SEMPRE rispettare il decoro e la dignità professionale
2. NON promettere risultati specifici o percentuali di successo
3. NON fare confronti con altri professionisti
4. INCLUDERE sempre disclaimer e privacy policy conformi
5. Usare linguaggio professionale, mai sensazionalistico
6. GDPR compliance per tutti i dati raccolti
7. Verificare che ogni step rispetti il Codice Deontologico Forense

COMPLIANCE CHECK: Prima di generare, verifica che:
- Il linguaggio sia professionale e decoroso
- Non ci siano promesse di risultati
- Le informazioni siano veritiere e verificabili
- La privacy sia protetta secondo standard professionali
- Il funnel informi senza captare clientela

Ricorda: L'obiettivo è informare potenziali clienti nel rispetto delle norme deontologiche, NON fare marketing aggressivo.`;

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
