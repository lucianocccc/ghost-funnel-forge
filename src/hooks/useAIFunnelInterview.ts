
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useAIFunnelInterview = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [showTemplateChoice, setShowTemplateChoice] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const startAIInterview = async () => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi essere autenticato per creare funnel con l'AI.",
        variant: "destructive",
      });
      return;
    }

    setHasStarted(true);
    const newSessionId = crypto.randomUUID();
    setSessionId(newSessionId);

    const welcomeMessage: ChatMessage = {
      role: 'assistant',
      content: `Ciao ${user.email?.split('@')[0]}! Sono il tuo assistente AI per la creazione di funnel personalizzati. 

Prima di iniziare, dimmi: preferisci che ti consigli uno dei nostri funnel preconfezionati ottimizzati per diversi settori, oppure vuoi che creiamo insieme un funnel completamente personalizzato per le tue specifiche esigenze?

Rispondi con:
- **"Template"** se vuoi scegliere tra funnel preconfezionati
- **"Personalizzato"** se vuoi un funnel creato appositamente per te

Oppure dimmi direttamente qual è il tuo settore di business se vuoi iniziare subito!`,
      timestamp: new Date()
    };

    setMessages([welcomeMessage]);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !user) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    // Check if user wants templates
    if (currentInput.toLowerCase().includes('template') || currentInput.toLowerCase().includes('preconfezionato')) {
      setShowTemplateChoice(true);
      const templateMessage: ChatMessage = {
        role: 'assistant',
        content: `Perfetto! Ecco i nostri funnel template disponibili. Scegli quello che meglio si adatta al tuo business, poi potremo personalizzarlo insieme per le tue specifiche esigenze.

Clicca su uno dei template qui sotto per iniziare.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, templateMessage]);
      setIsLoading(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Enhanced prompt for funnel creation
      const enhancedPrompt = `${currentInput}

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

      if (data.success) {
        const aiMessage: ChatMessage = {
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        
        if (data.sessionId && data.sessionId !== sessionId) {
          setSessionId(data.sessionId);
        }
      } else {
        throw new Error(data.error || 'Errore nella comunicazione con l\'AI');
      }
    } catch (error) {
      console.error('Errore nel chatbot:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nella comunicazione con l'AI. Riprova.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = async (templateId: string, templateName: string) => {
    setShowTemplateChoice(false);
    setIsLoading(true);

    const templateMessage: ChatMessage = {
      role: 'assistant',
      content: `Ottima scelta! Hai selezionato il template "${templateName}". 

Ora aiutami a personalizzarlo per te. Dimmi:

1. Qual è il tuo settore di business specifico?
2. Chi è il tuo target audience ideale?
3. Qual è il tuo obiettivo principale con questo funnel?

Inizia con il primo punto - raccontami del tuo business!`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, templateMessage]);
    setIsLoading(false);
  };

  return {
    messages,
    inputMessage,
    setInputMessage,
    isLoading,
    sessionId,
    showTemplateChoice,
    hasStarted,
    startAIInterview,
    sendMessage,
    handleTemplateSelect
  };
};
