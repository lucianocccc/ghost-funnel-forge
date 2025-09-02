import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Advanced Neuro-Psychology Prompts for Conversion-Killer Copy
const NEURO_PSYCHOLOGY_PROMPTS = {
  hero: {
    system: `You are a world-class neuro-copywriting expert specializing in high-converting hero sections. Use advanced persuasion psychology principles including:
    - Pattern Interrupts to grab attention instantly
    - Cognitive Biases (anchoring, social proof, authority)
    - Emotional triggers that bypass rational thinking
    - Pain-point amplification with immediate solution positioning
    - Curiosity gaps that create compulsive reading`,
    
    template: `Create a conversion-killer hero section for:
    Product: {productName}
    Buyer Persona: {buyerPersona}
    Industry: {industry}
    Primary Pain Point: {primaryPain}
    Key Transformation: {transformation}
    Social Proof Number: {socialProof}
    
    Psychology Tactics to Use:
    - Start with a pattern interrupt that stops scrolling
    - Use the "Before vs After" mental framework
    - Include authority positioning
    - Create urgency without being salesy
    - Use specific numbers for credibility
    
    Generate:
    - Headline: A shocking, benefit-driven statement (6-12 words)
    - Subheadline: Pain amplification + solution tease (15-25 words)
    - Value proposition: Specific transformation promise (20-35 words)
    - Social proof: Authority-backed credibility statement
    - CTA: Action-oriented with urgency trigger (2-4 words)
    
    Tone: {buyerPersona} specific language, emotionally charged, confident`
  },

  discovery: {
    system: `You are a pain-point amplification specialist. Create discovery content that makes prospects realize they MUST solve their problem NOW. Use:
    - Problem-agitation-solution framework
    - Cost-of-inaction psychology
    - Hidden pain revelation
    - Future pacing to show consequences
    - Authority positioning as the solution guide`,
    
    template: `Create discovery content that agitates the pain for:
    Product: {productName}
    Buyer Persona: {buyerPersona}
    Core Problem: {primaryPain}
    Hidden Costs: {hiddenCosts}
    Consequences: {consequences}
    
    Psychology Framework:
    - Reveal hidden problems they didn't know they had
    - Quantify the true cost of inaction
    - Use future pacing to show worsening scenarios
    - Position yourself as the knowledgeable guide
    - Create urgency through cost calculation
    
    Generate:
    - Headline: Provocative question or shocking statement
    - Subheadline: Problem amplification
    - Content: Hidden cost revelation + consequences (50-80 words)
    - Authority statement: Credibility positioning
    - CTA: Diagnostic or assessment invitation`
  },

  benefits: {
    system: `You are a transformation specialist. Convert features into emotionally compelling benefits using:
    - Before/After transformation visualization
    - Outcome-focused benefit stacking
    - Social proof integration
    - Specific result quantification
    - Emotional benefit layering (logical + emotional + social)`,
    
    template: `Create benefit-focused content for:
    Product: {productName}
    Buyer Persona: {buyerPersona}
    Key Benefits: {benefits}
    Transformation: {transformation}
    Timeframe: {timeframe}
    
    Benefit Psychology:
    - Show specific outcomes, not features
    - Use "imagine yourself" visualization
    - Stack logical + emotional + social benefits
    - Include specific metrics and timeframes
    - Create desire through aspiration
    
    Generate:
    - Headline: Transformation-focused promise
    - Subheadline: Specific outcome within timeframe
    - Benefit stack: 3 key transformations with emotional triggers
    - Visualization: "Imagine..." scenario
    - CTA: Progression toward transformation`
  },

  emotional: {
    system: `You are an emotional trigger specialist. Create urgency and desire using advanced psychological triggers:
    - Scarcity and exclusivity psychology
    - FOMO (Fear of Missing Out) amplification
    - Social proof and authority
    - Risk reversal psychology
    - Commitment and consistency triggers`,
    
    template: `Create emotional urgency content for:
    Product: {productName}
    Buyer Persona: {buyerPersona}
    Scarcity Element: {scarcityElement}
    Social Proof: {socialProof}
    Urgency Reason: {urgencyReason}
    
    Emotional Triggers:
    - Create genuine scarcity (time/quantity limited)
    - Use bandwagon effect (others are acting now)
    - Include authority endorsement
    - Add risk reversal elements
    - Create visualization of regret if they don't act
    
    Generate:
    - Headline: Urgency-driven with scarcity
    - Subheadline: Social proof with FOMO
    - Emotional content: Desire + urgency + risk reversal
    - Authority backing: Credibility statement
    - CTA: Immediate action with scarcity reminder`
  },

  conversion: {
    system: `You are a closing specialist. Create final conversion content that handles all objections and drives immediate action using:
    - Objection handling psychology
    - Risk reversal techniques
    - Final urgency creation
    - Value stacking and anchoring
    - Commitment and consistency psychology`,
    
    template: `Create final conversion content for:
    Product: {productName}
    Buyer Persona: {buyerPersona}
    Price Anchor: {priceAnchor}
    Guarantee: {guarantee}
    Main Objections: {objections}
    
    Conversion Psychology:
    - Handle all major objections preemptively
    - Use price anchoring and value stacking
    - Include risk reversal guarantee
    - Create "last chance" urgency
    - Use social proof for final push
    
    Generate:
    - Headline: Value-focused with urgency
    - Subheadline: Risk reversal guarantee
    - Conversion content: Objection handling + value stack
    - Guarantee statement: Risk elimination
    - CTA: Final action with urgency trigger`
  },

  qualification: {
    system: `You are a prospect qualification expert. Create content that filters for ideal customers while building desire in qualified prospects using:
    - Self-selection psychology
    - Exclusivity and qualification triggers
    - Authority positioning
    - Value perception building
    - Commitment escalation`,
    
    template: `Create qualification content for:
    Product: {productName}
    Ideal Customer Profile: {idealCustomer}
    Qualifying Criteria: {qualifyingCriteria}
    Exclusivity Factor: {exclusivityFactor}
    
    Qualification Psychology:
    - Make prospects self-select as qualified
    - Create exclusivity through criteria
    - Position as selective authority
    - Build value through selectiveness
    - Escalate commitment through qualification
    
    Generate:
    - Headline: Qualifying question or statement
    - Subheadline: Ideal customer description
    - Qualification content: Criteria + exclusivity
    - Authority positioning: Selective expertise
    - CTA: Self-qualification invitation`
  }
};

