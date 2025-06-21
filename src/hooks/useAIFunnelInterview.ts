
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ChatMessage } from './ai-funnel-interview/types';
import { parseFunnelsFromText } from './ai-funnel-interview/funnelParsingService';
import { createInteractiveFunnelsFromText } from './ai-funnel-interview/funnelCreationService';
import { sendMessageToAI } from './ai-funnel-interview/aiCommunicationService';

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
      const aiResponse = await sendMessageToAI(currentInput, sessionId);

      if (aiResponse.success) {
        const aiMessage: ChatMessage = {
          role: 'assistant',
          content: aiResponse.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        
        if (aiResponse.sessionId && aiResponse.sessionId !== sessionId) {
          setSessionId(aiResponse.sessionId);
        }

        // Verifica se la risposta contiene funnel generati e li converte in funnel interattivi
        const containsFunnels = aiResponse.message.includes('**FUNNEL 1:') && 
                               aiResponse.message.includes('**FUNNEL 2:') && 
                               aiResponse.message.includes('**FUNNEL 3:');
        
        if (containsFunnels) {
          const createdCount = await createInteractiveFunnelsFromText(
            aiResponse.message, 
            user, 
            parseFunnelsFromText
          );
          
          if (createdCount > 0) {
            toast({
              title: "Funnel Creati!",
              description: `Ho creato ${createdCount} funnel interattivi pronti all'uso dalla conversazione.`,
            });

            // Aggiungi un messaggio di conferma
            const confirmationMessage: ChatMessage = {
              role: 'assistant',
              content: `🎉 Perfetto! Ho convertito tutti i ${createdCount} funnel in funnel interattivi completamente funzionali. 

Ora puoi trovarli nella sezione "I Miei Funnel" dove potrai:
- Modificare e personalizzare ogni step
- Condividerli con i tuoi clienti
- Monitorare le conversioni e i lead
- Attivarli quando sono pronti

Vai su "I Miei Funnel" per iniziare a lavorarci!`,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, confirmationMessage]);
          }
        }
      } else {
        throw new Error(aiResponse.error || 'Errore nella comunicazione con l\'AI');
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
