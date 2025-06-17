
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

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
  settings?: {
    personality: 'professional' | 'friendly' | 'analytical' | 'creative';
    responseLength: 'concise' | 'detailed' | 'comprehensive';
    specialization: 'marketing' | 'sales' | 'general' | 'technical';
    language: 'italian' | 'english';
    temperature: number;
  };
  attachments?: any[];
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

    const { messages, settings, sessionId, attachments }: ChatRequest = await req.json();
    
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

    // Costruire il prompt di sistema personalizzato per il Deep Thinking
    let personalityStyle = "";
    switch(settings?.personality || 'professional') {
      case 'professional': personalityStyle = "formale e professionale"; break;
      case 'friendly': personalityStyle = "cordiale e conversazionale"; break;
      case 'analytical': personalityStyle = "analitico e dettagliato"; break;
      case 'creative': personalityStyle = "creativo e innovativo"; break;
    }
    
    let responseLengthStyle = "";
    switch(settings?.responseLength || 'detailed') {
      case 'concise': responseLengthStyle = "concise e dirette al punto"; break;
      case 'detailed': responseLengthStyle = "dettagliate con spiegazioni e contesto"; break;
      case 'comprehensive': responseLengthStyle = "complete ed esaustive"; break;
    }
    
    let specializationFocus = "";
    switch(settings?.specialization || 'marketing') {
      case 'marketing': specializationFocus = "strategie di marketing, contenuti e funnel marketing"; break;
      case 'sales': specializationFocus = "tecniche di vendita, conversione e negoziazione"; break;
      case 'technical': specializationFocus = "implementazioni tecniche, integrazioni e soluzioni pratiche"; break;
      case 'general': specializationFocus = "una combinazione di marketing, vendite e aspetti tecnici"; break;
    }
    
    const language = settings?.language || 'italian';
    
    const deepThinkingPrompt = `Sei un assistente AI specializzato in ${specializationFocus}, con un approccio di pensiero profondo, logico e strutturato.

METODO DI ANALISI DEEP THINKING:
1. Analizza prima attentamente la domanda o il problema dell'utente
2. Suddividi il problema in componenti chiave 
3. Considera diverse prospettive e angolazioni
4. Elabora il tuo ragionamento passo dopo passo, in modo esplicito
5. Valuta i pro e i contro di ciascuna soluzione o direzione
6. Fornisci conclusioni concrete basate sull'analisi

Il tuo stile comunicativo è ${personalityStyle}, con risposte ${responseLengthStyle}.

Informazioni dell'utente:
- Email: ${user.email}
- Numero di conversazioni passate: ${userProfile?.conversation_count || 0}
- Settore di interesse: ${userProfile?.business_sector || 'Non specificato'}

IMPORTANTE: 
- Rispondi esclusivamente in ${language === 'italian' ? 'italiano' : 'inglese'}
- Evita risposte generiche
- Fornisci sia un'analisi profonda che consigli pratici e azionabili
- Includi chiaramente una sezione iniziale che identifica i punti chiave e una sezione finale con le conclusioni

Quando presenti la tua risposta:
1. Usa intestazioni e sottointestazioni per organizzare la risposta
2. Utilizza elenchi puntati o numerati per i passaggi o punti chiave
3. Evidenzia le conclusioni più importanti
4. Suggerisci passaggi concreti da intraprendere in base all'analisi

Inizia sempre con un'analisi iniziale del problema, poi passa all'approfondimento, e termina con conclusioni e consigli pratici.`;

    // Se ci sono allegati, creaiamo un prompt che li descrive
    let attachmentContent = '';
    if (attachments && attachments.length > 0) {
      attachmentContent = "L'utente ha condiviso i seguenti file:\n\n";
      attachments.forEach((file, index) => {
        attachmentContent += `File ${index + 1}: ${file.name} (${file.type})\n`;
        
        if (file.content) {
          if (file.type === 'text') {
            attachmentContent += `Contenuto: ${file.content}\n\n`;
          } else if (file.type === 'image') {
            attachmentContent += `[Immagine in formato base64, non visualizzabile qui]\n\n`;
          }
        }
      });
      
      attachmentContent += "Considera questi file nella tua analisi profonda.";
    }

    // Combina il messaggio dell'utente con l'informazione sugli allegati
    const userContent = messages[0].content + 
      (attachmentContent ? `\n\n${attachmentContent}` : '');
    
    const requestMessages = [
      { role: 'system' as const, content: deepThinkingPrompt },
      { role: 'user' as const, content: userContent }
    ];

    console.log("Inviando richiesta per deep thinking...");
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: requestMessages,
        temperature: settings?.temperature || 0.7,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Dividiamo la risposta in due parti: un messaggio da mandare nella chat e l'analisi completa
    const chatResponse = `Ho completato l'analisi Deep Thinking. Ecco un breve riepilogo dei punti principali:

${aiResponse.slice(0, 300)}...

Per vedere l'analisi completa, controlla il tab "Deep Thinking".`;

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
          message_content: messages[messages.length - 1].content,
          attachments: attachments
        });
    }

    // Salvare la risposta dell'assistente
    await supabase
      .from('chatbot_conversations')
      .insert({
        user_id: user.id,
        session_id: currentSessionId,
        message_role: 'assistant',
        message_content: chatResponse
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
      message: chatResponse,
      analysis: aiResponse,
      sessionId: currentSessionId,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chatbot-deep-thinking function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
