
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  userInfo?: {
    name?: string;
    email?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userInfo }: ChatRequest = await req.json();

    const systemPrompt = `Sei un assistente AI specializzato nel marketing digitale e nella creazione di funnel. Il tuo obiettivo è scoprire gli interessi, le passioni e le attività dell'utente per poi generare suggerimenti per 3 funnel personalizzati.

Fai domande mirate per capire:
1. Il settore/industria di interesse
2. Il target audience che vogliono raggiungere  
3. I loro obiettivi di business
4. Le loro competenze e passioni
5. Il tipo di contenuto che preferiscono creare

Mantieni un tono amichevole e professionale. Fai una domanda alla volta e approfondisci le risposte. Quando hai raccolto abbastanza informazioni (dopo 4-6 scambi), genera automaticamente 3 suggerimenti di funnel specifici e dettagliati basati sui loro interessi.

Ogni funnel dovrebbe includere:
- Nome del funnel
- Obiettivo specifico
- Target audience
- 3-4 step principali del funnel
- Tipo di contenuto consigliato
- Strategia di distribuzione

Rispondi sempre in italiano.`;

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
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      message: aiResponse,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chatbot-ai function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
