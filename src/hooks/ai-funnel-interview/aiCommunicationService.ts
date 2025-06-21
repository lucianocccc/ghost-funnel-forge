
import { supabase } from '@/integrations/supabase/client';

export const sendMessageToAI = async (
  message: string,
  sessionId: string
): Promise<{ success: boolean; message: string; sessionId: string; error?: string }> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    // Enhanced prompt for funnel creation
    const enhancedPrompt = `${message}

CONTESTO: L'utente sta creando un funnel di marketing. Se hai raccolto abbastanza informazioni (settore, target, obiettivi), genera 3 funnel specifici usando il formato richiesto.

ISTRUZIONI SPECIALI:
- Se l'utente ha scelto "personalizzato", conduci un'intervista per scoprire: settore, target audience, obiettivi, budget, tempistiche
- Fai UNA domanda alla volta per mantenere la conversazione naturale
- Quando hai abbastanza informazioni, genera ESATTAMENTE 3 funnel usando questo formato:

**FUNNEL 1: [Nome del Funnel]**
Descrizione: [Descrizione dettagliata 2-3 frasi]
Target: [Target audience specifico]
Industria: [Settore/industria]

Step del funnel:
1. [Nome Step] - [Descrizione dettagliata dello step]
2. [Nome Step] - [Descrizione dettagliata dello step]
3. [Nome Step] - [Descrizione dettagliata dello step]
4. [Nome Step] - [Descrizione dettagliata dello step]
5. [Nome Step] - [Descrizione dettagliata dello step]

Strategia: [Strategia di distribuzione e implementazione]

---

[Ripeti per FUNNEL 2 e FUNNEL 3]

Concludi sempre con: "Quale di questi funnel ti interessa di più? Posso personalizzarlo ulteriormente!"`;

    const { data, error } = await supabase.functions.invoke('chatbot-ai', {
      body: { 
        messages: [{ role: 'user', content: enhancedPrompt }],
        sessionId: sessionId 
      },
      headers: {
        'Authorization': `Bearer ${session?.access_token}`
      }
    });

    if (error) throw error;

    return {
      success: data.success,
      message: data.message,
      sessionId: data.sessionId || sessionId,
      error: data.error
    };
  } catch (error) {
    console.error('Error communicating with AI:', error);
    return {
      success: false,
      message: '',
      sessionId: sessionId,
      error: 'Errore nella comunicazione con l\'AI. Riprova.'
    };
  }
};
