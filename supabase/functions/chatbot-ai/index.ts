
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// MODALITÀ TEST: Impostare a true per disattivare controlli premium
const FREE_FOR_ALL_MODE = true;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

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
  sessionId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificare l'autenticazione dell'utente
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ 
        error: 'Authentication required',
        success: false 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ 
        error: 'Invalid authentication',
        success: false 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // In modalità test, bypassa i controlli di abbonamento
    if (!FREE_FOR_ALL_MODE) {
      // Verificare se l'utente ha un abbonamento attivo
      const { data: subscription } = await supabase
        .from('subscribers')
        .select('subscribed, subscription_tier')
        .eq('user_id', user.id)
        .single();

      // Permettere l'accesso solo agli utenti con abbonamento attivo (escluso il piano gratuito)
      if (!subscription?.subscribed || subscription.subscription_tier === 'free') {
        return new Response(JSON.stringify({ 
          error: 'Piano premium richiesto. Aggiorna il tuo abbonamento per accedere al chatbot AI.',
          success: false,
          requiresUpgrade: true
        }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const { messages, sessionId }: ChatRequest = await req.json();
    
    // Ottenere o creare il profilo del chatbot per l'utente
    let { data: userProfile } = await supabase
      .from('chatbot_user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!userProfile) {
      // Creare un nuovo profilo se non esiste
      const { data: newProfile, error: profileError } = await supabase
        .from('chatbot_user_profiles')
        .insert({
          user_id: user.id,
          conversation_count: 0
        })
        .select()
        .single();

      if (profileError) {
        console.error('Error creating user profile:', profileError);
      } else {
        userProfile = newProfile;
      }
    }

    // Verificare se esiste già un'intervista in corso per questa sessione
    let { data: currentInterview } = await supabase
      .from('chatbot_interviews')
      .select('*')
      .eq('user_id', user.id)
      .eq('session_id', sessionId || 'default')
      .eq('status', 'in_progress')
      .single();

    // Recuperare la cronologia delle conversazioni per questa sessione
    const { data: conversationHistory } = await supabase
      .from('chatbot_conversations')
      .select('message_role, message_content')
      .eq('user_id', user.id)
      .eq('session_id', sessionId || 'default')
      .order('created_at', { ascending: true })
      .limit(20);

    // Costruire il prompt di sistema personalizzato basato sullo stato dell'intervista
    const testModeNote = FREE_FOR_ALL_MODE ? 
      "\n\n🎯 MODALITÀ TEST GRATUITA ATTIVA: Tutte le funzionalità premium sono temporaneamente disponibili per tutti gli utenti per scopi di test e miglioramento del servizio." : "";

    let systemPrompt = '';
    
    if (!currentInterview) {
      // Primo messaggio - inizia l'intervista
      systemPrompt = `Sei un assistente AI specializzato nel marketing digitale e nella creazione di funnel personalizzati per ${user.email}. ${testModeNote}

La tua missione è condurre un'intervista mirata per scoprire:
1. Il settore/industria di interesse dell'utente
2. Il target audience che vogliono raggiungere  
3. I loro obiettivi di business principali
4. Le loro competenze e passioni
5. Il budget disponibile
6. I tempi di realizzazione

IMPORTANTE: Conduci l'intervista in modo conversazionale, facendo UNA domanda alla volta. Non fare mai più di una domanda per messaggio.

Inizia chiedendo qual è il loro settore di interesse o campo in cui vorrebbero sviluppare il loro business.

Mantieni un tono amichevole e professionale. Rispondi sempre in italiano.`;
    } else {
      // Intervista in corso - continua a raccogliere informazioni
      const interviewData = currentInterview.interview_data || {};
      const completedFields = Object.keys(interviewData).length;
      
      if (completedFields >= 5) {
        // Abbastanza informazioni raccolte - genera i funnel
        systemPrompt = `Hai raccolto abbastanza informazioni sull'utente. Ora genera ESATTAMENTE 3 funnel personalizzati basati sui dati raccolti:

Dati utente:
${JSON.stringify(interviewData, null, 2)}

Per ogni funnel, fornisci:
- Nome del funnel (massimo 50 caratteri)
- Descrizione dettagliata (2-3 frasi)
- Target audience specifico
- Industria/settore
- 4-5 step principali del funnel con descrizioni dettagliate
- Strategia di distribuzione consigliata

Presenta i 3 funnel in questo formato ESATTO:

**FUNNEL 1: [Nome]**
Descrizione: [Descrizione]
Target: [Target audience]
Industria: [Settore]

Step del funnel:
1. [Titolo step] - [Descrizione dettagliata]
2. [Titolo step] - [Descrizione dettagliata]
3. [Titolo step] - [Descrizione dettagliata]
4. [Titolo step] - [Descrizione dettagliata]
5. [Titolo step] - [Descrizione dettagliata]

Strategia: [Strategia di distribuzione]

---

**FUNNEL 2: [Nome]**
[Stesso formato]

---

**FUNNEL 3: [Nome]**
[Stesso formato]

Conclude con: "Quale di questi funnel ti interessa di più? Posso personalizzarlo ulteriormente o generarne di nuovi!"

Rispondi sempre in italiano.`;
      } else {
        // Continua l'intervista
        systemPrompt = `Continua l'intervista per raccogliere informazioni mancanti. Hai già raccolto:
${JSON.stringify(interviewData, null, 2)}

Fai UNA domanda specifica alla volta per ottenere informazioni mancanti su:
- Settore/industria (se non presente)
- Target audience (se non presente)  
- Obiettivi di business (se non presente)
- Budget disponibile (se non presente)
- Tempistiche (se non presente)
- Competenze/passioni (se non presente)

Mantieni un tono conversazionale e naturale. Rispondi sempre in italiano.`;
      }
    }

    // Combinare la cronologia esistente con i nuovi messaggi
    const allMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...(conversationHistory || []).map(msg => ({
        role: msg.message_role as 'user' | 'assistant',
        content: msg.message_content
      })),
      ...messages
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: allMessages,
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Salvare la conversazione nel database
    const currentSessionId = sessionId || crypto.randomUUID();
    
    // Salvare il messaggio dell'utente
    if (messages.length > 0) {
      await supabase
        .from('chatbot_conversations')
        .insert({
          user_id: user.id,
          session_id: currentSessionId,
          message_role: 'user',
          message_content: messages[messages.length - 1].content
        });
    }

    // Salvare la risposta dell'assistente
    await supabase
      .from('chatbot_conversations')
      .insert({
        user_id: user.id,
        session_id: currentSessionId,
        message_role: 'assistant',
        message_content: aiResponse
      });

    // Aggiornare o creare l'intervista in base al contenuto
    const userMessage = messages[messages.length - 1]?.content || '';
    
    if (!currentInterview && userMessage) {
      // Creare una nuova intervista
      await supabase
        .from('chatbot_interviews')
        .insert({
          user_id: user.id,
          session_id: currentSessionId,
          interview_data: {},
          status: 'in_progress'
        });
    } else if (currentInterview && userMessage) {
      // Aggiornare l'intervista esistente con nuove informazioni
      // Semplice estrazione di informazioni dalla risposta dell'utente
      const interviewData = currentInterview.interview_data || {};
      
      // Logica semplice per estrarre informazioni chiave
      const lowerMessage = userMessage.toLowerCase();
      
      if (!interviewData.settore && (lowerMessage.includes('settore') || lowerMessage.includes('industria') || lowerMessage.includes('campo'))) {
        interviewData.settore = userMessage;
      }
      
      if (!interviewData.target && (lowerMessage.includes('target') || lowerMessage.includes('clienti') || lowerMessage.includes('audience'))) {
        interviewData.target = userMessage;
      }
      
      if (!interviewData.obiettivi && (lowerMessage.includes('obiettivo') || lowerMessage.includes('goal') || lowerMessage.includes('scopo'))) {
        interviewData.obiettivi = userMessage;
      }
      
      if (!interviewData.budget && (lowerMessage.includes('budget') || lowerMessage.includes('euro') || lowerMessage.includes('€'))) {
        interviewData.budget = userMessage;
      }
      
      if (!interviewData.tempistiche && (lowerMessage.includes('tempo') || lowerMessage.includes('mesi') || lowerMessage.includes('settimane'))) {
        interviewData.tempistiche = userMessage;
      }

      // Aggiornare l'intervista
      await supabase
        .from('chatbot_interviews')
        .update({
          interview_data: interviewData,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentInterview.id);
    }

    // Verificare se la risposta contiene funnel generati
    const containsFunnels = aiResponse.includes('**FUNNEL 1:') && aiResponse.includes('**FUNNEL 2:') && aiResponse.includes('**FUNNEL 3:');
    
    if (containsFunnels && currentInterview) {
      // Completare l'intervista e generare i funnel
      await supabase
        .from('chatbot_interviews')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', currentInterview.id);

      // Parsing semplice dei funnel dalla risposta AI
      const funnelSections = aiResponse.split('**FUNNEL ').slice(1);
      
      for (let i = 0; i < Math.min(3, funnelSections.length); i++) {
        const section = funnelSections[i];
        const lines = section.split('\n').filter(line => line.trim());
        
        const nameMatch = lines[0]?.match(/^(\d+): (.+)\*\*/);
        const funnelName = nameMatch ? nameMatch[2] : `Funnel ${i + 1}`;
        
        const descriptionLine = lines.find(line => line.startsWith('Descrizione:'));
        const targetLine = lines.find(line => line.startsWith('Target:'));
        const industryLine = lines.find(line => line.startsWith('Industria:'));
        
        const funnelData = {
          name: funnelName,
          description: descriptionLine ? descriptionLine.replace('Descrizione:', '').trim() : '',
          target_audience: targetLine ? targetLine.replace('Target:', '').trim() : '',
          industry: industryLine ? industryLine.replace('Industria:', '').trim() : '',
          steps: lines.filter(line => /^\d+\./.test(line.trim())),
          strategy: lines.find(line => line.startsWith('Strategia:'))?.replace('Strategia:', '').trim() || ''
        };

        // Salvare il funnel generato
        await supabase
          .from('chatbot_generated_funnels')
          .insert({
            interview_id: currentInterview.id,
            user_id: user.id,
            funnel_name: funnelName,
            funnel_description: funnelData.description,
            target_audience: funnelData.target_audience,
            industry: funnelData.industry,
            funnel_data: funnelData,
            is_saved: false
          });
      }
    }

    // Aggiornare il contatore delle conversazioni e ultima interazione
    await supabase
      .from('chatbot_user_profiles')
      .update({
        conversation_count: (userProfile?.conversation_count || 0) + 1,
        last_interaction: new Date().toISOString()
      })
      .eq('user_id', user.id);

    return new Response(JSON.stringify({ 
      message: aiResponse,
      sessionId: currentSessionId,
      success: true,
      testMode: FREE_FOR_ALL_MODE,
      containsFunnels: containsFunnels
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
