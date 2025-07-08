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
  const requestId = Math.random().toString(36).substring(7);

  try {
    console.log(`🎬 [${requestId}] Funnel generation request started`);
    
    // Check if OpenAI API key is configured
    if (!openAIApiKey) {
      console.error(`❌ [${requestId}] OpenAI API key is not configured`);
      return new Response(JSON.stringify({
        success: false,
        error: 'OpenAI API key is not configured. Please contact the administrator.',
        requestId,
        debug: {
          timestamp: new Date().toISOString(),
          environmentCheck: 'OpenAI API key missing'
        }
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate OpenAI API key format
    if (!openAIApiKey.startsWith('sk-') || openAIApiKey.length < 20) {
      console.error(`❌ [${requestId}] Invalid OpenAI API key format`);
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid OpenAI API key format. Please check your configuration.',
        requestId,
        debug: {
          timestamp: new Date().toISOString(),
          environmentCheck: 'OpenAI API key invalid format'
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

// Fast cinematic funnel generation - structure only
async function generateCinematicFunnel(params: {
  productName: string;
  productDescription?: string;
  targetAudience?: string;
  industry?: string;
  generateImages: boolean;
  openAIApiKey: string;
}) {
  const { productName, productDescription, targetAudience, industry, openAIApiKey } = params;
  
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  const maxExecutionTime = 25000; // 25 seconds for better reliability
  
  try {
    console.log(`🎬 [${requestId}] Starting enhanced cinematic structure generation for: ${productName}`);
    console.log(`📊 [${requestId}] Input params:`, { productDescription, targetAudience, industry });
    
    // Test OpenAI API connectivity first
    console.log(`🔍 [${requestId}] Testing OpenAI API connectivity...`);
    const testResponse = await withTimeout(
      fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
      }),
      3000, // 3 seconds for connectivity test
      'OpenAI API connectivity test timed out'
    );
    
    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.error(`❌ [${requestId}] OpenAI API connectivity test failed:`, errorText);
      throw new Error(`OpenAI API connectivity issue: ${testResponse.status} - ${errorText}`);
    }
    
    console.log(`✅ [${requestId}] OpenAI API connectivity verified`);
    
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
      console.error(`❌ [${requestId}] No valid scenes generated - received empty or invalid structure`);
      throw new Error('No valid scenes generated - received empty or invalid structure');
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
    const errorDetails = {
      requestId,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      executionTime: Date.now() - startTime,
      productName,
      openAIApiKey: openAIApiKey ? 'Present' : 'Missing'
    };
    
    console.error(`❌ [${requestId}] Error in cinematic structure generation:`, errorDetails);
    
    // Try to provide a graceful fallback with pre-built scenes
    try {
      console.log(`🔄 [${requestId}] Attempting graceful fallback...`);
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
      
    } catch (fallbackError) {
      console.error(`❌ [${requestId}] Fallback creation also failed:`, fallbackError);
      
      // Return detailed error information
      return new Response(JSON.stringify({
        success: false,
        error: `Cinematic structure generation failed: ${error.message}`,
        funnelType: 'cinematic',
        requestId,
        errorDetails,
        fallbackData: {
          productName,
          suggestionMessage: 'Try again with a simpler product description or check your internet connection',
          debugInfo: {
            openAIApiKeyPresent: !!openAIApiKey,
            openAIApiKeyValid: openAIApiKey ? openAIApiKey.startsWith('sk-') : false,
            executionTime: Date.now() - startTime
          }
        }
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }
}

// Timeout wrapper utility
async function withTimeout<T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), ms);
  });
  
  return Promise.race([promise, timeout]);
}

// Legacy function kept for backward compatibility - now redirects to enhanced version
async function generateSceneStructure(
  productName: string, 
  productDescription?: string, 
  targetAudience?: string, 
  industry?: string,
  openAIApiKey?: string
): Promise<CinematicScene[]> {
  return generateSceneStructureWithRetry(productName, productDescription, targetAudience, industry, openAIApiKey);
}

// Optimized image generation with concurrency control and timeout handling
async function generateSceneImagesOptimized(
  scenes: CinematicScene[], 
  generateImages: boolean, 
  openAIApiKey: string,
  remainingTime: number
): Promise<CinematicScene[]> {
  if (!generateImages || !openAIApiKey) {
    return scenes;
  }

  const maxConcurrentImages = 2; // Limit concurrent requests
  const timePerImage = Math.floor(remainingTime / scenes.length * 0.8); // Reserve 20% buffer
  
  console.log(`🖼️ Starting optimized image generation for ${scenes.length} scenes`);
  console.log(`⏱️ Time per image: ${timePerImage}ms, Concurrent: ${maxConcurrentImages}`);
  
  const scenesWithImages = [];
  
  // Process images in batches to control concurrency
  for (let i = 0; i < scenes.length; i += maxConcurrentImages) {
    const batch = scenes.slice(i, i + maxConcurrentImages);
    
    const batchPromises = batch.map(async (scene, batchIndex) => {
      const globalIndex = i + batchIndex;
      console.log(`🎨 Processing scene ${globalIndex + 1}/${scenes.length}: ${scene.type}`);
      
      try {
        const imageResponse = await withTimeout(
          fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openAIApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'dall-e-3',
              prompt: scene.imagePrompt,
              n: 1,
              size: '1792x1024', // Wide cinematic format
              quality: 'hd',
            }),
          }),
          timePerImage,
          `Image generation timeout for scene ${globalIndex + 1}`
        );

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          scene.imageUrl = imageData.data[0].url;
          console.log(`✅ Image generated for scene ${globalIndex + 1}`);
        } else {
          const errorText = await imageResponse.text();
          console.warn(`⚠️ Image generation failed for scene ${globalIndex + 1}:`, errorText);
        }
      } catch (error) {
        console.warn(`⚠️ Image generation error for scene ${globalIndex + 1}:`, error.message);
        // Continue without image - scene will work without it
      }
      
      return scene;
    });
    
    const batchResults = await Promise.all(batchPromises);
    scenesWithImages.push(...batchResults);
  }
  
  const generatedCount = scenesWithImages.filter(s => s.imageUrl).length;
  console.log(`🎬 Image generation completed: ${generatedCount}/${scenes.length} images generated`);
  
  return scenesWithImages;
}

