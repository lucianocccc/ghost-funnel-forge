
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

    // Ottenere informazioni sui funnel esistenti dell'utente per contesto
    const { data: existingFunnels } = await supabase
      .from('funnels')
      .select('name, description, target_audience, industry')
      .eq('created_by', user.id)
      .limit(5);

    // Ottenere template disponibili per raccomandazioni
    const { data: templates } = await supabase
      .from('funnel_templates')
      .select('name, description, category, industry')
      .limit(10);

    const existingFunnelsContext = existingFunnels && existingFunnels.length > 0 
      ? `\n\nFunnel esistenti dell'utente:\n${existingFunnels.map(f => `- ${f.name}: ${f.description || 'Nessuna descrizione'}`).join('\n')}`
      : '';

    const templatesContext = templates && templates.length > 0 
      ? `\n\nTemplate disponibili:\n${templates.map(t => `- ${t.name} (${t.category}): ${t.description || 'Nessuna descrizione'}`).join('\n')}`
      : '';

    let systemPrompt = '';
    
    if (!currentInterview) {
      // Primo messaggio - inizia l'intervista per la creazione funnel
      systemPrompt = `Sei un esperto consulente di marketing digitale e funnel specializzato nell'aiutare ${user.email} a creare funnel di vendita personalizzati e performanti. ${testModeNote}${existingFunnelsContext}${templatesContext}

La tua missione è:
1. Capire se l'utente preferisce un funnel da template esistente o uno completamente personalizzato
2. Condurre un'intervista mirata per scoprire:
   - Il settore/industria di interesse dell'utente
   - Il target audience che vogliono raggiungere  
   - I loro obiettivi di business principali
   - Il tipo di prodotto/servizio da vendere
   - Il budget disponibile e le tempistiche
   - Le loro competenze e risorse attuali

IMPORTANTE: 
- Conduci l'intervista in modo conversazionale, facendo UNA domanda alla volta
- Se l'utente menziona "template" o "preconfezionato", suggerisci i template appropriati dal catalogo disponibile
- Se l'utente sceglie "personalizzato", conduci un'intervista dettagliata
- Mantieni un tono professionale ma amichevole
- Rispondi sempre in italiano

Inizia chiedendo se preferiscono un funnel da template o uno personalizzato, e poi prosegui di conseguenza.`;
    } else {
      // Intervista in corso - continua a raccogliere informazioni
      const interviewData = currentInterview.interview_data || {};
      const completedFields = Object.keys(interviewData).length;
      
      if (completedFields >= 5) {
        // Abbastanza informazioni raccolte - genera i funnel
        systemPrompt = `Hai raccolto abbastanza informazioni sull'utente per creare funnel personalizzati. Ora genera ESATTAMENTE 3 funnel diversi e ottimizzati basati sui dati raccolti:

Dati utente:
${JSON.stringify(interviewData, null, 2)}${existingFunnelsContext}${templatesContext}

ISTRUZIONI PRECISE:
Per ogni funnel, crea una proposta completa e diversificata che includa:
- Nome accattivante e specifico (max 50 caratteri)
- Descrizione dettagliata che evidenzi i benefici unici (2-3 frasi)
- Target audience ultra-specifico con demografiche e psicografiche
- Industria/settore di riferimento
- 5 step principali del funnel con descrizioni dettagliate e specifiche
- Strategia di distribuzione e implementazione pratica

Presenta i 3 funnel in questo formato ESATTO (rispetta la formattazione):

**FUNNEL 1: [Nome del Funnel]**
Descrizione: [Descrizione dettagliata che evidenzi i benefici unici]
Target: [Target audience ultra-specifico con dettagli demografici e psicografici]
Industria: [Settore/industria specifica]

Step del funnel:
1. [Nome Step Specifico] - [Descrizione dettagliata dell'azione e dell'obiettivo]
2. [Nome Step Specifico] - [Descrizione dettagliata dell'azione e dell'obiettivo]
3. [Nome Step Specifico] - [Descrizione dettagliata dell'azione e dell'obiettivo]
4. [Nome Step Specifico] - [Descrizione dettagliata dell'azione e dell'obiettivo]
5. [Nome Step Specifico] - [Descrizione dettagliata dell'azione e dell'obiettivo]

Strategia: [Strategia di distribuzione specifica con canali, budget suggerito e timeline]

---

**FUNNEL 2: [Nome del Funnel Diverso]**
Descrizione: [Descrizione completamente diversa dal primo]
Target: [Target diverso o segmento specifico]
Industria: [Settore/industria]

Step del funnel:
1. [Nome Step] - [Descrizione dettagliata]
2. [Nome Step] - [Descrizione dettagliata]
3. [Nome Step] - [Descrizione dettagliata]
4. [Nome Step] - [Descrizione dettagliata]
5. [Nome Step] - [Descrizione dettagliata]

Strategia: [Strategia di distribuzione diversa dal primo]

---

**FUNNEL 3: [Nome del Funnel Diverso]**
Descrizione: [Descrizione completamente diversa dai precedenti]
Target: [Target diverso o approccio innovativo]
Industria: [Settore/industria]

Step del funnel:
1. [Nome Step] - [Descrizione dettagliata]
2. [Nome Step] - [Descrizione dettagliata]
3. [Nome Step] - [Descrizione dettagliata]
4. [Nome Step] - [Descrizione dettagliata]
5. [Nome Step] - [Descrizione dettagliata]

Strategia: [Strategia di distribuzione innovativa]

Conclude SEMPRE con: "Quale di questi funnel ti interessa di più? Posso personalizzarlo ulteriormente o generarne di nuovi basati su specifiche diverse!"

Assicurati che ogni funnel sia UNICO e offra un approccio diverso al business dell'utente.
Rispondi sempre in italiano.`;
      } else {
        // Continua l'intervista
        systemPrompt = `Continua l'intervista per la creazione del funnel personalizzato. Hai già raccolto:
${JSON.stringify(interviewData, null, 2)}${existingFunnelsContext}${templatesContext}

Fai UNA domanda specifica alla volta per ottenere informazioni mancanti su:
- Settore/industria specifico (se non presente)
- Target audience dettagliato con demografiche (se non presente)  
- Obiettivi di business e KPI specifici (se non presente)
- Tipo di prodotto/servizio da vendere (se non presente)
- Budget disponibile per marketing (se non presente)
- Tempistiche di implementazione (se non presente)
- Competenze tecniche e risorse del team (se non presente)

Mantieni un tono conversazionale e professionale. 
Approfondisci le risposte dell'utente con domande di follow-up quando necessario.
Rispondi sempre in italiano.`;
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
        max_tokens: 2000,
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
      // Aggiornare l'intervista esistente con nuove informazioni estratte intelligentemente
      const interviewData = currentInterview.interview_data || {};
      
      // Logica migliorata per estrarre informazioni chiave dal messaggio dell'utente
      const lowerMessage = userMessage.toLowerCase();
      
      // Estrazione intelligente delle informazioni
      if (!interviewData.preferenza && (lowerMessage.includes('template') || lowerMessage.includes('personalizzato'))) {
        interviewData.preferenza = lowerMessage.includes('template') ? 'template' : 'personalizzato';
      }
      
      if (!interviewData.settore && (lowerMessage.includes('settore') || lowerMessage.includes('industria') || lowerMessage.includes('campo') || lowerMessage.includes('business'))) {
        interviewData.settore = userMessage;
      }
      
      if (!interviewData.target && (lowerMessage.includes('target') || lowerMessage.includes('clienti') || lowerMessage.includes('audience') || lowerMessage.includes('customer'))) {
        interviewData.target = userMessage;
      }
      
      if (!interviewData.obiettivi && (lowerMessage.includes('obiettivo') || lowerMessage.includes('goal') || lowerMessage.includes('scopo') || lowerMessage.includes('vendere'))) {
        interviewData.obiettivi = userMessage;
      }
      
      if (!interviewData.prodotto && (lowerMessage.includes('prodotto') || lowerMessage.includes('servizio') || lowerMessage.includes('offro') || lowerMessage.includes('vendo'))) {
        interviewData.prodotto = userMessage;
      }
      
      if (!interviewData.budget && (lowerMessage.includes('budget') || lowerMessage.includes('euro') || lowerMessage.includes('€') || lowerMessage.includes('spesa'))) {
        interviewData.budget = userMessage;
      }
      
      if (!interviewData.tempistiche && (lowerMessage.includes('tempo') || lowerMessage.includes('mesi') || lowerMessage.includes('settimane') || lowerMessage.includes('quando'))) {
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

      // Parsing migliorato dei funnel dalla risposta AI
      const funnelSections = aiResponse.split('**FUNNEL ').slice(1);
      
      for (let i = 0; i < Math.min(3, funnelSections.length); i++) {
        const section = funnelSections[i];
        const lines = section.split('\n').filter(line => line.trim());
        
        const nameMatch = lines[0]?.match(/^(\d+): (.+)\*\*/);
        const funnelName = nameMatch ? nameMatch[2] : `Funnel AI ${i + 1}`;
        
        const descriptionLine = lines.find(line => line.startsWith('Descrizione:'));
        const targetLine = lines.find(line => line.startsWith('Target:'));
        const industryLine = lines.find(line => line.startsWith('Industria:'));
        const strategyLine = lines.find(line => line.startsWith('Strategia:'));
        
        const funnelData = {
          name: funnelName,
          description: descriptionLine ? descriptionLine.replace('Descrizione:', '').trim() : '',
          target_audience: targetLine ? targetLine.replace('Target:', '').trim() : '',
          industry: industryLine ? industryLine.replace('Industria:', '').trim() : '',
          steps: lines.filter(line => /^\d+\./.test(line.trim())),
          strategy: strategyLine ? strategyLine.replace('Strategia:', '').trim() : '',
          created_by_ai: true,
          interview_data: currentInterview.interview_data
        };

        // Salvare il funnel nel sistema unificato
        await supabase
          .from('ai_generated_funnels')
          .insert({
            user_id: user.id,
            name: funnelName,
            description: funnelData.description,
            funnel_data: funnelData,
            session_id: currentSessionId,
            source: 'chatbot',
            is_from_chatbot: true,
            interview_id: currentInterview.id,
            is_active: false
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
