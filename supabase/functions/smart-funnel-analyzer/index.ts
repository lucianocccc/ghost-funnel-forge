import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyzerRequest {
  initialPrompt: string;
  userId?: string;
}

interface GeneratedQuestion {
  id: string;
  question: string;
  context: string;
  required: boolean;
}

interface PromptAnalysis {
  missingInfo: string[];
  questions: GeneratedQuestion[];
  readyToGenerate: boolean;
  confidence: number;
}

async function getSecret(secretName: string): Promise<string> {
  const secret = Deno.env.get(secretName);
  if (!secret) {
    throw new Error(`Secret ${secretName} not found`);
  }
  return secret;
}

async function analyzePromptWithAI(prompt: string): Promise<PromptAnalysis> {
  const openaiKey = await getSecret('OPENAI_API_KEY');
  
  const analysisPrompt = `Analizza questo prompt per la generazione di un funnel di marketing e determina quali informazioni mancano.

PROMPT DA ANALIZZARE:
"${prompt}"

INFORMAZIONI RICHIESTE PER UN FUNNEL COMPLETO:
1. Nome del business/brand
2. Tipo di business/settore
3. Descrizione prodotto/servizio
4. Target audience specifico
5. Tone of voice/personalità brand
6. Obiettivo del funnel (vendita, lead generation, etc.)
7. Pain points del target
8. USP (Unique Selling Proposition)
9. Budget range (opzionale)
10. Tempistiche (opzionale)

COMPITO:
1. Identifica quali informazioni sono GIÀ presenti nel prompt
2. Identifica quali informazioni MANCANO e sono essenziali
3. Genera MASSIMO 5 domande conversazionali per raccogliere le info mancanti
4. Le domande devono essere naturali, non robotiche
5. Ordina per importanza (le più critiche prima)

FORMATO RISPOSTA (JSON valido):
{
  "missingInfo": ["lista delle info mancanti"],
  "questions": [
    {
      "id": "q1",
      "question": "Domanda conversazionale naturale?",
      "context": "Perché questa info è importante",
      "required": true/false
    }
  ],
  "readyToGenerate": true/false,
  "confidence": 0.0-1.0
}

REGOLE:
- Se il prompt è già completo (confidence > 0.8), metti readyToGenerate = true
- Le domande devono sembrare una conversazione naturale
- Massimo 5 domande, meglio se meno
- Concentrati sulle info più critiche
- Se mancano troppe info fondamentali, confidence basso

Rispondi SOLO con il JSON valido:`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { role: 'system', content: 'Sei un esperto di marketing che analizza prompt per funnel. Rispondi sempre con JSON valido.' },
        { role: 'user', content: analysisPrompt }
      ],
      temperature: 0.3,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    // Estrai JSON dal contenuto
    let cleanContent = content.trim();
    const jsonStart = cleanContent.indexOf('{');
    const jsonEnd = cleanContent.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
    }
    
    const analysis = JSON.parse(cleanContent) as PromptAnalysis;
    
    // Valida la struttura
    if (!analysis.questions || !Array.isArray(analysis.questions)) {
      throw new Error('Invalid analysis structure');
    }
    
    // Aggiungi ID univoci se mancano
    analysis.questions = analysis.questions.map((q, index) => ({
      ...q,
      id: q.id || `q${index + 1}`
    }));
    
    return analysis;
    
  } catch (parseError) {
    console.error('JSON parse error:', parseError);
    console.error('Original content:', content);
    
    // Fallback analysis
    return {
      missingInfo: ['target_audience', 'business_type', 'value_proposition'],
      questions: [
        {
          id: 'q1',
          question: 'Potresti dirmi di più sul tuo target audience? Chi sono esattamente le persone che vuoi raggiungere?',
          context: 'Il target audience è fondamentale per creare messaggi efficaci',
          required: true
        },
        {
          id: 'q2',
          question: 'Che tipo di business è? E qual è la tua proposta di valore unica?',
          context: 'Capire il settore e il valore unico aiuta a posizionare meglio il funnel',
          required: true
        }
      ],
      readyToGenerate: false,
      confidence: 0.3
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: AnalyzerRequest = await req.json();
    
    if (!request.initialPrompt || request.initialPrompt.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: 'Prompt troppo breve. Fornisci più dettagli.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔍 Analizzando prompt:', {
      prompt: request.initialPrompt.substring(0, 100) + '...',
      userId: request.userId
    });

    const analysis = await analyzePromptWithAI(request.initialPrompt);

    console.log('✅ Analisi completata:', {
      missingInfoCount: analysis.missingInfo.length,
      questionsCount: analysis.questions.length,
      readyToGenerate: analysis.readyToGenerate,
      confidence: analysis.confidence
    });

    // Salva l'analisi nel database per tracking
    if (request.userId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      try {
        await supabase
          .from('smart_funnel_sessions')
          .insert({
            user_id: request.userId,
            initial_prompt: request.initialPrompt,
            analysis_result: analysis,
            session_status: analysis.readyToGenerate ? 'ready' : 'questioning'
          });
      } catch (dbError) {
        console.error('Errore salvataggio sessione:', dbError);
        // Non blocca la risposta se il salvataggio fallisce
      }
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Errore in smart-funnel-analyzer:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});