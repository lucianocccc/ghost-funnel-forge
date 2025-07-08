import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Import refactored modules
import { ProductFunnelRequest, CinematicFunnelParams, ErrorDetails } from './types.ts';
import { 
  validateOpenAIApiKey, 
  testOpenAIConnectivity, 
  generateRequestId, 
  withTimeout, 
  finalizeScenes, 
  optimizeImagePrompt 
} from './utils.ts';
import { generateFallbackImageUrl } from './image-utils.ts';
import { generateSceneStructureWithRetry, generateSceneStructure } from './scene-generator.ts';
import { createFallbackScenes } from './fallback-scenes.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const requestId = generateRequestId();

  try {
    console.log(`🎬 [${requestId}] Funnel generation request started`);
    
    // Validate OpenAI API key
    const keyValidation = validateOpenAIApiKey(openAIApiKey);
    if (!keyValidation.isValid) {
      console.error(`❌ [${requestId}] ${keyValidation.error}`);
      return new Response(JSON.stringify({
        success: false,
        error: keyValidation.error,
        requestId,
        debug: {
          timestamp: new Date().toISOString(),
          environmentCheck: keyValidation.error
        }
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`✅ [${requestId}] OpenAI API key validated successfully`);

    const { productName, productDescription, targetAudience, industry, funnelType = 'standard', generateImages = false }: ProductFunnelRequest = await req.json();

    console.log('Generating dynamic funnel for product:', productName);
    console.log('Input parameters:', { productName, productDescription, targetAudience, industry, funnelType, generateImages });

    // Handle cinematic funnel generation
    if (funnelType === 'cinematic') {
      return await generateCinematicFunnel({
        productName,
        productDescription,
        targetAudience,
        industry,
        generateImages,
        openAIApiKey
      });
    }

    // First, generate a custom image for the product
    console.log('Generating custom image for product...');
    let productImageUrl = null;
    
    try {
      let imagePrompt = '';
      
      // Create HIGHLY SPECIFIC and CREATIVE prompts based on product type
      if (productName.toLowerCase().includes('mirtill') || productName.toLowerCase().includes('berry')) {
        imagePrompt = `Ultra-realistic macro photography of fresh, vibrant blueberries falling through the air in slow motion, water droplets glistening, deep purple and blue colors, dramatic lighting creating a cascade effect, crystal clear detail, professional food photography, dark background with purple gradient lighting, 8K ultra high resolution`;
      } else if (productName.toLowerCase().includes('pane') || productName.toLowerCase().includes('bread')) {
        imagePrompt = `Artisanal bread photography with flour particles floating in warm golden light, rustic wooden surface, steam rising, golden-brown crust texture in extreme detail, cozy bakery atmosphere, warm amber lighting, ultra-realistic texture, professional food styling, 8K resolution`;
      } else if (productName.toLowerCase().includes('latte') || productName.toLowerCase().includes('milk')) {
        imagePrompt = `Ultra-realistic milk splash photography, white liquid in motion against clean white background, droplets frozen in mid-air, pristine glass container, studio lighting creating perfect reflections, hyper-detailed texture, commercial dairy photography, 8K resolution`;
      } else if (productName.toLowerCase().includes('yoga') || productName.toLowerCase().includes('fitness')) {
        imagePrompt = `Serene yoga studio environment with soft natural lighting, people practicing yoga in the background (blurred), zen atmosphere, bamboo plants, meditation cushions, warm golden hour lighting streaming through large windows, peaceful and inspiring, architectural photography style, 8K resolution`;
      } else if (productName.toLowerCase().includes('caffè') || productName.toLowerCase().includes('coffee')) {
        imagePrompt = `Steam rising from fresh coffee beans, aromatic vapor trails, dark roasted beans scattered on rustic wooden surface, warm amber lighting, ultra-realistic texture and steam effects, cozy coffee shop atmosphere, professional beverage photography, 8K resolution`;
      } else {
        imagePrompt = `Professional lifestyle photography of ${productName}, ${productDescription || 'premium quality product'}, elegant presentation, natural lighting, ultra-realistic detail, sophisticated commercial photography style, 8K resolution`;
      }
      
      const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: imagePrompt,
          n: 1,
          size: '1024x1024',
          quality: 'hd',
        }),
      });

      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        productImageUrl = imageData.data[0].url;
        console.log('Product image generated successfully');
      } else {
        console.warn('Image generation failed, proceeding without custom image');
      }
    } catch (imageError) {
      console.warn('Image generation error:', imageError);
    }

    const prompt = `
Create an ADVANCED dynamic, highly engaging product funnel for "${productName}". ${productDescription ? `Product description: ${productDescription}` : ''}

Generate a comprehensive JSON structure with the following ADVANCED components:

1. HERO_SECTION: Premium animated hero with compelling copy and visual elements
2. PRODUCT_BENEFITS: 4-6 detailed benefits with icons and engaging descriptions
3. SOCIAL_PROOF: Rich testimonials, trust indicators, and social validation
4. INTERACTIVE_DEMO: Advanced interactive elements (quiz, calculator, or configurator)
5. CONVERSION_FORM: Smart multi-step form with progressive disclosure
6. VISUAL_THEME: Complete design system with colors, fonts, and styling
7. ADVANCED_FEATURES: Personalization, urgency mechanics, and engagement hooks

INDUSTRY-SPECIFIC REQUIREMENTS for ${industry || 'consumer products'}:
${industry === 'Food & Beverage' ? '- Focus on taste, ingredients, health benefits\n- Use warm, appetizing language\n- Include nutrition/quality highlights' : ''}
${industry === 'Technology' ? '- Emphasize innovation, efficiency, features\n- Use technical but accessible language\n- Include specs and performance metrics' : ''}
${industry === 'Health & Wellness' ? '- Focus on well-being, transformation, results\n- Use empowering, supportive language\n- Include scientific backing' : ''}
${industry === 'Fashion & Beauty' ? '- Emphasize style, confidence, transformation\n- Use aspirational language\n- Include trend and style elements' : ''}

TARGET AUDIENCE OPTIMIZATION for ${targetAudience || 'general consumers'}:
${targetAudience === 'Giovani adulti (18-30)' ? '- Modern, trendy language and visuals\n- Social media integration focus\n- Mobile-first design elements' : ''}
${targetAudience === 'Professionisti (30-45)' ? '- Professional, efficient messaging\n- ROI and productivity focus\n- Premium, sophisticated design' : ''}
${targetAudience === 'Famiglie con bambini' ? '- Family-focused benefits\n- Safety and convenience emphasis\n- Warm, trustworthy tone' : ''}

Requirements:
- Ultra-engaging visual design with premium aesthetics
- Advanced psychological triggers and persuasion techniques
- Sector-specific terminology and benefits
- Audience-tailored messaging and design
- Interactive elements that build engagement
- Progressive information disclosure
- Social proof and urgency without being pushy
- Mobile-responsive design considerations

Return ONLY a valid JSON object with this ADVANCED structure:
{
  "heroSection": {
    "headline": "Compelling headline",
    "subheadline": "Supporting text",
    "animation": "fade-slide-up",
    "backgroundGradient": "from-primary to-secondary",
    "ctaText": "Action text",
    "ctaStyle": "primary|secondary|gradient",
    "urgencyText": "Limited time offer text"
  },
  "visualTheme": {
    "primaryColor": "hsl(240, 100%, 50%)",
    "secondaryColor": "hsl(300, 100%, 60%)",
    "accentColor": "hsl(45, 100%, 55%)",
    "backgroundColor": "hsl(0, 0%, 98%)",
    "textColor": "hsl(0, 0%, 10%)",
    "fontPrimary": "Inter",
    "fontSecondary": "Playfair Display",
    "borderRadius": "12px",
    "spacing": "modern|compact|relaxed"
  },
  "productBenefits": [
    {
      "title": "Benefit title",
      "description": "Detailed benefit description",
      "icon": "lucide icon name",
      "animation": "fade-in|slide-up|scale-in",
      "highlight": true,
      "statistic": "95% improvement"
    }
  ],
  "socialProof": {
    "testimonials": [
      {
        "name": "Customer name",
        "text": "Detailed testimonial text",
        "rating": 5,
        "role": "Customer role/title",
        "verified": true,
        "image": "avatar url or initial"
      }
    ],
    "trustIndicators": ["trust elements"],
    "statistics": [
      {
        "number": "10,000+",
        "label": "Happy customers",
        "icon": "users"
      }
    ]
  },
  "interactiveDemo": {
    "type": "quiz|calculator|configurator|gallery",
    "title": "Interactive demo title",
    "description": "Demo description",
    "content": {
      "questions": [
        {
          "question": "Quiz question",
          "options": ["Option 1", "Option 2"],
          "correct": 0
        }
      ],
      "calculation": {
        "inputs": ["field1", "field2"],
        "formula": "description",
        "result": "outcome description"
      }
    }
  },
  "conversionForm": {
    "title": "Form title",
    "description": "Why to fill the form",
    "steps": [
      {
        "title": "Step 1",
        "fields": [
          {
            "name": "field_name",
            "label": "Field label",
            "type": "text|email|tel|select|number|range",
            "placeholder": "Placeholder text",
            "required": true,
            "options": ["if select type"],
            "validation": "email|phone|required"
          }
        ]
      }
    ],
    "submitText": "Submit button text",
    "incentive": "What user gets",
    "progressBar": true,
    "socialProofInline": "X people signed up today"
  },
  "advancedFeatures": {
    "personalization": {
      "enabled": true,
      "triggers": ["scroll", "time", "interaction"],
      "messages": ["personalized message based on behavior"]
    },
    "urgencyMechanics": {
      "type": "countdown|stock|social",
      "message": "Only 5 left in stock!",
      "expiresIn": "2 hours"
    },
    "exitIntent": {
      "enabled": true,
      "offer": "Special exit offer",
      "discount": "15%"
    }
  },
  "animations": {
    "entrance": "fade-slide-up",
    "scroll": "fade-in-up",
    "interactions": "hover-scale",
    "transitions": "smooth|bouncy|sharp"
  }
}
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an expert in creating SPECTACULAR dynamic product funnels with immersive visual experiences.

              CRITICAL VISUAL REQUIREMENTS:
              - For food products (blueberries, bread, milk): Create cascading, realistic elements that move with scroll
              - For wellness/yoga: Design zen environments with people doing activities, not generic stock images  
              - For tech products: Futuristic particle effects and digital elements
              - For beauty: Flower petals, sparkles, elegant animations
              - NEVER use generic square images or obvious AI-generated content
              - Focus on IMMERSIVE, DYNAMIC backgrounds that tell a story
              
              Create compelling, conversion-optimized product funnels with engaging copy and clear value propositions. Always return valid JSON only.`
            },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error details:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    // Parse and validate the JSON response
    let funnelData;
    try {
      // Clean the response from markdown or other formatting
      let cleanedContent = generatedContent.trim();
      
      // Remove markdown code blocks if present
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      funnelData = JSON.parse(cleanedContent);
      
      // Validate that we have the required structure
      if (!funnelData.heroSection || !funnelData.productBenefits || !funnelData.conversionForm) {
        throw new Error('Invalid funnel structure returned by AI');
      }
      
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', error);
      console.error('Raw AI response:', generatedContent);
      
      // Return a fallback structure if JSON parsing fails
      funnelData = {
        heroSection: {
          headline: `Scopri ${productName}`,
          subheadline: `${productDescription || 'Un prodotto fantastico che trasformerà la tua vita'}`,
          animation: "fade-slide-up",
          backgroundGradient: "from-blue-500 to-purple-600",
          ctaText: "Scopri di più"
        },
        productBenefits: [
          {
            title: "Qualità Premium",
            description: "Realizzato con i migliori ingredienti e materiali disponibili",
            icon: "star",
            animation: "fade-in"
          },
          {
            title: "Risultati Garantiti",
            description: "Vedrai i benefici fin dal primo utilizzo",
            icon: "shield",
            animation: "fade-in"
          },
          {
            title: "Facilità d'uso",
            description: "Semplice da usare, perfetto per tutti",
            icon: "heart",
            animation: "fade-in"
          }
        ],
        socialProof: {
          testimonials: [
            {
              name: "Maria R.",
              text: "Fantastico! Ha superato tutte le mie aspettative.",
              rating: 5
            },
            {
              name: "Giuseppe L.",
              text: "Qualità eccellente, lo consiglio a tutti.",
              rating: 5
            }
          ],
          trustIndicators: ["100% Naturale", "Garanzia Soddisfatti", "Spedizione Gratuita"]
        },
        interactiveDemo: {
          type: "experience",
          title: `Prova l'esperienza ${productName}`,
          description: "Immagina di poter godere di tutti questi benefici ogni giorno!",
          content: "Un'esperienza unica che cambierà il tuo modo di vedere le cose."
        },
        conversionForm: {
          title: "Ottieni maggiori informazioni",
          description: "Lasciaci i tuoi dati per ricevere un'offerta personalizzata",
          fields: [
            {
              name: "name",
              label: "Il tuo nome",
              type: "text",
              placeholder: "Come ti chiami?",
              required: true
            },
            {
              name: "email",
              label: "La tua email",
              type: "email", 
              placeholder: "La tua email",
              required: true
            },
            {
              name: "phone",
              label: "Numero di telefono",
              type: "tel",
              placeholder: "Il tuo numero (opzionale)",
              required: false
            },
            {
              name: "interest",
              label: "Cosa ti interessa di più?",
              type: "select",
              placeholder: "Seleziona un'opzione",
              required: false,
              options: ["Maggiori informazioni", "Prezzo e disponibilità", "Supporto personalizzato", "Demo gratuita"]
            }
          ],
          submitText: "Invia Richiesta",
          incentive: "Ricevi il 15% di sconto sulla prima ordinazione!"
        },
        animations: {
          entrance: "fade-slide-up",
          scroll: "fade-in-up",
          interactions: "hover-scale"
        }
      };
    }

    console.log('Successfully generated funnel for:', productName);

    // Add the generated image to the funnel data
    if (productImageUrl) {
      funnelData.productImage = productImageUrl;
    }

    return new Response(JSON.stringify({
      success: true,
      productName,
      funnelData,
      productImage: productImageUrl
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-dynamic-product-funnel:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

    // Enhanced cinematic funnel generation using refactored modules
async function generateCinematicFunnel(params: CinematicFunnelParams) {
  const { productName, productDescription, targetAudience, industry, openAIApiKey } = params;
  
  const startTime = Date.now();
  const requestId = generateRequestId();
  const maxExecutionTime = 25000; // 25 seconds for better reliability
  
  try {
    console.log(`🎬 [${requestId}] Starting enhanced cinematic structure generation for: ${productName}`);
    console.log(`📊 [${requestId}] Input params:`, { productDescription, targetAudience, industry });
    
    // Test OpenAI API connectivity first
    await testOpenAIConnectivity(openAIApiKey, requestId);
    
    // Generate scene structure with enhanced error handling
    console.log(`📝 [${requestId}] Generating scene structure...`);
    const sceneStructure = await withTimeout(
      generateSceneStructureWithRetry(productName, productDescription, targetAudience, industry, openAIApiKey, requestId),
      20000, // 20 seconds for scene generation
      'Scene structure generation timed out'
    );
    
    console.log(`✅ [${requestId}] Scene structure generated:`, sceneStructure.length, 'scenes');
    
    // Validate scenes before processing
    if (!sceneStructure || !Array.isArray(sceneStructure) || sceneStructure.length === 0) {
      console.error(`❌ [${requestId}] No valid scenes generated - using fallback scenes`);
      const fallbackScenes = createFallbackScenes(productName, productDescription);
      
      return new Response(JSON.stringify({
        success: true,
        cinematicScenes: fallbackScenes,
        funnelType: 'cinematic',
        productName,
        requestId,
        fallbackMode: true,
        metadata: {
          generationTime: Date.now() - startTime,
          totalScenes: fallbackScenes.length,
          imagesGenerated: 0,
          progressiveLoading: true,
          openAIApiConnected: true,
          fallbackReason: 'No scenes generated by AI'
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Add fallback images and optimize for progressive loading
    console.log(`🔧 [${requestId}] Processing scenes with fallbacks...`);
    const optimizedScenes = sceneStructure.map((scene, index) => {
      console.log(`[${requestId}] Processing scene ${index + 1}:`, scene.type, scene.title ? scene.title.substring(0, 30) : 'No title');
      
      // Validate required scene fields
      if (!scene.id || !scene.type || !scene.title) {
        console.warn(`⚠️ [${requestId}] Scene ${index + 1} missing required fields:`, { id: !!scene.id, type: !!scene.type, title: !!scene.title });
        // Provide fallback values
        scene.id = scene.id || `scene_${index + 1}_${Date.now()}`;
        scene.type = scene.type || 'benefit';
        scene.title = scene.title || `Scene ${index + 1}`;
      }
      
      return {
        ...scene,
        fallbackImage: generateFallbackImageUrl(scene.type),
        imagePrompt: optimizeImagePrompt(scene.imagePrompt || `Cinematic scene for ${productName}`),
        loadingPriority: scene.type === 'hero' ? 'high' : 'low'
      };
    });
    
    console.log(`🎯 [${requestId}] Finalizing scenes...`);
    const finalizedScenes = finalizeScenes(optimizedScenes);
    
    const totalTime = Date.now() - startTime;
    console.log(`🎬 [${requestId}] Scene structure generated successfully in ${totalTime}ms`);
    console.log(`📈 [${requestId}] Final scenes count:`, finalizedScenes.length);
    
    return new Response(JSON.stringify({
      success: true,
      cinematicScenes: finalizedScenes,
      funnelType: 'cinematic',
      productName,
      requestId,
      metadata: {
        generationTime: totalTime,
        totalScenes: finalizedScenes.length,
        imagesGenerated: 0, // Images will be generated progressively
        progressiveLoading: true,
        openAIApiConnected: true
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    const errorDetails: ErrorDetails = {
      requestId,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      executionTime: Date.now() - startTime,
      productName,
      openAIApiKey: openAIApiKey ? 'Present' : 'Missing'
    };
    
    console.error(`❌ [${requestId}] Error in cinematic structure generation:`, errorDetails);
    
    // Always provide a graceful fallback with pre-built scenes
    console.log(`🔄 [${requestId}] Using graceful fallback...`);
    const fallbackScenes = createFallbackScenes(productName, productDescription);
    
    return new Response(JSON.stringify({
      success: true,
      cinematicScenes: fallbackScenes,
      funnelType: 'cinematic',
      productName,
      requestId,
      fallbackMode: true,
      metadata: {
        generationTime: Date.now() - startTime,
        totalScenes: fallbackScenes.length,
        imagesGenerated: 0,
        progressiveLoading: true,
        openAIApiConnected: false,
        fallbackReason: error.message
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// Note: All utility functions have been moved to their respective modules:
// - types.ts: Type definitions
// - utils.ts: General utilities and validation
// - fallback-scenes.ts: Fallback scene generation
// - image-utils.ts: Image generation and fallback utilities
// - scene-generator.ts: OpenAI scene generation with retry logic