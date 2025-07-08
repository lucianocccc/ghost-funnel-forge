import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProductFunnelRequest {
  productName: string;
  productDescription?: string;
  targetAudience?: string;
  industry?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if OpenAI API key is configured
    if (!openAIApiKey) {
      console.error('OpenAI API key is not configured');
      return new Response(JSON.stringify({
        success: false,
        error: 'OpenAI API key is not configured. Please contact the administrator.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { productName, productDescription, targetAudience, industry }: ProductFunnelRequest = await req.json();

    console.log('Generating dynamic funnel for product:', productName);
    console.log('Input parameters:', { productName, productDescription, targetAudience, industry });

    const prompt = `
Create a dynamic, engaging product funnel for "${productName}". ${productDescription ? `Product description: ${productDescription}` : ''}

Generate a JSON structure with the following components:

1. HERO_SECTION: An animated hero section with compelling headline, benefits, and visual elements
2. PRODUCT_BENEFITS: 3-4 key benefits with icons and descriptions
3. SOCIAL_PROOF: Testimonials and trust indicators
4. INTERACTIVE_DEMO: A simple interactive element showing the product
5. CONVERSION_FORM: A form that captures interest WITHOUT requiring email upfront

Requirements:
- Make it visually appealing with animations
- Focus on emotional connection and benefits
- Use persuasive copywriting
- Include specific details about the product
- Create urgency without being pushy
- Target audience: ${targetAudience || 'general consumers'}
- Industry context: ${industry || 'consumer products'}

Return ONLY a valid JSON object with this structure:
{
  "heroSection": {
    "headline": "Compelling headline",
    "subheadline": "Supporting text",
    "animation": "fade-slide-up",
    "backgroundGradient": "gradient colors",
    "ctaText": "Action text"
  },
  "productBenefits": [
    {
      "title": "Benefit title",
      "description": "Benefit description",
      "icon": "lucide icon name",
      "animation": "animation type"
    }
  ],
  "socialProof": {
    "testimonials": [
      {
        "name": "Customer name",
        "text": "Testimonial text",
        "rating": 5
      }
    ],
    "trustIndicators": ["trust elements"]
  },
  "interactiveDemo": {
    "type": "slider|gallery|quiz",
    "title": "Demo title",
    "description": "Demo description",
    "content": "demo specific content"
  },
  "conversionForm": {
    "title": "Form title",
    "description": "Why to fill the form",
    "fields": [
      {
        "name": "field_name",
        "label": "Field label",
        "type": "text|select|number",
        "placeholder": "Placeholder text",
        "required": true,
        "options": ["if select type"]
      }
    ],
    "submitText": "Submit button text",
    "incentive": "What user gets"
  },
  "animations": {
    "entrance": "entrance animation",
    "scroll": "scroll triggered animations",
    "interactions": "hover/click animations"
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
            content: 'You are an expert marketing funnel designer. Create compelling, conversion-optimized product funnels with engaging copy and clear value propositions. Always return valid JSON only.'
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

    return new Response(JSON.stringify({
      success: true,
      productName,
      funnelData
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