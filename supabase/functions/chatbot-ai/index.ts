
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

    // Recuperare la cronologia delle conversazioni per questa sessione
    const { data: conversationHistory } = await supabase
      .from('chatbot_conversations')
      .select('message_role, message_content')
      .eq('user_id', user.id)
      .eq('session_id', sessionId || 'default')
      .order('created_at', { ascending: true })
      .limit(20); // Limitare a 20 messaggi per gestire il token limit

    // Costruire il prompt di sistema personalizzato
    const testModeNote = FREE_FOR_ALL_MODE ? 
      "\n\n🎯 MODALITÀ TEST GRATUITA ATTIVA: Tutte le funzionalità premium sono temporaneamente disponibili per tutti gli utenti per scopi di test e miglioramento del servizio." : "";

    const personalizedPrompt = `Sei un assistente AI specializzato nel marketing digitale e nella creazione di funnel per ${user.email}. ${testModeNote}

Informazioni del profilo utente:
- Settore di interesse: ${userProfile?.business_sector || 'Non specificato'}
- Target audience: ${userProfile?.target_audience || 'Non specificato'}
- Obiettivi: ${JSON.stringify(userProfile?.goals || {})}
- Numero di conversazioni precedenti: ${userProfile?.conversation_count || 0}

Il tuo obiettivo è scoprire gli interessi, le passioni e le attività dell'utente per poi generare suggerimenti per funnel personalizzati.

Fai domande mirate per capire:
1. Il settore/industria di interesse (se non già specificato)
2. Il target audience che vogliono raggiungere
3. I loro obiettivi di business
4. Le loro competenze e passioni
5. Il tipo di contenuto che preferiscono creare

Mantieni un tono amichevole e professionale. Considera la cronologia delle conversazioni precedenti per fornire consigli coerenti e personalizzati.

Quando hai raccolto abbastanza informazioni, genera automaticamente 3 suggerimenti di funnel specifici e dettagliati.

Ogni funnel dovrebbe includere:
- Nome del funnel
- Obiettivo specifico
- Target audience
- 3-4 step principali del funnel
- Tipo di contenuto consigliato
- Strategia di distribuzione

Rispondi sempre in italiano.`;

    // Combinare la cronologia esistente con i nuovi messaggi
    const allMessages = [
      { role: 'system' as const, content: personalizedPrompt },
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
        max_tokens: 1000,
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
      testMode: FREE_FOR_ALL_MODE
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
