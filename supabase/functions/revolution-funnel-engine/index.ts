import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RevolutionRequest {
  action: 'analyze_customer' | 'generate_questions' | 'create_funnel' | 'optimize_performance' | 'conversational_flow';
  customerData?: any;
  questionResponses?: any;
  funnelData?: any;
  sessionId?: string;
  message?: string;
  conversationState?: any;
  userId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, customerData, questionResponses, funnelData, sessionId, message, conversationState, userId } = await req.json() as RevolutionRequest;
    const authHeader = req.headers.get('Authorization');
    
    console.log('Revolution Engine Request:', { action, userId, hasAuth: !!authHeader });
    
    if (!authHeader) {
      console.error('Missing Authorization header');
      throw new Error('Authorization header required');
    }

    // Get user from auth with better error handling
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError) {
      console.error('Auth error:', authError);
      throw new Error(`Authentication failed: ${authError.message}`);
    }
    
    if (!user) {
      console.error('No user found');
      throw new Error('User not found');
    }
    
    console.log('Authenticated user:', user.id);

    let result;

    switch (action) {
      case 'analyze_customer':
        result = await analyzeCustomer(user.id, customerData);
        break;
      case 'generate_questions':
        result = await generateIntelligentQuestions(user.id, customerData, sessionId);
        break;
      case 'create_funnel':
        result = await createRevolutionFunnel(user.id, customerData, questionResponses);
        break;
      case 'optimize_performance':
        result = await optimizePerformance(user.id, funnelData);
        break;
      case 'conversational_flow':
        result = await handleConversationalFlow(user.id, message!, conversationState!);
        break;
      default:
        throw new Error('Invalid action');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Revolution Engine Error:', error);
    
    // Provide more specific error responses
    let errorMessage = 'An unexpected error occurred';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('Authorization header required')) {
        errorMessage = 'Authentication required';
        statusCode = 401;
      } else if (error.message.includes('Authentication failed') || error.message.includes('User not found')) {
        errorMessage = 'Authentication failed - please log in again';
        statusCode = 401;
      } else if (error.message.includes('OpenAI API key')) {
        errorMessage = 'AI service configuration error';
        statusCode = 503;
      } else if (error.message.includes('JSON')) {
        errorMessage = 'Invalid data format';
        statusCode = 400;
      } else {
        errorMessage = error.message;
      }
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeCustomer(userId: string, customerData: any) {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Deep AI analysis of customer
  const analysisPrompt = `
You are a world-class customer intelligence analyst. Analyze this customer data and create a comprehensive psychological and behavioral profile.

Customer Data: ${JSON.stringify(customerData)}

Provide a detailed analysis including:
1. Psychographic Profile (values, beliefs, lifestyle)
2. Behavioral Patterns (decision-making style, communication preferences)
3. Pain Points (explicit and implicit)
4. Core Motivations (what drives them)
5. Trust Signals (what builds credibility for them)
6. Objection Patterns (likely concerns and resistance points)
7. Conversion Triggers (what motivates action)
8. Communication Style Preferences
9. Intelligence Score (0-100 based on data completeness)

Return as structured JSON.
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { role: 'system', content: 'You are an expert customer intelligence analyst. Always respond with valid JSON.' },
        { role: 'user', content: analysisPrompt }
      ],
      temperature: 0.3,
    }),
  });

  const aiResult = await response.json();
  const content = aiResult.choices[0].message.content;
  // Remove markdown code blocks if present
  const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
  const analysis = JSON.parse(cleanContent);

  // Store customer profile
  const { data: profile, error } = await supabase
    .from('revolution_customer_profiles')
    .upsert({
      user_id: userId,
      customer_data: customerData,
      psychographic_profile: analysis.psychographicProfile || {},
      behavioral_patterns: analysis.behavioralPatterns || {},
      pain_points: analysis.painPoints || [],
      motivations: analysis.motivations || [],
      communication_style: analysis.communicationStyle || {},
      decision_making_pattern: analysis.decisionMakingPattern,
      trust_signals: analysis.trustSignals || [],
      objection_patterns: analysis.objectionPatterns || [],
      conversion_triggers: analysis.conversionTriggers || [],
      intelligence_score: analysis.intelligenceScore || 0,
      profile_completeness: calculateCompleteness(analysis),
      last_updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;

  return { success: true, profile, analysis };
}

async function generateIntelligentQuestions(userId: string, customerData: any, sessionId?: string) {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Get existing customer profile if available
  const { data: existingProfile } = await supabase
    .from('revolution_customer_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Get previous question sequences for learning
  const { data: previousSequences } = await supabase
    .from('revolution_question_sequences')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  const questionPrompt = `
You are an expert at creating intelligent question sequences that extract deep customer insights.

Current Customer Data: ${JSON.stringify(customerData)}
Existing Profile: ${JSON.stringify(existingProfile || {})}
Previous Learning: ${JSON.stringify(previousSequences || [])}

Generate a sequence of 5-8 strategic questions that will:
1. Fill knowledge gaps in the customer profile
2. Uncover hidden pain points and motivations
3. Understand their decision-making process
4. Identify their preferred communication style
5. Discover their objections and trust signals
6. Learn about their buying behavior and triggers

Each question should be:
- Open-ended to encourage detailed responses
- Psychologically insightful
- Building on previous answers
- Designed to reveal subconscious motivations

Return as JSON with this structure:
{
  "questions": [
    {
      "id": "q1",
      "text": "question text",
      "purpose": "what this reveals",
      "followUp": "optional follow-up question",
      "analysisHints": ["what to look for in the answer"]
    }
  ],
  "analysisFramework": "how to interpret responses",
  "intelligenceTargets": ["specific insights to gather"]
}
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { role: 'system', content: 'You are an expert customer psychology analyst. Always respond with valid JSON.' },
        { role: 'user', content: questionPrompt }
      ],
      temperature: 0.4,
    }),
  });

  const aiResult = await response.json();
  const content = aiResult.choices[0].message.content;
  // Remove markdown code blocks if present
  const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
  const questionData = JSON.parse(cleanContent);

  // Store question sequence
  const currentSessionId = sessionId || crypto.randomUUID();
  const { data: sequence, error } = await supabase
    .from('revolution_question_sequences')
    .insert({
      user_id: userId,
      session_id: currentSessionId,
      customer_profile_id: existingProfile?.id,
      question_sequence: questionData.questions,
      current_question_index: 0,
      intelligence_gathered: 0,
      next_questions: questionData.questions
    })
    .select()
    .single();

  if (error) throw error;

  return { 
    success: true, 
    sessionId: currentSessionId,
    questions: questionData.questions,
    analysisFramework: questionData.analysisFramework,
    sequence 
  };
}

