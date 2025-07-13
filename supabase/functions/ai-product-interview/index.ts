
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionId, userId, conversationHistory } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key non configurata');
    }

    // Inizializza Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    // Sistema di prompt intelligente per l'intervista del prodotto
    const systemPrompt = `Sei un AI Product Discovery Specialist esperto. 
    La tua missione è condurre un'intervista approfondita per scoprire tutto sul prodotto/servizio dell'utente.

    OBIETTIVI:
    1. Identificare prodotto, benefici unici, target audience
    2. Capire positioning, competitor, obiettivi business 
    3. Scoprire pain points del target e come il prodotto li risolve
    4. Determinare strategia di conversione ottimale

    STILE DI INTERVISTA:
    - Fai UNA domanda alla volta, specifica e mirata
    - Usa emojis e linguaggio coinvolgente
    - Segui il flusso naturale della conversazione
    - Approfondisci quando necessario
    - Mantieni un tono professionale ma amichevole

    FASI DELL'INTERVISTA:
    1. PRODOTTO: Cosa vendi? A chi? Perché è unico?
    2. TARGET: Chi è il cliente ideale? Quali problemi ha?
    3. MERCATO: Come ti posizioni? Chi sono i competitor?
    4. OBIETTIVI: Cosa vuoi ottenere? Quali metriche contano?
    5. CONVERSIONE: Come preferiresti acquisire lead?

    Dopo 8-12 scambi significativi, concludi l'intervista con un riepilogo.

    IMPORTANTE: 
    - Non fare domande generiche
    - Personalizza in base alle risposte precedenti
    - Scava per trovare il vero valore unico
    - Identifica insights nascosti

    Rispondi sempre in italiano e mantieni il focus sulla scoperta del prodotto.`;

    // Costruisci il contesto della conversazione
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    console.log('Chiamata OpenAI per intervista prodotto...');
    
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 800,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`OpenAI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const response = aiData.choices[0].message.content;

    // Analizza il progresso dell'intervista
    let progress = Math.min((conversationHistory.length / 12) * 100, 95);
    let insights: string[] = [];
    let isComplete = false;
    let productData = null;

    // Estrai insights dalla conversazione
    if (conversationHistory.length > 2) {
      const analysisPrompt = `Analizza questa conversazione di product discovery e estrai:
      1. Insights chiave sul prodotto
      2. Caratteristiche del target audience  
      3. Opportunità di mercato identificate
      
      Conversazione: ${JSON.stringify(conversationHistory.slice(-4))}
      
      Rispondi con un JSON: {"insights": ["insight1", "insight2"], "progress": number}`;

      try {
        const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: analysisPrompt }],
            temperature: 0.3,
            max_tokens: 300
          }),
        });

        if (analysisResponse.ok) {
          const analysisData = await analysisResponse.json();
          const analysisContent = analysisData.choices[0].message.content;
          
          try {
            const parsedAnalysis = JSON.parse(analysisContent);
            insights = parsedAnalysis.insights || [];
            if (parsedAnalysis.progress) {
              progress = Math.max(progress, parsedAnalysis.progress);
            }
          } catch (e) {
            console.log('Could not parse analysis JSON');
          }
        }
      } catch (e) {
        console.log('Analysis request failed:', e);
      }
    }

    // Controlla se l'intervista è completa
    if (conversationHistory.length >= 10 || response.toLowerCase().includes('riepilogo') || response.toLowerCase().includes('completa')) {
      isComplete = true;
      progress = 100;

      // Genera dati strutturati del prodotto
      const productExtractionPrompt = `Basandoti su questa intervista, estrai i dati strutturati del prodotto:

      Conversazione completa: ${JSON.stringify(conversationHistory)}

      Rispondi con un JSON strutturato:
      {
        "productName": "nome del prodotto",
        "description": "descrizione breve",
        "category": "categoria",
        "targetAudience": {
          "primary": "descrizione target primario",
          "age": "fascia età",
          "industry": "settore",
          "painPoints": ["problema1", "problema2"]
        },
        "uniqueValue": "proposta di valore unica",
        "keyBenefits": ["beneficio1", "beneficio2"],
        "competitors": ["competitor1", "competitor2"],
        "businessGoals": ["obiettivo1", "obiettivo2"]
      }`;

      try {
        const extractionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: productExtractionPrompt }],
            temperature: 0.2,
            max_tokens: 1000
          }),
        });

        if (extractionResponse.ok) {
          const extractionData = await extractionResponse.json();
          try {
            productData = JSON.parse(extractionData.choices[0].message.content);
          } catch (e) {
            console.log('Could not parse product data JSON');
          }
        }
      } catch (e) {
        console.log('Product extraction failed:', e);
      }
    }

    // Salva la conversazione nel database
    try {
      await supabase
        .from('chatbot_conversations')
        .insert({
          user_id: userId,
          session_id: sessionId,
          message_role: 'user',
          message_content: message,
          metadata: { type: 'product_interview', progress, insights }
        });

      await supabase
        .from('chatbot_conversations')
        .insert({
          user_id: userId,
          session_id: sessionId,
          message_role: 'assistant',
          message_content: response,
          metadata: { type: 'product_interview', progress, isComplete, productData }
        });
    } catch (dbError) {
      console.error('Database save error:', dbError);
    }

    return new Response(JSON.stringify({
      response,
      progress,
      insights,
      isComplete,
      productData,
      analysis: { sessionId, messageCount: conversationHistory.length + 1 }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in AI product interview:', error);
    
    return new Response(JSON.stringify({
      error: error.message || 'Errore interno del server',
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
