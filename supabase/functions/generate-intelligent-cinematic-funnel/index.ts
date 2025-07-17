
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProductContext {
  name: string;
  description?: string;
  industry?: string;
  targetAudience?: string;
  visualStyle?: 'minimal' | 'dynamic' | 'elegant' | 'technical';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productContext } = await req.json();

    console.log('🎬 Generating intelligent cinematic funnel for:', productContext.name);

    const systemPrompt = `Sei un esperto designer di esperienze cinematiche e funnel intelligenti. 
    Crea un funnel cinematico completamente adattivo basato sul contesto del prodotto fornito.
    
    Il funnel deve essere:
    - Visivamente stunning con elementi cinematici
    - Adattivo all'industria e al pubblico target
    - Ottimizzato per le conversioni
    - Emotivamente coinvolgente
    
    Genera contenuti in italiano di alta qualità, professionali ed emotivamente coinvolgenti.`;

    const userPrompt = `Crea un funnel cinematico intelligente per:
    
    Prodotto: ${productContext.name}
    Descrizione: ${productContext.description || 'Non specificata'}
    Industria: ${productContext.industry || 'Generale'}
    Target: ${productContext.targetAudience || 'Generale'}
    Stile: ${productContext.visualStyle || 'dynamic'}
    
    Genera un JSON con questa struttura esatta:
    {
      "success": true,
      "funnelData": {
        "id": "uuid_generato",
        "productContext": <copia_del_context>,
        "globalTheme": {
          "colorScheme": "schema_colori_adattivo",
          "typography": "tipografia_appropriata", 
          "spacing": "modern",
          "animations": "smooth"
        },
        "adaptiveSettings": {
          "deviceOptimizations": {
            "mobile": {"reducedParticles": true, "simplifiedAnimations": true},
            "tablet": {"optimizedTransitions": true},
            "desktop": {"fullEffects": true}
          },
          "performanceMode": "high",
          "accessibilityMode": false,
          "reducedMotion": false
        },
        "analyticsConfig": {
          "trackingEvents": ["scene_view", "interaction", "conversion"],
          "heatmapEnabled": true,
          "conversionGoals": ["lead_capture", "demo_request", "purchase"]
        },
        "scenes": [
          {
            "id": "uuid_scene_1",
            "type": "hero",
            "title": "Titolo_Hero_Accattivante",
            "content": {
              "headline": "Headline_Potente_Emotiva",
              "subheadline": "Sottotitolo_Che_Spiega_Valore",
              "ctaText": "CTA_Irresistibile",
              "urgencyText": "Elemento_Urgenza_Opzionale"
            },
            "cinematicElements": {
              "background": "gradient_cinematico_appropriato",
              "parallaxLayers": [
                {"element": "emoji_o_simbolo", "speed": 0.5, "opacity": 0.6, "scale": 1.2},
                {"element": "emoji_o_simbolo_2", "speed": 0.8, "opacity": 0.4, "scale": 1.0}
              ],
              "particles": {
                "type": "floating",
                "density": 50,
                "color": "rgba(255,255,255,0.1)"
              },
              "lighting": {
                "ambient": "soft-glow",
                "spotlight": "dynamic-focus", 
                "shadows": true
              }
            },
            "transitions": {
              "in": "fade",
              "out": "slide",
              "duration": 800
            },
            "adaptiveRules": {
              "industryModifiers": {"tech": {"addTechElements": true}, "healthcare": {"softerColors": true}},
              "audienceModifiers": {"young": {"vibrantColors": true}, "professional": {"cleanDesign": true}},
              "performanceOptimizations": ["lazyLoad", "preloadAssets"]
            }
          },
          // Aggiungi scene per benefits, social_proof, e conversion seguendo la stessa struttura
        ]
      }
    }`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('🤖 AI Response received, parsing...');

    try {
      // Extract JSON from AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const funnelData = JSON.parse(jsonMatch[0]);
      
      // Validate and enrich the response
      if (!funnelData.funnelData) {
        throw new Error('Invalid funnel data structure');
      }

      // Ensure all required fields are present
      funnelData.funnelData.id = crypto.randomUUID();
      funnelData.funnelData.productContext = productContext;
      
      // Ensure all scenes have unique IDs
      if (funnelData.funnelData.scenes) {
        funnelData.funnelData.scenes.forEach((scene: any) => {
          if (!scene.id) {
            scene.id = crypto.randomUUID();
          }
        });
      }

      console.log('✅ Intelligent cinematic funnel generated successfully');

      return new Response(JSON.stringify(funnelData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (parseError) {
      console.error('❌ Error parsing AI response:', parseError);
      
      // Return fallback funnel
      const fallbackFunnel = createFallbackCinematicFunnel(productContext);
      
      return new Response(JSON.stringify({
        success: true,
        funnelData: fallbackFunnel,
        note: 'Generated using fallback system'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('❌ Error in generate-intelligent-cinematic-funnel:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Failed to generate intelligent cinematic funnel',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function createFallbackCinematicFunnel(productContext: ProductContext) {
  return {
    id: crypto.randomUUID(),
    productContext,
    globalTheme: {
      colorScheme: 'dynamic-gradient',
      typography: 'bold-contemporary',
      spacing: 'modern',
      animations: 'smooth'
    },
    adaptiveSettings: {
      deviceOptimizations: {
        mobile: { reducedParticles: true, simplifiedAnimations: true },
        tablet: { optimizedTransitions: true },
        desktop: { fullEffects: true }
      },
      performanceMode: 'high',
      accessibilityMode: false,
      reducedMotion: false
    },
    analyticsConfig: {
      trackingEvents: ['scene_view', 'interaction', 'conversion'],
      heatmapEnabled: true,
      conversionGoals: ['lead_capture', 'demo_request', 'purchase']
    },
    scenes: [
      {
        id: crypto.randomUUID(),
        type: 'hero',
        title: `Scopri ${productContext.name}`,
        content: {
          headline: `${productContext.name} - Innovazione che Trasforma`,
          subheadline: productContext.description || 'Scopri una nuova dimensione di possibilità',
          ctaText: 'Inizia il Viaggio',
          urgencyText: '🚀 Offerta limitata nel tempo'
        },
        cinematicElements: {
          background: 'hero-dynamic-gradient',
          parallaxLayers: [
            { element: '✨', speed: 0.5, opacity: 0.6, scale: 1.2 },
            { element: '🌟', speed: 0.8, opacity: 0.4, scale: 1.0 },
            { element: '💫', speed: 1.2, opacity: 0.3, scale: 0.8 }
          ],
          particles: {
            type: 'floating',
            density: 50,
            color: 'rgba(255,255,255,0.1)'
          },
          lighting: {
            ambient: 'soft-glow',
            spotlight: 'dynamic-focus',
            shadows: true
          }
        },
        transitions: {
          in: 'fade',
          out: 'slide',
          duration: 800
        },
        adaptiveRules: {
          industryModifiers: {},
          audienceModifiers: {},
          performanceOptimizations: ['lazyLoad', 'preloadAssets']
        }
      },
      {
        id: crypto.randomUUID(),
        type: 'conversion',
        title: 'Trasforma il Tuo Futuro',
        content: {
          headline: 'Pronto per il Cambiamento?',
          subheadline: 'Compila il form per iniziare la tua trasformazione',
          form: {
            title: 'Inizia la Tua Trasformazione',
            fields: [
              { name: 'name', label: 'Nome', type: 'text', required: true },
              { name: 'email', label: 'Email', type: 'email', required: true },
              { name: 'company', label: 'Azienda', type: 'text', required: false }
            ],
            submitText: 'Trasforma il Tuo Business',
            incentive: '🎁 Analisi gratuita inclusa'
          }
        },
        cinematicElements: {
          background: 'conversion-gradient',
          parallaxLayers: [
            { element: '🎯', speed: 0.3, opacity: 0.7, scale: 1.1 },
            { element: '⚡', speed: 0.6, opacity: 0.5, scale: 1.0 }
          ],
          particles: {
            type: 'glow',
            density: 30,
            color: 'rgba(0,255,100,0.1)'
          },
          lighting: {
            ambient: 'warm-glow',
            spotlight: 'focused-beam',
            shadows: false
          }
        },
        transitions: {
          in: 'zoom',
          out: 'fade',
          duration: 1000
        },
        adaptiveRules: {
          industryModifiers: {},
          audienceModifiers: {},
          performanceOptimizations: ['optimizeForm', 'fastSubmission']
        }
      }
    ]
  };
}