// Enhanced scene structure generation with retry logic and request tracking
async function generateSceneStructureWithRetry(
  productName: string, 
  productDescription?: string, 
  targetAudience?: string, 
  industry?: string,
  openAIApiKey?: string,
  requestId?: string
): Promise<CinematicScene[]> {
  const logPrefix = `[${requestId || 'unknown'}]`;
  
  // Enhanced fallback scenes with better Italian content
  const fallbackScenes = createFallbackScenes(productName, productDescription);
  
  // If no OpenAI key or empty key, return fallback immediately
  if (!openAIApiKey || openAIApiKey.trim() === '') {
    console.log(`🎬 ${logPrefix} No OpenAI API key available - using fallback scenes`);
    return fallbackScenes;
  }

  const prompt = `
Crea un funnel cinematografico COINVOLGENTE per "${productName}". Genera esattamente 5 scene in ITALIANO che fluiscono perfettamente insieme.

Contesto Prodotto:
- Nome: ${productName}
- Descrizione: ${productDescription || 'Prodotto premium'}
- Pubblico Target: ${targetAudience || 'Consumatori generici'}
- Settore: ${industry || 'Prodotti di consumo'}

Genera ESATTAMENTE questa struttura JSON per 5 scene:
{
  "scenes": [
    {
      "id": "scene_1",
      "type": "hero",
      "imagePrompt": "Immagine cinematografica hero ultra-professionale per ${productName} - illuminazione drammatica, fotografia professionale, risoluzione 8K",
      "title": "Titolo hero coinvolgente in italiano",
      "subtitle": "Sottotitolo hero accattivante",
      "content": "Contenuto della sezione hero che cattura l'attenzione del visualizzatore",
      "cta": {
        "text": "Scopri di più",
        "action": "scroll"
      },
      "scrollTrigger": {
        "start": 0,
        "end": 0.2
      },
      "parallaxLayers": [
        {
          "element": "✨",
          "speed": 0.5,
          "scale": 1.2,
          "opacity": 0.8
        }
      ]
    },
    {
      "id": "scene_2", 
      "type": "benefit",
      "imagePrompt": "Visualizzazione cinematografica dei benefici del prodotto per ${productName}",
      "title": "Titolo beneficio chiave",
      "subtitle": "Spiegazione del beneficio",
      "content": "Descrizione dettagliata del beneficio",
      "scrollTrigger": {
        "start": 0.2,
        "end": 0.4
      },
      "parallaxLayers": [
        {
          "element": "⭐",
          "speed": 0.3,
          "scale": 1.1,
          "opacity": 0.9
        }
      ]
    },
    {
      "id": "scene_3",
      "type": "proof",
      "imagePrompt": "Scena cinematografica di prova sociale e testimonianze per ${productName}",
      "title": "Titolo prova sociale",
      "subtitle": "Fiducia e credibilità",
      "content": "Testimonianze e prove di efficacia",
      "scrollTrigger": {
        "start": 0.4,
        "end": 0.6
      },
      "parallaxLayers": [
        {
          "element": "🌟",
          "speed": 0.4,
          "scale": 1.0,
          "opacity": 0.7
        }
      ]
    },
    {
      "id": "scene_4",
      "type": "demo",
      "imagePrompt": "Scena di dimostrazione interattiva del prodotto per ${productName}",
      "title": "Vedi in azione",
      "subtitle": "Dimostrazione del prodotto",
      "content": "Contenuto della demo interattiva",
      "scrollTrigger": {
        "start": 0.6,
        "end": 0.8
      },
      "parallaxLayers": [
        {
          "element": "💫",
          "speed": 0.6,
          "scale": 0.9,
          "opacity": 0.8
        }
      ]
    },
    {
      "id": "scene_5",
      "type": "conversion",
      "imagePrompt": "Scena finale di conversione con call-to-action per ${productName}",
      "title": "Agisci ora",
      "subtitle": "Non perdere l'occasione",
      "content": "Spinta finale alla conversione",
      "cta": {
        "text": "Inizia subito",
        "action": "convert"
      },
      "scrollTrigger": {
        "start": 0.8,
        "end": 1.0
      },
      "parallaxLayers": [
        {
          "element": "🚀",
          "speed": 0.2,
          "scale": 1.3,
          "opacity": 1.0
        }
      ]
    }
  ]
}

Ritorna SOLO JSON valido. Rendi i prompt delle immagini estremamente dettagliati e cinematografici.`;

  // Enhanced retry logic with better error handling
  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt <= maxRetries) {
    try {
      console.log(`🤖 ${logPrefix} OpenAI API call attempt ${attempt + 1}/${maxRetries + 1}`);
      
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
              content: 'Sei un esperto di storytelling cinematografico. Crea scene immersive e narrative fluide. Ritorna sempre solo JSON valido in italiano.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        let cleanedContent = data.choices[0].message.content.trim();
        
        if (cleanedContent.startsWith('```json')) {
          cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanedContent.startsWith('```')) {
          cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        const parsed = JSON.parse(cleanedContent);
        console.log(`✅ ${logPrefix} OpenAI API success on attempt ${attempt + 1}`);
        
        // Validate the response structure
        if (parsed.scenes && Array.isArray(parsed.scenes) && parsed.scenes.length > 0) {
          return parsed.scenes;
        } else {
          console.warn(`⚠️ ${logPrefix} Invalid response structure, using fallback`);
          return fallbackScenes;
        }
      }
      
      // Handle rate limiting (429) and server errors (5xx)
      if (response.status === 429 || response.status >= 500) {
        const errorBody = await response.text();
        console.warn(`⚠️ ${logPrefix} OpenAI API error ${response.status} on attempt ${attempt + 1}: ${errorBody}`);
        
        if (attempt < maxRetries) {
          // Exponential backoff: 2^attempt seconds (2s, 4s, 8s)
          const waitTime = Math.pow(2, attempt + 1) * 1000;
          console.log(`⏳ ${logPrefix} Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          attempt++;
          continue;
        }
      }
      
      // For other errors, fail immediately but gracefully
      const errorText = await response.text();
      console.error(`❌ ${logPrefix} OpenAI API error ${response.status}: ${errorText}`);
      console.log(`🔄 ${logPrefix} Falling back to pre-built scenes`);
      return fallbackScenes;
      
    } catch (error) {
      console.error(`❌ ${logPrefix} Exception in OpenAI API call:`, error.message);
      
      if (attempt < maxRetries && (error.message.includes('429') || error.message.includes('rate limit'))) {
        const waitTime = Math.pow(2, attempt + 1) * 1000;
        console.log(`⏳ ${logPrefix} Retrying after rate limit error, waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        attempt++;
        continue;
      }
      
      // If it's the last attempt or non-retryable error, return fallback
      if (attempt >= maxRetries) {
        console.log(`🔄 ${logPrefix} All attempts exhausted, using fallback scenes`);
        return fallbackScenes;
      }
      
      attempt++;
    }
  }
  
  // If we get here, all retries failed, return fallback scenes
  console.log(`🚨 ${logPrefix} All OpenAI API attempts failed - returning fallback scenes`);
  return fallbackScenes;
}

// Create enhanced fallback scenes
function createFallbackScenes(productName: string, productDescription?: string): CinematicScene[] {
  const scenes: CinematicScene[] = [
    {
      id: "scene_1",
      type: "hero",
      imagePrompt: `Ultra-cinematic hero image for ${productName} - dramatic lighting, professional photography, high resolution`,
      title: `Scopri ${productName}`,
      subtitle: `${productDescription || 'Il prodotto che stavi cercando'}`,
      content: `Benvenuto nel futuro con ${productName}. Un'esperienza che trasformerà il tuo modo di vedere le cose. Qualità superiore, risultati garantiti.`,
      cta: {
        text: "Scopri di più",
        action: "scroll"
      },
      scrollTrigger: {
        start: 0,
        end: 0.2
      },
      parallaxLayers: [
        {
          element: "✨",
          speed: 0.5,
          scale: 1.2,
          opacity: 0.8
        }
      ]
    },
    {
      id: "scene_2", 
      type: "benefit",
      imagePrompt: `Cinematic product benefit visualization for ${productName}`,
      title: "Qualità Premium",
      subtitle: "Realizzato con eccellenza",
      content: `${productName} è progettato per offrire la migliore esperienza possibile. Ogni dettaglio è curato per garantire risultati eccezionali e soddisfazione duratura.`,
      scrollTrigger: {
        start: 0.2,
        end: 0.4
      },
      parallaxLayers: [
        {
          element: "⭐",
          speed: 0.3,
          scale: 1.1,
          opacity: 0.9
        }
      ]
    },
    {
      id: "scene_3",
      type: "proof",
      imagePrompt: `Social proof and testimonials cinematic scene for ${productName}`,
      title: "Migliaia di clienti soddisfatti",
      subtitle: "Testimonianze reali",
      content: "Clienti da tutto il mondo hanno già scelto la qualità e l'affidabilità che solo noi possiamo offrire. Unisciti anche tu alla nostra famiglia di clienti soddisfatti.",
      scrollTrigger: {
        start: 0.4,
        end: 0.6
      },
      parallaxLayers: [
        {
          element: "🌟",
          speed: 0.4,
          scale: 1.0,
          opacity: 0.7
        }
      ]
    },
    {
      id: "scene_4",
      type: "demo",
      imagePrompt: `Interactive product demonstration scene for ${productName}`,
      title: "Vedi in azione",
      subtitle: "Funzionalità avanzate",
      content: `Scopri come ${productName} può semplificare la tua vita quotidiana. Funzionalità innovative pensate per te, con un'interfaccia intuitiva e risultati immediati.`,
      scrollTrigger: {
        start: 0.6,
        end: 0.8
      },
      parallaxLayers: [
        {
          element: "💫",
          speed: 0.6,
          scale: 0.9,
          opacity: 0.8
        }
      ]
    },
    {
      id: "scene_5",
      type: "conversion",
      imagePrompt: `Final conversion scene with call-to-action for ${productName}`,
      title: "Inizia ora",
      subtitle: "Non perdere l'occasione",
      content: "Questo è il momento perfetto per fare il grande passo. Unisciti a migliaia di persone che hanno già scelto la qualità e l'innovazione. Inizia oggi stesso.",
      cta: {
        text: "Inizia subito",
        action: "convert"
      },
      scrollTrigger: {
        start: 0.8,
        end: 1.0
      },
      parallaxLayers: [
        {
          element: "🚀",
          speed: 0.2,
          scale: 1.3,
          opacity: 1.0
        }
      ]
    }
  ];

  return scenes;
}

// Legacy function for backward compatibility
async function generateSceneImages(
  scenes: CinematicScene[], 
  generateImages: boolean, 
  openAIApiKey?: string
): Promise<CinematicScene[]> {
  if (!generateImages || !openAIApiKey) {
    return scenes;
  }

  return generateSceneImagesOptimized(scenes, generateImages, openAIApiKey, 30000);
}

// Helper functions for progressive loading
function generateFallbackImageUrl(sceneType: string): string {
  // Create fallback colors based on scene type
  const colorMap = {
    hero: { start: '#667eea', end: '#764ba2' },
    benefit: { start: '#f093fb', end: '#f5576c' },
    proof: { start: '#4facfe', end: '#00f2fe' },
    demo: { start: '#43e97b', end: '#38f9d7' },
    conversion: { start: '#fa709a', end: '#fee140' }
  };
  
  const colors = colorMap[sceneType] || colorMap.hero;
  console.log(`📐 Generating fallback for scene type: ${sceneType}, colors:`, colors);
  
  // Use URL encoding for safe SVG embedding (Deno-compatible)
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="1792" height="1024" viewBox="0 0 1792 1024">
    <defs>
      <linearGradient id="grad_${sceneType}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${colors.start};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${colors.end};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#grad_${sceneType})"/>
  </svg>`;
  
  try {
    // Use URL encoding instead of base64 for better Deno compatibility
    const encodedSvg = encodeURIComponent(svgContent);
    console.log(`✅ Generated fallback SVG for ${sceneType}`);
    return `data:image/svg+xml;utf8,${encodedSvg}`;
  } catch (error) {
    console.error(`❌ Error generating fallback SVG for ${sceneType}:`, error);
    // Return a simple solid color fallback
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1792" height="1024"><rect width="100%" height="100%" fill="${colors.start}"/></svg>`;
  }
}

function optimizeImagePrompt(originalPrompt: string): string {
  // Optimize prompts for faster generation while maintaining quality
  const optimized = originalPrompt
    .replace('8K ultra high resolution', 'high resolution')
    .replace('ultra-realistic', 'realistic')
    .replace('extremely detailed', 'detailed')
    .replace('professional photography', 'photography')
    .replace('cinematic lighting', 'dramatic lighting');
  
  return optimized.length > 800 ? optimized.substring(0, 800) + '...' : optimized;
}

function finalizeScenes(scenes: CinematicScene[]): CinematicScene[] {
  // Add any final optimizations, validations, or enhancements
  return scenes.map(scene => ({
    ...scene,
    // Ensure all required fields are present
    id: scene.id || `scene_${Date.now()}_${Math.random()}`,
    scrollTrigger: scene.scrollTrigger || { start: 0, end: 1 },
    parallaxLayers: scene.parallaxLayers || []
  }));
}