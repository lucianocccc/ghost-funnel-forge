
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

  const parseFunnelsFromText = (text: string) => {
    const funnels = [];
    const funnelSections = text.split('**FUNNEL ').slice(1);
    
    for (let i = 0; i < Math.min(3, funnelSections.length); i++) {
      const section = funnelSections[i];
      const lines = section.split('\n').filter(line => line.trim());
      
      const nameMatch = lines[0]?.match(/^(\d+): (.+)\*\*/);
      const funnelName = nameMatch ? nameMatch[2] : `Funnel AI ${i + 1}`;
      
      const descriptionLine = lines.find(line => line.startsWith('Descrizione:'));
      const targetLine = lines.find(line => line.startsWith('Target:'));
      const industryLine = lines.find(line => line.startsWith('Industria:'));
      const strategyLine = lines.find(line => line.startsWith('Strategia:'));
      
      const stepLines = lines.filter(line => /^\d+\./.test(line.trim()));
      const steps = stepLines.map((step, index) => {
        const stepText = step.replace(/^\d+\.\s*/, '');
        const [title, ...descParts] = stepText.split(' - ');
        
        return {
          title: title.trim(),
          description: descParts.join(' - ').trim() || title.trim(),
          step_type: index === 0 ? 'lead_capture' : index === stepLines.length - 1 ? 'conversion' : 'qualification',
          is_required: index === 0,
          step_order: index + 1,
          form_fields: index === 0 ? [
            {
              id: 'email',
              type: 'email',
              label: 'Email',
              placeholder: 'Inserisci la tua email',
              required: true
            }
          ] : [
            {
              id: `field_${index}`,
              type: 'text',
              label: title.trim(),
              placeholder: `Inserisci ${title.trim().toLowerCase()}`,
              required: false
            }
          ],
          settings: {
            showProgressBar: true,
            allowBack: index > 0,
            submitButtonText: index === stepLines.length - 1 ? 'Invia' : 'Avanti',
            backgroundColor: '#ffffff',
            textColor: '#000000'
          }
        };
      });

      funnels.push({
        name: funnelName,
        description: descriptionLine ? descriptionLine.replace('Descrizione:', '').trim() : '',
        target_audience: targetLine ? targetLine.replace('Target:', '').trim() : '',
        industry: industryLine ? industryLine.replace('Industria:', '').trim() : '',
        strategy: strategyLine ? strategyLine.replace('Strategia:', '').trim() : '',
        steps: steps
      });
    }
    
    return funnels;
  };

  const createInteractiveFunnelsFromText = async (aiResponse: string) => {
    try {
      const funnels = parseFunnelsFromText(aiResponse);
      
      for (const funnelData of funnels) {
        // Crea il funnel interattivo
        const { data: funnel, error: funnelError } = await supabase
          .from('interactive_funnels')
          .insert({
            user_id: user?.id,
            name: funnelData.name,
            description: funnelData.description,
            target_audience: funnelData.target_audience,
            industry: funnelData.industry,
            share_token: crypto.randomUUID(),
            status: 'draft',
            is_public: false,
            views_count: 0,
            submissions_count: 0
          })
          .select()
          .single();

        if (funnelError) {
          console.error('Error creating funnel:', funnelError);
          continue;
        }

        // Crea gli step del funnel
        for (const step of funnelData.steps) {
          const { error: stepError } = await supabase
            .from('interactive_funnel_steps')
            .insert({
              funnel_id: funnel.id,
              title: step.title,
              description: step.description,
              step_type: step.step_type,
              step_order: step.step_order,
              is_required: step.is_required,
              form_fields: step.form_fields,
              settings: step.settings
            });

          if (stepError) {
            console.error('Error creating step:', stepError);
          }
        }
      }

      toast({
        title: "Funnel Creati!",
        description: `Ho creato ${funnels.length} funnel interattivi pronti all'uso dalla conversazione.`,
      });

      return funnels.length;
    } catch (error) {
      console.error('Error creating interactive funnels:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nella creazione dei funnel interattivi.",
        variant: "destructive",
      });
      return 0;
    }
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

        // Verifica se la risposta contiene funnel generati e li converte in funnel interattivi
        const containsFunnels = data.message.includes('**FUNNEL 1:') && data.message.includes('**FUNNEL 2:') && data.message.includes('**FUNNEL 3:');
        
        if (containsFunnels) {
          const createdCount = await createInteractiveFunnelsFromText(data.message);
          
          if (createdCount > 0) {
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
