
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type AIGeneratedFunnel = Database['public']['Tables']['ai_generated_funnels']['Row'];
type FunnelFeedback = Database['public']['Tables']['funnel_feedback']['Row'];

export const useAIFunnels = () => {
  const [aiFunnels, setAIFunnels] = useState<AIGeneratedFunnel[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchAIFunnels = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_generated_funnels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching AI funnels:', error);
        toast({
          title: "Errore",
          description: "Errore nel caricamento dei funnel AI",
          variant: "destructive",
        });
        return;
      }

      setAIFunnels(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Errore",
        description: "Errore generale nel caricamento dei funnel AI",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateFunnelFromInterview = async (interviewId: string) => {
    setIsGenerating(true);
    try {
      // Ottieni l'utente autenticato
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utente non autenticato');
      }

      // Recupera i dati completi dell'intervista
      const { data: interview, error: interviewError } = await supabase
        .from('client_interviews')
        .select('*')
        .eq('id', interviewId)
        .single();

      // Se l'intervista non esiste, usa dati di esempio per test
      const interviewData = interview || {
        business_name: 'Business di Test',
        business_description: 'Un business innovativo nel settore tecnologico',
        target_audience: 'Imprenditori e piccole aziende',
        goals: 'Aumentare le vendite del 50% nei prossimi 6 mesi',
        current_challenges: 'Difficoltà nel raggiungere nuovi clienti online',
        budget_range: '€5.000 - €10.000',
        timeline: '3 mesi',
        gpt_analysis: null
      };

      if (!interview && !interviewError?.message?.includes('client_interviews')) {
        console.warn('Usando dati di esempio per il test del funnel');
      }

      // Prepara il prompt basato sui dati dell'intervista
      const prompt = `
        Genera un funnel di marketing per:
        Business: ${interviewData.business_name || 'Business non specificato'}
        Descrizione: ${interviewData.business_description || ''}
        Target Audience: ${interviewData.target_audience || ''}
        Obiettivi: ${interviewData.goals || ''}
        Sfide attuali: ${interviewData.current_challenges || ''}
        Budget: ${interviewData.budget_range || 'Non specificato'}
        Timeline: ${interviewData.timeline || 'Non specificato'}
        ${interviewData.gpt_analysis ? `Analisi: ${JSON.stringify(interviewData.gpt_analysis)}` : ''}
      `.trim();

      // Prepara il profilo cliente per l'AI
      const customerProfile = {
        businessInfo: {
          name: interviewData.business_name || 'Business',
          industry: 'Non specificato',
          targetAudience: interviewData.target_audience || '',
          keyBenefits: []
        },
        psychographics: {
          painPoints: interviewData.current_challenges ? [interviewData.current_challenges] : [],
          motivations: interviewData.goals ? [interviewData.goals] : [],
          preferredTone: 'professional',
          communicationStyle: 'informative'
        },
        behavioralData: {
          engagementLevel: 5,
          conversionIntent: 7,
          informationGatheringStyle: 'detailed'
        },
        conversionStrategy: {
          primaryGoal: interviewData.goals || 'Aumentare le conversioni',
          secondaryGoals: [],
          keyMessages: []
        }
      };

      // Chiama la funzione edge per generare il funnel
      const { data, error } = await supabase.functions.invoke('generate-interactive-funnel-ai', {
        body: { 
          prompt,
          userId: user.id,
          saveToLibrary: true,
          customerProfile,
          funnelTypeId: 'custom'
        }
      });

      if (error) {
        throw error;
      }

      // Aggiorna l'intervista con l'ID del funnel generato
      if (data?.funnel?.id) {
        await supabase
          .from('client_interviews')
          .update({ 
            funnel_id: data.funnel.id,
            updated_at: new Date().toISOString() 
          })
          .eq('id', interviewId);
      }

      toast({
        title: "Successo",
        description: "Funnel AI generato con successo",
      });

      await fetchAIFunnels();
      return data;
    } catch (error) {
      console.error('Error generating AI funnel:', error);
      toast({
        title: "Errore",
        description: error.message || "Errore nella generazione del funnel AI",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // Funzione di test diretta per generare un funnel senza intervista
  const generateTestFunnel = async () => {
    setIsGenerating(true);
    try {
      // Ottieni l'utente autenticato
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utente non autenticato');
      }

      const testData = {
        business_name: 'Business di Test',
        business_description: 'Un business innovativo nel settore tecnologico che offre soluzioni digitali per piccole e medie imprese',
        target_audience: 'Imprenditori e piccole aziende che vogliono digitalizzare i propri processi',
        goals: 'Aumentare le vendite del 50% nei prossimi 6 mesi e acquisire 100 nuovi clienti',
        current_challenges: 'Difficoltà nel raggiungere nuovi clienti online e convertire i visitatori in clienti',
        budget_range: '€5.000 - €10.000',
        timeline: '3 mesi'
      };

      // Prepara il prompt basato sui dati di test
      const prompt = `
        Genera un funnel di marketing completo e dettagliato per:
        Business: ${testData.business_name}
        Descrizione: ${testData.business_description}
        Target Audience: ${testData.target_audience}
        Obiettivi: ${testData.goals}
        Sfide attuali: ${testData.current_challenges}
        Budget: ${testData.budget_range}
        Timeline: ${testData.timeline}
      `.trim();

      // Prepara il profilo cliente per l'AI
      const customerProfile = {
        businessInfo: {
          name: testData.business_name,
          industry: 'Tecnologia',
          targetAudience: testData.target_audience,
          keyBenefits: ['Innovazione', 'Efficienza', 'Risultati misurabili']
        },
        psychographics: {
          painPoints: [testData.current_challenges],
          motivations: [testData.goals],
          preferredTone: 'professional',
          communicationStyle: 'informative'
        },
        behavioralData: {
          engagementLevel: 7,
          conversionIntent: 8,
          informationGatheringStyle: 'detailed'
        },
        conversionStrategy: {
          primaryGoal: testData.goals,
          secondaryGoals: ['Costruire fiducia', 'Educare il cliente'],
          keyMessages: ['Risultati garantiti', 'Supporto dedicato', 'ROI misurabile']
        }
      };

      console.log('Generando funnel di test con dati:', testData);

      // Chiama la funzione edge per generare il funnel
      const { data, error } = await supabase.functions.invoke('generate-interactive-funnel-ai', {
        body: { 
          prompt,
          userId: user.id,
          saveToLibrary: true,
          customerProfile,
          funnelTypeId: 'test'
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Successo",
        description: "Funnel di test generato con successo",
      });

      await fetchAIFunnels();
      return data;
    } catch (error) {
      console.error('Error generating test funnel:', error);
      toast({
        title: "Errore",
        description: error.message || "Errore nella generazione del funnel di test",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const updateFunnelStatus = async (funnelId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('ai_generated_funnels')
        .update({ is_active: isActive })
        .eq('id', funnelId);

      if (error) {
        throw error;
      }

      setAIFunnels(prev =>
        prev.map(funnel =>
          funnel.id === funnelId ? { ...funnel, is_active: isActive } : funnel
        )
      );

      toast({
        title: "Successo",
        description: `Funnel ${isActive ? 'attivato' : 'disattivato'} con successo`,
      });
    } catch (error) {
      console.error('Error updating funnel status:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento dello status del funnel",
        variant: "destructive",
      });
    }
  };

  const getFunnelFeedback = async (funnelId: string): Promise<FunnelFeedback[]> => {
    try {
      const { data, error } = await supabase
        .from('funnel_feedback')
        .select('*')
        .eq('funnel_id', funnelId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching funnel feedback:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchAIFunnels();
  }, []);

  return {
    aiFunnels,
    loading,
    isGenerating,
    generateFunnelFromInterview,
    generateTestFunnel,
    updateFunnelStatus,
    getFunnelFeedback,
    refetchAIFunnels: fetchAIFunnels
  };
};
