import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  prompt: string;
  userId: string;
  saveToLibrary?: boolean;
  funnelTypeId?: string;
  mode?: 'standard' | 'interactive'; // Add mode parameter for interactive TSX generation
  customerProfile?: {
    businessInfo?: {
      name: string;
      industry: string;
      targetAudience: string;
      keyBenefits: string[];
    };
    psychographics?: {
      painPoints: string[];
      motivations: string[];
      preferredTone: string;
      communicationStyle: string;
    };
    behavioralData?: {
      engagementLevel: number;
      conversionIntent: number;
      informationGatheringStyle: string;
    };
    conversionStrategy?: {
      primaryGoal: string;
      secondaryGoals: string[];
      keyMessages: string[];
    };
  };
}

// Helper function to generate a hex token equivalent to encode(gen_random_bytes(32), 'hex')
function generateHexToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { prompt, userId, saveToLibrary = true, funnelTypeId, customerProfile, mode = 'standard' }: RequestBody = await req.json();

    console.log('🚀 Starting AI funnel generation:', {
      promptLength: prompt.length,
      userId,
      funnelTypeId: funnelTypeId || 'custom',
      mode: mode || 'standard'
    });

    // Get funnel type if specified
    let funnelType = null;
    if (funnelTypeId) {
      const { data: typeData, error: typeError } = await supabase
        .from('funnel_types')
        .select('*')
        .eq('id', funnelTypeId)
        .single();

      if (typeError) {
        console.error('Error fetching funnel type:', typeError);
      } else {
        funnelType = typeData;
      }
    }

    // Prepare personalized AI prompt
    let systemPrompt = `Sei un esperto di marketing digitale e funnel conversion. Genera un funnel interattivo dettagliato e PERSONALIZZATO basato sulla richiesta dell'utente e sul profilo cliente fornito.

IMPORTANTE: Rispondi SOLO con un JSON valido senza testo aggiuntivo.

Il JSON deve avere questa struttura:
{
  "name": "Nome del funnel",
  "description": "Descrizione dettagliata",
  "settings": {
    "theme": "modern",
    "primaryColor": "#3B82F6",
    "showProgressBar": true
  },
  "steps": [
    {
      "title": "Titolo step",
      "description": "Descrizione step", 
      "step_type": "lead_capture|qualification|discovery|conversion|contact_form|thank_you",
      "step_order": 1,
      "is_required": true,
      "fields_config": {
        "fields": [
          {
            "type": "text|email|tel|select|textarea|checkbox|radio",
            "name": "field_name",
            "label": "Etichetta campo",
            "placeholder": "Placeholder",
            "required": true,
            "options": ["opzione1", "opzione2"] // solo per select/radio
          }
        ]
      },
      "settings": {
        "buttonText": "Continua",
        "showProgress": true
      }
    }
  ]
}

Tipi di step disponibili:
- lead_capture: Cattura lead iniziale
- qualification: Qualificazione prospect  
- discovery: Scoperta esigenze
- conversion: Conversione finale
- contact_form: Modulo contatti
- thank_you: Pagina ringraziamento

Crea un funnel ottimizzato per massimizzare conversioni con 3-5 step strategici.`;

    // Add customer profile personalization
    if (customerProfile) {
      systemPrompt += '\n\n=== DATI CLIENTE PER PERSONALIZZAZIONE ===\n';
      
      if (customerProfile.businessInfo) {
        systemPrompt += `
BUSINESS INFO:
- Nome: ${customerProfile.businessInfo.name}
- Settore: ${customerProfile.businessInfo.industry}
- Target: ${customerProfile.businessInfo.targetAudience}
- Benefici chiave: ${customerProfile.businessInfo.keyBenefits.join(', ')}`;
      }
      
      if (customerProfile.psychographics) {
        systemPrompt += `
PSICOGRAFIA CLIENTE:
- Pain points: ${customerProfile.psychographics.painPoints.join(', ')}
- Motivazioni: ${customerProfile.psychographics.motivations.join(', ')}
- Tono preferito: ${customerProfile.psychographics.preferredTone}
- Stile comunicazione: ${customerProfile.psychographics.communicationStyle}`;
      }
      
      if (customerProfile.behavioralData) {
        systemPrompt += `
DATI COMPORTAMENTALI:
- Livello engagement: ${customerProfile.behavioralData.engagementLevel}/10
- Intenzione conversione: ${customerProfile.behavioralData.conversionIntent}/10
- Stile raccolta info: ${customerProfile.behavioralData.informationGatheringStyle}`;
      }
      
      if (customerProfile.conversionStrategy) {
        systemPrompt += `
STRATEGIA CONVERSIONE:
- Obiettivo primario: ${customerProfile.conversionStrategy.primaryGoal}
- Obiettivi secondari: ${customerProfile.conversionStrategy.secondaryGoals.join(', ')}
- Messaggi chiave: ${customerProfile.conversionStrategy.keyMessages.join(', ')}`;
      }
      
      systemPrompt += `

ISTRUZIONI PERSONALIZZAZIONE:
1. Usa il tono e stile comunicazione specificato nel profilo
2. Concentrati sui pain points identificati 
3. Incorpora i benefici chiave del business
4. Adatta la complessità al livello di engagement
5. Usa i messaggi chiave nella strategia di conversione
6. Crea domande specifiche per il settore e target audience
7. Personalizza i placeholder e le etichette in base al contesto business`;
    }

    // Add funnel type specific guidance
    if (funnelType) {
      systemPrompt += `\n\nTipo di funnel richiesto: ${funnelType.name}
Categoria: ${funnelType.category}
Descrizione: ${funnelType.description}
Settore: ${funnelType.industry || 'generale'}
Target: ${funnelType.target_audience || 'generale'}

Usa queste informazioni per personalizzare il funnel.`;

      if (funnelType.ai_prompts?.system_prompt) {
        systemPrompt += `\n\nGuida specifica: ${funnelType.ai_prompts.system_prompt}`;
      }
    }

    // Multi-AI Orchestration for Interactive Mode
    if (mode === 'interactive' && perplexityApiKey && anthropicApiKey) {
      console.log('🧠 Starting Multi-AI Orchestration for Interactive TSX Generation');

      // Step 1: Perplexity - Market Analysis
      console.log('🌍 Step 1: Market Analysis with Perplexity');
      const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: `Sei un analista di mercato esperto. Analizza il seguente prompt e fornisci un'analisi dettagliata del mercato, target audience, competitors e trends attuali. Rispondi in JSON con questa struttura:
{
  "target_analysis": {
    "primary_audience": "Chi è il cliente ideale?",
    "demographics": "Dati demografici",
    "psychographics": "Motivazioni e paure",
    "pain_points": ["problema1", "problema2", "problema3"]
  },
  "market_insights": {
    "market_size": "Dimensione del mercato",
    "growth_trends": "Tendenze di crescita",
    "key_opportunities": ["opportunità1", "opportunità2"],
    "seasonal_factors": "Fattori stagionali"
  },
  "competitor_analysis": {
    "main_competitors": ["competitor1", "competitor2"],
    "competitive_advantages": ["vantaggio1", "vantaggio2"],
    "market_gaps": ["gap1", "gap2"]
  },
  "conversion_triggers": {
    "urgency_factors": ["urgenza1", "urgenza2"],
    "trust_signals": ["trust1", "trust2"],
    "value_propositions": ["valore1", "valore2"]
  }
}`
            },
            {
              role: 'user',
              content: `Analizza questo business/prodotto per creare un funnel di conversione ottimale: ${prompt}

Considera anche questi dati se disponibili:
${customerProfile?.businessInfo ? `Business: ${customerProfile.businessInfo.name} - ${customerProfile.businessInfo.industry}` : ''}
${customerProfile?.businessInfo?.targetAudience ? `Target: ${customerProfile.businessInfo.targetAudience}` : ''}
`
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        }),
      });

      if (!perplexityResponse.ok) {
        console.error('❌ Perplexity API error:', perplexityResponse.status);
        // Fallback to standard mode if Perplexity fails
      } else {
        const perplexityData = await perplexityResponse.json();
        const marketAnalysis = JSON.parse(perplexityData.choices[0].message.content);
        
        console.log('✅ Market analysis complete');

        // Step 2: Claude - Storytelling and Design
        console.log('🎨 Step 2: Storytelling and Design with Claude');
        const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${anthropicApiKey}`,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 3000,
            messages: [
              {
                role: 'user',
                content: `Sei un esperto di UX/UI design e copywriting. Basandoti su questa analisi di mercato, crea il design e storytelling per un funnel interattivo:

ANALISI DI MERCATO:
${JSON.stringify(marketAnalysis, null, 2)}

PROMPT ORIGINALE: ${prompt}

Crea una strategia di design e copy che risponda in JSON con questa struttura:
{
  "storytelling_strategy": {
    "main_narrative": "Storia principale che guida il funnel",
    "emotional_hooks": ["hook1", "hook2", "hook3"],
    "progression_arc": "Come evolve la storia attraverso gli step"
  },
  "design_system": {
    "color_palette": {
      "primary": "#HEX",
      "secondary": "#HEX", 
      "accent": "#HEX",
      "background": "#HEX",
      "text": "#HEX"
    },
    "typography": {
      "heading_font": "Font per titoli",
      "body_font": "Font per testo",
      "font_sizes": {
        "h1": "dimensione",
        "h2": "dimensione",
        "body": "dimensione"
      }
    },
    "visual_style": "Stile visivo (moderne, minimalista, bold, etc.)"
  },
  "copy_strategy": {
    "tone_of_voice": "Tono da usare",
    "key_messages": ["messaggio1", "messaggio2"],
    "cta_style": "Stile delle call-to-action",
    "urgency_language": "Come creare urgenza"
  },
  "funnel_flow": {
    "step1": {
      "goal": "Obiettivo dello step",
      "headline": "Titolo catchy",
      "subheadline": "Sottotitolo",
      "copy": "Testo principale",
      "cta": "Call to action"
    },
    "step2": {
      "goal": "Obiettivo dello step",
      "headline": "Titolo",
      "copy": "Testo principale",
      "cta": "Call to action"  
    },
    "step3": {
      "goal": "Obiettivo dello step",
      "headline": "Titolo",
      "copy": "Testo principale",
      "cta": "Call to action"
    }
  }
}`
              }
            ]
          }),
        });

        if (!claudeResponse.ok) {
          console.error('❌ Claude API error:', claudeResponse.status);
          // Fallback to standard mode if Claude fails  
        } else {
          const claudeData = await claudeResponse.json();
          const designStrategy = JSON.parse(claudeData.content[0].text);
          
          console.log('✅ Design and storytelling complete');

          // Step 3: GPT - Generate Interactive TSX Component
          console.log('⚛️ Step 3: Generating Interactive TSX with ChatGPT');
          const tsxPrompt = `Sei un esperto React/TypeScript developer. Genera un componente .tsx completo e funzionante per un funnel interattivo basato su queste specifiche:

ANALISI DI MERCATO:
${JSON.stringify(marketAnalysis, null, 2)}

STRATEGIA DESIGN E COPY:
${JSON.stringify(designStrategy, null, 2)}

PROMPT ORIGINALE: ${prompt}

GENERA UN COMPONENTE TSX COMPLETO CON:
1. Import di React, useState, useEffect
2. Import di componenti Shadcn/ui: Button, Input, Card, Progress
3. Import di icone Lucide React
4. Tailwind CSS per styling
5. Framer Motion per animazioni
6. Logica di stato per navigazione tra step
7. Validazione form
8. Responsive design
9. Accessibilità

Il componente deve:
- Essere completamente self-contained
- Avere 3-4 step di funnel
- Includere il design system definito da Claude
- Usare il copy e storytelling di Claude
- Implementare la logica basata sull'analisi di mercato
- Essere pronto per l'uso in Ghost Funnel

RISPOSTA: SOLO IL CODICE TSX, senza spiegazioni o markdown. Il file deve iniziare con gli import e finire con export default.`;

          const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openAIApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o',
              messages: [
                { role: 'system', content: 'Sei un esperto React developer. Genera SOLO codice TSX funzionante, senza spiegazioni.' },
                { role: 'user', content: tsxPrompt }
              ],
              temperature: 0.4,
              max_tokens: 4000
            }),
          });

          if (!gptResponse.ok) {
            console.error('❌ GPT API error:', gptResponse.status);
            // Fallback to standard mode if GPT fails
          } else {
            const gptData = await gptResponse.json();
            const tsxContent = gptData.choices[0].message.content;

            console.log('✅ Interactive TSX component generated');

            // Return the interactive TSX component
            return new Response(JSON.stringify({
              success: true,
              mode: 'interactive',
              component: {
                tsx: tsxContent,
                metadata: {
                  marketAnalysis,
                  designStrategy,
                  generatedAt: new Date().toISOString()
                }
              },
              funnel: {
                name: designStrategy.funnel_flow?.step1?.headline || 'Interactive Funnel',
                description: designStrategy.storytelling_strategy?.main_narrative || prompt,
                mode: 'interactive',
                component_code: tsxContent
              }
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
      }
    }

    // Standard mode or fallback - existing logic
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    const generatedContent = openAIData.choices[0].message.content;

    console.log('🤖 AI generated content length:', generatedContent.length);

    // Parse AI response
    let funnelData;
    try {
      // Clean up response - remove code blocks if present
      const cleanContent = generatedContent.replace(/```json\n?|\n?```/g, '').trim();
      funnelData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.log('Raw content:', generatedContent);
      throw new Error('Invalid JSON response from AI');
    }

    // Validate required fields
    if (!funnelData.name || !funnelData.steps || !Array.isArray(funnelData.steps)) {
      throw new Error('Invalid funnel data structure');
    }

    // Ensure steps have proper order
    funnelData.steps.forEach((step: any, index: number) => {
      step.step_order = index + 1;
    });

    console.log('✅ Generated funnel:', {
      name: funnelData.name,
      stepsCount: funnelData.steps.length
    });

    // Save to database if requested
    if (saveToLibrary) {
      try {
        // Generate a proper hex token that matches database format and client validation
        const shareToken = generateHexToken();
        
        // Create the funnel with the correctly formatted share token
        const { data: funnel, error: funnelError } = await supabase
          .from('interactive_funnels')
          .insert({
            name: funnelData.name,
            description: funnelData.description,
            settings: funnelData.settings || {},
            created_by: userId,
            status: 'active',
            is_public: true,
            share_token: shareToken
          })
          .select()
          .single();

        if (funnelError) {
          console.error('❌ Error creating funnel:', funnelError);
          throw funnelError;
        }

        console.log('📝 Created funnel:', funnel.id, 'with share token:', shareToken);

        // Create steps
        const stepsToInsert = funnelData.steps.map((step: any) => ({
          funnel_id: funnel.id,
          title: step.title,
          description: step.description || '',
          step_type: step.step_type,
          step_order: step.step_order,
          fields_config: step.fields_config || {},
          settings: step.settings || {},
          is_required: step.is_required !== false
        }));

        const { data: steps, error: stepsError } = await supabase
          .from('interactive_funnel_steps')
          .insert(stepsToInsert)
          .select();

        if (stepsError) {
          console.error('❌ Error creating steps:', stepsError);
          throw stepsError;
        }

        console.log('📋 Created steps:', steps.length);

        // Return complete funnel with steps
        const completeData = {
          ...funnel,
          steps: steps,
          funnel_type: funnelType
        };

        return new Response(JSON.stringify({
          success: true,
          funnel: completeData
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (dbError) {
        console.error('❌ Database error:', dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }
    } else {
      // Return funnel data without saving
      return new Response(JSON.stringify({
        success: true,
        funnel: funnelData
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('❌ Error in generate-interactive-funnel-ai:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Errore interno del server'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