async function createRevolutionFunnel(userId: string, customerData: any, questionResponses: any) {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Get customer profile and learning memory
  const { data: profile } = await supabase
    .from('revolution_customer_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  const { data: learningMemory } = await supabase
    .from('revolution_learning_memory')
    .select('*')
    .eq('user_id', userId)
    .order('success_rate', { ascending: false })
    .limit(10);

  const funnelPrompt = `
You are a world-class funnel strategist and conversion copywriter. Create a revolutionary, hyper-personalized funnel based on deep customer intelligence.

Customer Profile: ${JSON.stringify(profile)}
Question Responses: ${JSON.stringify(questionResponses)}
Historical Learning: ${JSON.stringify(learningMemory || [])}

Create a complete funnel that includes:

1. STRATEGIC FOUNDATION:
   - Conversion strategy tailored to their psychology
   - Personalization rules based on their profile
   - Trust-building sequence that matches their signals
   - Objection handling for their specific concerns

2. FUNNEL STRUCTURE:
   - Step-by-step flow optimized for their decision-making pattern
   - Psychological triggers at each stage
   - Micro-commitments that build momentum
   - Exit strategies and re-engagement sequences

3. HYPER-PERSONALIZED COPY:
   - Headlines that speak to their core motivations
   - Body copy in their preferred communication style
   - CTAs that match their decision-making speed
   - Social proof that resonates with their values

4. ADAPTIVE DESIGN SYSTEM:
   - Visual elements that build trust with their personality type
   - Layout optimized for their behavioral patterns
   - Color psychology matching their preferences
   - UX flow that reduces their specific friction points

5. CONVERSION OPTIMIZATION:
   - A/B testing recommendations
   - Performance prediction based on their profile
   - Optimization opportunities
   - Success metrics to track

Return comprehensive JSON with complete funnel specification.
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { role: 'system', content: 'You are a world-class funnel strategist and conversion expert. Always respond with valid JSON.' },
        { role: 'user', content: funnelPrompt }
      ],
      temperature: 0.3,
      max_tokens: 4000,
    }),
  });

  const aiResult = await response.json();
  const content = aiResult.choices[0].message.content;
  // Remove markdown code blocks if present
  const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
  const funnelData = JSON.parse(cleanContent);

  // First create an interactive funnel
  const { data: interactiveFunnel, error: funnelError } = await supabase
    .from('interactive_funnels')
    .insert({
      created_by: userId,
      name: `Revolution Funnel - ${new Date().toLocaleDateString()}`,
      description: funnelData.conversionStrategy?.description || 'AI-generated revolutionary funnel',
      status: 'draft',
      is_public: false,
      views_count: 0,
      submissions_count: 0,
      settings: {
        ai_generated: true,
        revolution_engine: true,
        customer_profile: profile?.id
      }
    })
    .select()
    .single();

  if (funnelError) throw funnelError;

  // Store the revolutionary funnel template linked to interactive funnel
  const { data: template, error } = await supabase
    .from('revolution_funnel_templates')
    .insert({
      user_id: userId,
      interactive_funnel_id: interactiveFunnel.id,
      template_name: `Revolutionary Funnel - ${new Date().toLocaleDateString()}`,
      industry: customerData.industry || 'General',
      customer_profile_match: profile || {},
      funnel_structure: funnelData.funnelStructure || {},
      copy_templates: funnelData.copyTemplates || {},
      design_system: funnelData.designSystem || {},
      conversion_strategy: funnelData.conversionStrategy || {},
      personalization_rules: funnelData.personalizationRules || [],
      performance_score: funnelData.performancePrediction?.score || 85
    })
    .select()
    .single();

  if (error) throw error;

  // Create funnel steps based on the structure
  const defaultSteps = [
    {
      funnel_id: interactiveFunnel.id,
      title: 'Welcome',
      description: 'Tell us about yourself',
      step_type: 'form',
      step_order: 1,
      is_required: true,
      fields_config: [
        { type: 'text', name: 'name', label: 'Your Name', required: true },
        { type: 'email', name: 'email', label: 'Email Address', required: true }
      ],
      settings: { ai_copy: funnelData.copyTemplates?.welcome }
    },
    {
      funnel_id: interactiveFunnel.id,
      title: 'Your Business',
      description: 'Help us understand your business needs',
      step_type: 'form',
      step_order: 2,
      is_required: true,
      fields_config: [
        { type: 'text', name: 'company', label: 'Company Name', required: false },
        { type: 'select', name: 'industry', label: 'Industry', required: true, options: ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Other'] },
        { type: 'textarea', name: 'challenge', label: 'Main Challenge', required: true, placeholder: 'What is your biggest business challenge?' }
      ],
      settings: { ai_copy: funnelData.copyTemplates?.business }
    },
    {
      funnel_id: interactiveFunnel.id,
      title: 'Contact Information',
      description: 'How can we reach you?',
      step_type: 'form',
      step_order: 3,
      is_required: true,
      fields_config: [
        { type: 'tel', name: 'phone', label: 'Phone Number', required: false },
        { type: 'select', name: 'contact_preference', label: 'Preferred Contact Method', required: true, options: ['Email', 'Phone', 'WhatsApp'] },
        { type: 'textarea', name: 'message', label: 'Additional Message', required: false, placeholder: 'Anything else you\'d like us to know?' }
      ],
      settings: { ai_copy: funnelData.copyTemplates?.contact }
    }
  ];

  // Use AI-generated steps if available, otherwise use defaults
  const stepsToCreate = funnelData.funnelStructure?.steps?.length > 0 
    ? funnelData.funnelStructure.steps.map((step: any, index: number) => ({
        funnel_id: interactiveFunnel.id,
        title: step.title || `Step ${index + 1}`,
        description: step.description || '',
        step_type: step.type || 'form',
        step_order: index + 1,
        is_required: step.required !== false,
        fields_config: step.fields || defaultSteps[index]?.fields_config || [],
        settings: {
          ...step.settings,
          ai_copy: step.copy,
          design_elements: step.design
        }
      }))
    : defaultSteps;

  const { error: stepsError } = await supabase
    .from('interactive_funnel_steps')
    .insert(stepsToCreate);

  if (stepsError) {
    console.error('Error creating steps:', stepsError);
    // Don't throw error, just log it
  }

  // Store learning memory for future optimization
  await supabase
    .from('revolution_learning_memory')
    .insert({
      user_id: userId,
      memory_type: 'funnel_creation',
      context_data: { customerProfile: profile, questionResponses },
      learning_data: funnelData,
      confidence_score: 0.85,
      usage_count: 1
    });

  return { 
    success: true, 
    funnel: funnelData,
    template,
    interactiveFunnel,
    performancePrediction: funnelData.performancePrediction 
  };
}

async function handleConversationalFlow(userId: string, message: string, conversationState: any) {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) {
    throw new Error('OpenAI API key not configured');
  }

  console.log('Handling conversational flow:', { userId, messageLength: message.length, phase: conversationState.phase });

  const { phase, collectedData, nextQuestions, completeness } = conversationState;

  // Get existing customer profile if available
  const { data: existingProfile } = await supabase
    .from('revolution_customer_profiles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const conversationPrompt = `
You are an expert AI assistant for creating revolutionary marketing funnels. You're having a natural conversation with a user to gather the information needed to create their perfect funnel.

CONTEXT:
- Current phase: ${phase}
- Information collected so far: ${JSON.stringify(collectedData)}
- User's latest message: "${message}"
- Existing profile: ${JSON.stringify(existingProfile || {})}
- Conversation completeness: ${completeness * 100}%

CONVERSATION RULES:
1. Be conversational, friendly, and natural - like ChatGPT
2. Ask ONE question at a time, not multiple
3. Build on what they've already told you
4. Extract insights organically through conversation
5. When you have enough info (80%+ complete), move to funnel generation

INFORMATION NEEDED (gather naturally through conversation):
- Business type/industry
- Target audience/ideal customer
- Main goal/objective for the funnel
- Current challenges they're facing
- Budget range and timeline
- Their audience's pain points
- What makes them different from competitors
- Their current marketing approach
- Success metrics they care about

RESPONSE REQUIREMENTS:
1. If phase is 'gathering' and completeness < 0.8:
   - Respond naturally to their message
   - Ask a follow-up question to gather more specific info
   - Update collected data
   - Increase completeness score
   
2. If phase is 'gathering' and completeness >= 0.8:
   - Acknowledge you have enough information
   - Change phase to 'generating'
   - Start funnel creation process
   
3. If phase is 'generating':
   - Generate the complete funnel
   - Change phase to 'complete'
   - Return the funnel data

Return JSON in this format:
{
  "response": "Your conversational response to the user",
  "conversationState": {
    "phase": "gathering|generating|complete",
    "collectedData": {...updated data...},
    "nextQuestions": ["potential follow-up questions"],
    "completeness": 0.0-1.0
  },
  "funnel": null or funnel data if complete
}
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { role: 'system', content: 'You are an expert conversational AI for funnel creation. Always respond with valid JSON.' },
        { role: 'user', content: conversationPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  const aiResult = await response.json();
  
  if (!aiResult.choices || !aiResult.choices[0]) {
    console.error('Invalid OpenAI response:', aiResult);
    throw new Error('Invalid AI response format');
  }
  
  const content = aiResult.choices[0].message.content;
  console.log('AI Response content:', content.substring(0, 200) + '...');
  
  // Remove markdown code blocks if present
  const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
  
  let conversationResult;
  try {
    conversationResult = JSON.parse(cleanContent);
  } catch (parseError) {
    console.error('JSON Parse Error:', parseError, 'Content:', cleanContent);
    // Fallback response if AI didn't return valid JSON
    conversationResult = {
      response: "Mi dispiace, ho avuto un problema nel processare la tua richiesta. Puoi riprovare con altre parole?",
      conversationState: {
        ...conversationState,
        phase: 'gathering'
      },
      funnel: null
    };
  }

  // If we're in the generating phase and need to create the funnel
  if (conversationResult.conversationState.phase === 'generating' || conversationResult.conversationState.phase === 'complete') {
    try {
      console.log('Creating funnel with data:', conversationResult.conversationState.collectedData);
      // Create the funnel using the collected data
      const funnelResult = await createRevolutionFunnel(userId, conversationResult.conversationState.collectedData, {});
      conversationResult.funnel = funnelResult.funnel;
      conversationResult.conversationState.phase = 'complete';
      console.log('Funnel created successfully');
    } catch (funnelError) {
      console.error('Funnel creation error:', funnelError);
      // Graceful fallback - continue conversation instead of failing
      conversationResult.response += "\n\nHo raccolto tutte le informazioni necessarie, ma ho avuto un problema nella generazione del funnel. Possiamo riprovare o vuoi modificare qualche dettaglio?";
      conversationResult.conversationState.phase = 'gathering';
      conversationResult.conversationState.completeness = 0.9; // Reset slightly to allow retry
      conversationResult.funnel = null;
    }
  }

  console.log('Conversation result:', { phase: conversationResult.conversationState.phase, hasFunnel: !!conversationResult.funnel });
  return conversationResult;
}

async function optimizePerformance(userId: string, funnelData: any) {
  // Implementation for performance optimization
  // This would analyze current performance and suggest improvements
  return { success: true, optimizations: [], insights: [] };
}

function calculateCompleteness(analysis: any): number {
  const fields = [
    'psychographicProfile',
    'behavioralPatterns', 
    'painPoints',
    'motivations',
    'trustSignals',
    'objectionPatterns',
    'conversionTriggers',
    'communicationStyle'
  ];
  
  const completed = fields.filter(field => 
    analysis[field] && 
    (Array.isArray(analysis[field]) ? analysis[field].length > 0 : Object.keys(analysis[field]).length > 0)
  ).length;
  
  return (completed / fields.length) * 100;
}