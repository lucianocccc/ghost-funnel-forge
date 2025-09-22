import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🏛️ Legal Funnel Generator: Starting generation...');
    
    const { 
      studioType, 
      servizi, 
      targetAudience, 
      budgetMedio, 
      urgenza, 
      nomeStudio, 
      citta, 
      specializzazioni,
      anni_esperienza,
      userId,
      compliance_guidelines 
    } = await req.json();

    console.log('📋 Request parameters:', {
      studioType,
      nomeStudio,
      citta,
      targetAudience,
      servizi: servizi?.length || 0
    });

    // Prompt specializzato per studi legali con conformità deontologica
    const legalPrompt = `
GENERAZIONE FUNNEL LEGALE PROFESSIONALE - CONFORMITÀ DEONTOLOGICA OBBLIGATORIA

STUDIO: ${nomeStudio} - ${citta}
SPECIALIZZAZIONE: ${studioType}
SERVIZI: ${servizi?.join(', ')}
TARGET: ${targetAudience}
ESPERIENZA: ${anni_esperienza} anni
BUDGET MEDIO: ${budgetMedio}
URGENZA CASI: ${urgenza}

${compliance_guidelines}

REQUISITI TECNICI OBBLIGATORI:
1. HTML completo responsive con CSS inline
2. Conformità totale al Codice Deontologico Forense
3. Linguaggio professionale e decoroso
4. Nessuna promessa di risultati
5. Disclaimer professionale obbligatorio
6. Informativa privacy GDPR per settore legale
7. Trasparenza sui titoli e competenze

STRUTTURA FUNNEL RICHIESTA:
1. HERO SECTION: Presentazione professionale dello studio
2. LEGAL ASSESSMENT: Valutazione preliminare del caso
3. DOCUMENT UPLOAD: Caricamento documenti (se necessario)
4. CALENDAR BOOKING: Prenotazione consulenza
5. CONTACT FORM: Richiesta informazioni

ELEMENTI OBBLIGATORI:
- Intestazione con nome studio e specializzazione
- Disclaimer responsabilità professionale visibile
- Link informativa privacy conforme GDPR
- Trasparenza su titoli e iscrizioni ordine
- Modalità di contatto chiare
- Orari ricevimento
- Fasi procedura trasparenti

TONO E LINGUAGGIO:
- Professionale e misurato
- Informativo ma non promozionale aggressivo
- Veritiero e verificabile
- Rispettoso della dignità professionale
- Conforme al segreto professionale

DIVIETI ASSOLUTI:
- NO promesse di vittoria o risultati garantiti
- NO percentuali di successo
- NO confronti con altri studi
- NO linguaggio sensazionalistico
- NO sollecitazione aggressiva clienti
- NO testimonial identificabili

COLORI PROFESSIONALI:
- Blu navy (#1e3a8a) - autorevolezza
- Oro elegante (#b45309) - prestigio
- Grigio antracite (#374151) - professionalità
- Bianco (#ffffff) - trasparenza

Genera un funnel HTML completo, professionale e conforme al Codice Deontologico Forense.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Modello stabile e potente
        messages: [
          {
            role: 'system',
            content: `Sei un esperto specializzato nella creazione di funnel per studi legali e commerciali, con profonda conoscenza del Codice Deontologico Forense italiano. 

COMPETENZE:
- Normative marketing studi legali
- Codice Deontologico Forense
- Conformità GDPR settore legale
- Web design professionale
- UX/UI per servizi legali
- Copywriting professionale legale

