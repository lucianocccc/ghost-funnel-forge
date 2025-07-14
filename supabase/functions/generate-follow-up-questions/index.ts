
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { responses, currentQuestions } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key non configurata');
    }

    const prompt = `Basandoti su queste risposte iniziali, genera domande di follow-up intelligenti:

RISPOSTE ATTUALI:
${JSON.stringify(responses, null, 2)}

DOMANDE GIÀ FATTE:
${JSON.stringify(currentQuestions, null, 2)}

Genera 3-5 domande di follow-up che:
1. Approfondiscono aspetti specifici emersi dalle risposte
2. Identificano opportunità non ancora esplorate
3. Chiariscono punti ambigui
4. Rivelano il vero valore del prodotto
5. Comprendono meglio il cliente target

Rispondi con JSON:
{
  "followUpQuestions": [
    {
      "id": "followup_1",
      "question": "Domanda specifica basata sulle risposte",
      "type": "text|textarea|select|multiselect",
      "options": ["opzione1", "opzione2"], // se applicabile
      "required": true|false,
      "category": "product|market|audience|goals",
      "aiContext": "Perché questa domanda è importante",
      "triggeredBy": "question_id_che_ha_scatenato_questa_domanda"
    }
  ]
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
          { role: 'system', content: 'Sei un esperto di product discovery che genera domande di follow-up intelligenti. Rispondi SOLO con JSON valido.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.4,
        max_tokens: 1500
      }),
    });

    const data = await response.json();
    let followUpData;
    
    try {
      const rawContent = data.choices[0].message.content;
      const cleanContent = rawContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
      followUpData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Errore nel parsing delle domande di follow-up:', parseError);
      followUpData = { followUpQuestions: [] };
    }

    return new Response(JSON.stringify(followUpData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Errore nella generazione delle domande di follow-up:', error);
    
    return new Response(JSON.stringify({
      error: error.message || 'Errore interno del server',
      followUpQuestions: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
