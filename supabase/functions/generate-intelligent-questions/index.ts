
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
    const { baseQuestions, context, intelligenceLevel } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key non configurata');
    }

    const prompt = `Genera domande intelligenti per product discovery basate su queste domande base:

${JSON.stringify(baseQuestions, null, 2)}

Crea domande aggiuntive che:
1. Scavano più a fondo nei pain points del cliente
2. Identificano opportunità di mercato uniche
3. Rivelano il vero valore del prodotto
4. Comprendono il processo decisionale del target
5. Identificano trigger emotivi e razionali

Rispondi con JSON:
{
  "questions": [
    {
      "id": "unique_id",
      "question": "Domanda specifica e intelligente",
      "type": "text|textarea|select|multiselect|scale",
      "options": ["opzione1", "opzione2"] // se applicabile,
      "required": true|false,
      "category": "product|market|audience|goals",
      "aiContext": "Contesto per l'AI per usare questa risposta",
      "followUp": "Domanda di follow-up condizionale"
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
          { role: 'system', content: 'Sei un esperto di product discovery e market research. Crei domande intelligenti che rivelano insights profondi. Rispondi SOLO con JSON valido.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      }),
    });

    const data = await response.json();
    let questionsData;
    
    try {
      const rawContent = data.choices[0].message.content;
      const cleanContent = rawContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
      questionsData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Errore nel parsing:', parseError);
      // Fallback con domande base
      questionsData = { questions: baseQuestions };
    }

    return new Response(JSON.stringify(questionsData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Errore nella generazione delle domande:', error);
    
    return new Response(JSON.stringify({
      error: error.message || 'Errore interno del server',
      questions: [] // Fallback vuoto
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