Genera SEMPRE contenuti conformi alle normative deontologiche, evitando linguaggio promozionale aggressivo e garantendo massima trasparenza professionale.`
          },
          {
            role: 'user',
            content: legalPrompt
          }
        ],
        max_completion_tokens: 4000,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ OpenAI API Error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('💥 Invalid AI response structure:', data);
      throw new Error('Risposta AI malformata');
    }
    
    const generatedContent = data.choices[0].message.content;

    console.log('✅ Content generated, length:', generatedContent.length);
    
    if (!generatedContent || generatedContent.length < 100) {
      console.error('💥 Generated content too short:', generatedContent.length);
      throw new Error('Contenuto generato insufficiente');
    }

    // Estrai HTML dal contenuto generato
    const htmlMatch = generatedContent.match(/```html\n([\s\S]*?)\n```/) || 
                     generatedContent.match(/<!DOCTYPE html>[\s\S]*<\/html>/i);
    let htmlContent = htmlMatch ? (htmlMatch[1] || htmlMatch[0]) : generatedContent;
    
    // Validazione contenuto HTML minimo
    if (!htmlContent.includes('<html') || htmlContent.length < 500) {
      console.error('💥 Invalid HTML content generated');
      throw new Error('HTML generato non valido o troppo breve');
    }

    // Struttura funnel legale specializzata
    const legalFunnelStructure = {
      funnel_structure: {
        sections: [
          {
            type: 'hero',
            title: `${nomeStudio} - ${studioType.charAt(0).toUpperCase() + studioType.slice(1)}`,
            content: `Studio legale specializzato in ${studioType} a ${citta}`
          },
          {
            type: 'legal_assessment',
            title: 'Valutazione del Caso',
            content: 'Descrivi brevemente la tua situazione legale'
          },
          {
            type: 'expertise',
            title: 'La Nostra Esperienza',
            content: `${anni_esperienza} anni di esperienza in ${servizi?.join(', ')}`
          },
          {
            type: 'calendar_booking',
            title: 'Prenota Consulenza',
            content: 'Seleziona data e ora per una consulenza professionale'
          },
          {
            type: 'contact_form',
            title: 'Richiedi Informazioni',
            content: 'I nostri esperti ti ricontatteranno entro 24 ore'
          }
        ]
      }
    };

    // Elementi legali obbligatori - Struttura per compliance validator
    const legalElements = {
      disclaimer: "Le informazioni fornite non costituiscono consulenza legale. Per questioni specifiche è necessaria una consulenza personalizzata presso il nostro studio.",
      privacy_policy: "I dati personali sono trattati nel rispetto del segreto professionale e della normativa privacy vigente (GDPR UE 679/2016).",
      gdpr_consent: "Acconsento al trattamento dei miei dati personali per finalità di contatto professionale, nel rispetto del segreto professionale.",
      professional_credentials: `Studio legale ${nomeStudio} - Iscrizione Ordine Avvocati di ${citta} - ${anni_esperienza} anni di esperienza professionale`
    };

    // Struttura settings per compliance validator
    const complianceSettings = {
      legal_compliance: {
        privacy_gdpr: "Informativa privacy conforme al segreto professionale e GDPR",
        professional_disclaimer: "Le informazioni fornite non costituiscono consulenza legale. Per questioni specifiche è necessaria una consulenza personalizzata presso il nostro studio.",
        data_protection: "I dati personali sono trattati nel rispetto del segreto professionale e della normativa privacy vigente."
      },
      trust_elements: {
        professional_credentials: `Studio legale ${nomeStudio} - Iscrizione Ordine Avvocati di ${citta} - ${anni_esperienza} anni di esperienza professionale`,
        contact_transparency: "Orari di ricevimento e modalità di contatto disponibili sul sito",
        areas_expertise: servizi?.join(', ') || studioType
      }
    };

    // Tema visivo professionale
    const visualTheme = {
      primary_color: '#1e3a8a', // Blu navy professionale
      secondary_color: '#b45309', // Oro elegante
      font_family: 'Georgia, serif', // Font elegante e leggibile
      layout_style: 'professional-legal'
    };

    const result = {
      success: true,
      funnel: {
        id: crypto.randomUUID(),
        name: `Funnel Legale - ${nomeStudio}`,
        description: `Funnel professionale per studio ${studioType} specializzato in ${servizi?.slice(0, 2).join(', ')}`,
        html_content: htmlContent,
        funnel_structure: legalFunnelStructure,
        legal_elements: legalElements,
        visual_theme: visualTheme,
        settings: complianceSettings, // Aggiunto per compliance validator
        studio_info: {
          nome: nomeStudio,
          citta,
          tipo: studioType,
          servizi,
          target: targetAudience,
          esperienza: anni_esperienza
        }
      }
    };

    console.log('🎉 Legal funnel generated successfully:', {
      studioName: nomeStudio,
      htmlLength: htmlContent.length,
      sections: legalFunnelStructure.funnel_structure.sections.length
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Legal funnel generation error:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto nella generazione del funnel legale'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});