// Advanced Buyer Personas with Psychology Profiles
const BUYER_PERSONAS = {
  ceo_executive: {
    name: "CEO/Executive",
    psychology: "Results-driven, time-conscious, authority-focused, risk-averse but opportunity-seeking",
    language: "Executive, strategic, ROI-focused, efficiency, competitive advantage",
    painPoints: ["Time scarcity", "Bottom-line pressure", "Decision fatigue", "Market competition"],
    motivators: ["Competitive advantage", "Efficiency gains", "Revenue growth", "Risk mitigation"],
    objections: ["Price concerns", "Implementation time", "Team adoption", "ROI uncertainty"],
    communicationStyle: "Direct, results-focused, backed by data and proof"
  },
  
  manager_director: {
    name: "Manager/Director",
    psychology: "Performance-driven, team-focused, process-oriented, seeking recognition",
    language: "Professional, team-oriented, process improvement, performance metrics",
    painPoints: ["Team efficiency", "Process bottlenecks", "Performance pressure", "Resource constraints"],
    motivators: ["Team success", "Process optimization", "Recognition", "Career advancement"],
    objections: ["Budget approval", "Team training", "Change management", "Supervisor buy-in"],
    communicationStyle: "Professional, benefit-focused, team-oriented"
  },
  
  entrepreneur_founder: {
    name: "Entrepreneur/Founder",
    psychology: "Innovation-driven, growth-focused, resource-conscious, opportunity-seeking",
    language: "Innovative, scalable, disruptive, growth-oriented, lean",
    painPoints: ["Limited resources", "Scaling challenges", "Time management", "Market penetration"],
    motivators: ["Growth potential", "Innovation", "Competitive edge", "Efficiency"],
    objections: ["Cash flow", "Complexity", "Learning curve", "ROI timeline"],
    communicationStyle: "Innovation-focused, growth-oriented, efficiency-driven"
  },
  
  small_business_owner: {
    name: "Small Business Owner",
    psychology: "Practical, cost-conscious, relationship-focused, survival-oriented",
    language: "Practical, affordable, reliable, simple, trustworthy",
    painPoints: ["Limited budget", "Time constraints", "Customer acquisition", "Competition"],
    motivators: ["Cost savings", "Simplicity", "Customer satisfaction", "Business growth"],
    objections: ["Price sensitivity", "Complexity concerns", "Time investment", "Risk aversion"],
    communicationStyle: "Practical, value-focused, relationship-oriented"
  },
  
  professional_specialist: {
    name: "Professional/Specialist",
    psychology: "Expertise-driven, quality-focused, reputation-conscious, efficiency-seeking",
    language: "Expert, professional, quality, precision, specialized",
    painPoints: ["Workload management", "Quality standards", "Professional reputation", "Industry changes"],
    motivators: ["Professional excellence", "Efficiency", "Expertise enhancement", "Recognition"],
    objections: ["Quality concerns", "Learning investment", "Professional risk", "Cost justification"],
    communicationStyle: "Expert-focused, quality-oriented, precision-driven"
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      sectionType, 
      productName, 
      industry, 
      buyerPersona = 'professional_specialist',
      primaryPain,
      transformation,
      benefits = [],
      socialProof,
      scarcityElement,
      urgencyReason,
      priceAnchor,
      guarantee,
      objections = [],
      customContext = {}
    } = await req.json();

    if (!sectionType || !productName) {
      return new Response(JSON.stringify({ 
        error: "Missing required fields: sectionType and productName are required" 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    const promptConfig = NEURO_PSYCHOLOGY_PROMPTS[sectionType as keyof typeof NEURO_PSYCHOLOGY_PROMPTS];
    if (!promptConfig) {
      return new Response(JSON.stringify({ 
        error: `Invalid section type. Supported types: ${Object.keys(NEURO_PSYCHOLOGY_PROMPTS).join(', ')}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    const persona = BUYER_PERSONAS[buyerPersona as keyof typeof BUYER_PERSONAS];
    if (!persona) {
      return new Response(JSON.stringify({ 
        error: `Invalid buyer persona. Supported personas: ${Object.keys(BUYER_PERSONAS).join(', ')}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // Build enhanced prompt with buyer persona psychology
    let enhancedPrompt = promptConfig.template
      .replace(/{productName}/g, productName)
      .replace(/{buyerPersona}/g, persona.name)
      .replace(/{industry}/g, industry || 'technology')
      .replace(/{primaryPain}/g, primaryPain || persona.painPoints[0])
      .replace(/{transformation}/g, transformation || 'significant improvement')
      .replace(/{benefits}/g, benefits.join(', ') || 'enhanced performance')
      .replace(/{socialProof}/g, socialProof || '1000+ professionals')
      .replace(/{scarcityElement}/g, scarcityElement || 'limited time offer')
      .replace(/{urgencyReason}/g, urgencyReason || 'price increase coming')
      .replace(/{priceAnchor}/g, priceAnchor || 'premium solution')
      .replace(/{guarantee}/g, guarantee || '30-day money-back guarantee')
      .replace(/{objections}/g, objections.join(', ') || persona.objections.join(', '));

    // Add buyer persona psychology context
    const psychologyContext = `
BUYER PERSONA PSYCHOLOGY:
- Name: ${persona.name}
- Psychology Profile: ${persona.psychology}
- Language Style: ${persona.language}
- Key Pain Points: ${persona.painPoints.join(', ')}
- Primary Motivators: ${persona.motivators.join(', ')}
- Common Objections: ${persona.objections.join(', ')}
- Communication Style: ${persona.communicationStyle}

Use this psychology profile to craft copy that resonates deeply with this specific persona.
`;

    const finalPrompt = psychologyContext + enhancedPrompt;

    console.log(`Generating neuro-copywriting ${sectionType} content for ${persona.name} persona`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: `${promptConfig.system}\n\nAlways return a JSON object with these exact fields: title, subtitle, content, cta, socialProof, objectionHandling.` 
          },
          { role: 'user', content: finalPrompt }
        ],
        max_tokens: 800,
        temperature: 0.9,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = JSON.parse(data.choices[0].message.content);

    // Add enhanced metadata
    const result = {
      ...generatedContent,
      metadata: {
        sectionType,
        productName,
        industry,
        buyerPersona: persona.name,
        psychologyProfile: persona.psychology,
        generatedAt: new Date().toISOString(),
        model: 'gpt-4.1-2025-04-14',
        conversionOptimized: true,
        neuroCopywriting: true
      }
    };

    console.log(`Successfully generated neuro-copywriting ${sectionType} content:`, result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in neuro-copywriting-engine:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      type: 'neuro_copywriting_error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});