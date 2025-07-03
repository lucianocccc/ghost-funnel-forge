
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeadAnalysisRequest {
  leadData: any;
  analysisContext: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { leadData, analysisContext }: LeadAnalysisRequest = await req.json();

    console.log('Starting enhanced lead analysis for:', leadData.id);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Prepare comprehensive analysis prompt
    const analysisPrompt = `
Analyze this lead with advanced AI insights and provide a comprehensive analysis:

LEAD PROFILE:
- Name: ${leadData.name || 'N/A'}
- Email: ${leadData.email || 'N/A'}
- Phone: ${leadData.phone || 'N/A'}
- Company: ${leadData.company || 'N/A'}
- Business Area: ${analysisContext.lead_profile?.business_area || 'N/A'}
- Created: ${leadData.created_at}

FUNNEL CONTEXT:
- Source Funnel: ${analysisContext.funnel_context?.funnel_name || 'N/A'}
- Description: ${analysisContext.funnel_context?.funnel_description || 'N/A'}
- Is Public: ${analysisContext.funnel_context?.is_public}
- Total Submissions: ${analysisContext.funnel_context?.total_submissions || 0}

SUBMISSION HISTORY (${analysisContext.submission_history?.length || 0} submissions):
${JSON.stringify(analysisContext.submission_history, null, 2)}

INTERACTION HISTORY (${analysisContext.interaction_history?.length || 0} interactions):
${JSON.stringify(analysisContext.interaction_history, null, 2)}

BUSINESS CONTEXT:
${JSON.stringify(analysisContext.business_context, null, 2)}

Provide a comprehensive analysis in JSON format with these exact fields:
{
  "summary": "Brief executive summary of the lead analysis",
  "lead_temperature": "hot|warm|cold",
  "priority_level": "high|medium|low",
  "total_score": number (0-100),
  "engagement_score": number (0-100),
  "conversion_probability": number (0-1),
  "confidence_score": number (0-1),
  "personalization_level": "basic|intermediate|advanced",
  "next_action_recommendation": "specific next action to take",
  
  "funnel_context": {
    "funnel_effectiveness": "analysis of funnel performance",
    "submission_quality": "quality assessment of submissions",
    "engagement_timeline": "timeline analysis",
    "conversion_indicators": ["list of positive indicators"]
  },
  
  "behavioral_analysis": {
    "engagement_level": "high|medium|low",
    "response_speed": number (hours),
    "form_completion_rate": number (0-1),
    "session_duration": number (minutes),
    "interaction_patterns": ["list of patterns observed"]
  },
  
  "engagement_patterns": {
    "preferred_contact_times": ["list of optimal times"],
    "device_preferences": ["mobile", "desktop", "tablet"],
    "communication_style": "formal|casual|technical",
    "channel_preferences": ["email", "phone", "chat"]
  },
  
  "predictive_insights": {
    "conversion_likelihood": number (0-1),
    "best_approach": "recommended approach strategy",
    "potential_objections": ["list of likely objections"],
    "success_factors": ["factors that increase success probability"]
  },
  
  "personalized_strategy": {
    "recommended_approach": "detailed approach recommendation",
    "messaging_tone": "recommended tone for communication",
    "priority_pain_points": ["list of pain points to address"],
    "value_propositions": ["relevant value propositions"],
    "next_actions": ["list of specific next actions"]
  },
  
  "optimal_contact_timing": {
    "best_days": ["Monday", "Tuesday", etc.],
    "best_times": ["morning", "afternoon", "evening"],
    "frequency_recommendation": "how often to contact",
    "channel_preferences": ["preferred communication channels"]
  },
  
  "scoring": {
    "demographic_score": number (0-100),
    "behavioral_score": number (0-100),
    "engagement_score": number (0-100),
    "timing_score": number (0-100),
    "context_score": number (0-100),
    "breakdown": {
      "demographics": "explanation of demographic scoring",
      "behavior": "explanation of behavioral scoring",
      "engagement": "explanation of engagement scoring",
      "timing": "explanation of timing scoring",
      "context": "explanation of context scoring"
    },
    "factors": {
      "positive": ["list of positive factors"],
      "negative": ["list of negative factors"],
      "neutral": ["list of neutral factors"]
    },
    "improvements": ["list of suggestions to improve lead score"]
  },
  
  "predictive": {
    "conversion_probability": number (0-1),
    "lifetime_value": number (estimated revenue),
    "churn_risk": number (0-1),
    "contact_window": {
      "optimal_days": ["list of days"],
      "optimal_hours": ["list of hours"],
      "urgency_level": "high|medium|low"
    },
    "engagement_forecast": {
      "next_7_days": number (0-1),
      "next_30_days": number (0-1),
      "next_90_days": number (0-1)
    },
    "market_trends": {
      "industry_health": "analysis of industry trends",
      "seasonal_factors": "seasonal considerations",
      "competitive_landscape": "competitive analysis"
    },
    "predicted_actions": ["list of likely actions the lead will take"],
    "confidence_intervals": {
      "conversion_min": number,
      "conversion_max": number,
      "confidence_level": number
    }
  }
}

Focus on actionable insights and be specific with recommendations. Consider the Italian business context and provide analysis in Italian where appropriate.
`;

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert lead analyst and sales strategist. Provide comprehensive, actionable insights for lead conversion optimization. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.statusText}`);
    }

    const openAIData = await openAIResponse.json();
    let analysisResult;

    try {
      analysisResult = JSON.parse(openAIData.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      // Fallback analysis
      analysisResult = {
        summary: "Analisi completata con dati limitati",
        lead_temperature: "warm",
        priority_level: "medium",
        total_score: 50,
        engagement_score: 50,
        conversion_probability: 0.3,
        confidence_score: 0.7,
        personalization_level: "basic",
        next_action_recommendation: "Contattare il lead per qualificare l'interesse",
        funnel_context: {},
        behavioral_analysis: {},
        engagement_patterns: {},
        predictive_insights: {},
        personalized_strategy: {},
        optimal_contact_timing: {},
        scoring: {
          demographic_score: 50,
          behavioral_score: 50,
          engagement_score: 50,
          timing_score: 50,
          context_score: 50,
          breakdown: {},
          factors: {},
          improvements: []
        },
        predictive: {
          conversion_probability: 0.3,
          lifetime_value: 1000,
          churn_risk: 0.2,
          contact_window: {},
          engagement_forecast: {},
          market_trends: {},
          predicted_actions: [],
          confidence_intervals: {}
        }
      };
    }

    console.log('Enhanced analysis completed successfully');

    return new Response(
      JSON.stringify(analysisResult),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in enhanced lead analysis:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Errore durante l\'analisi del lead',
        details: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
