
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ProductDiscoveryData {
  sessionId: string;
  interviewData: any;
  analysis: any;
  generatedFunnel: any;
}

export const useProductDiscovery = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentSession, setCurrentSession] = useState<ProductDiscoveryData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [discoveryHistory, setDiscoveryHistory] = useState<ProductDiscoveryData[]>([]);

  const startNewDiscovery = useCallback(() => {
    const sessionId = crypto.randomUUID();
    const newSession: ProductDiscoveryData = {
      sessionId,
      interviewData: null,
      analysis: null,
      generatedFunnel: null
    };
    setCurrentSession(newSession);
    return sessionId;
  }, []);

  const saveInterviewData = useCallback(async (interviewData: any) => {
    if (!currentSession || !user) return;

    setIsProcessing(true);
    try {
      // Salva i dati dell'intervista
      const { error } = await supabase
        .from('chatbot_interviews')
        .upsert({
          id: currentSession.sessionId,
          user_id: user.id,
          session_id: currentSession.sessionId,
          interview_data: interviewData,
          status: 'completed'
        });

      if (error) throw error;

      setCurrentSession(prev => prev ? {
        ...prev,
        interviewData
      } : null);

      toast({
        title: "✅ Intervista Completata",
        description: "I dati del tuo prodotto sono stati salvati con successo",
      });

    } catch (error) {
      console.error('Error saving interview data:', error);
      toast({
        title: "Errore",
        description: "Errore nel salvare i dati dell'intervista",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [currentSession, user, toast]);

  const saveAnalysis = useCallback(async (analysis: any) => {
    if (!currentSession) return;

    setCurrentSession(prev => prev ? {
      ...prev,
      analysis
    } : null);

    toast({
      title: "🧠 Analisi Completata",
      description: "L'AI ha analizzato il tuo prodotto e identificato le opportunità chiave",
    });
  }, [currentSession, toast]);

  const saveFunnel = useCallback(async (funnelData: any) => {
    if (!currentSession) return;

    setCurrentSession(prev => prev ? {
      ...prev,
      generatedFunnel: funnelData
    } : null);

    // Aggiungi alla history
    if (currentSession) {
      const completedSession = {
        ...currentSession,
        generatedFunnel: funnelData
      };
      setDiscoveryHistory(prev => [completedSession, ...prev]);
    }

    toast({
      title: "🎬 Funnel Generato!",
      description: "Il tuo funnel cinematico personalizzato è pronto",
    });
  }, [currentSession, toast]);

  const loadDiscoveryHistory = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chatbot_interviews')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const history = data?.map(interview => {
        // Safely cast interview_data to an object type
        const interviewData = interview.interview_data as any;
        
        return {
          sessionId: interview.session_id,
          interviewData: interviewData,
          analysis: interviewData?.analysis || null,
          generatedFunnel: interviewData?.generatedFunnel || null
        };
      }) || [];

      setDiscoveryHistory(history);

    } catch (error) {
      console.error('Error loading discovery history:', error);
    }
  }, [user]);

  const clearCurrentSession = useCallback(() => {
    setCurrentSession(null);
  }, []);

  const getDiscoveryStats = useCallback(() => {
    const totalSessions = discoveryHistory.length;
    const completedFunnels = discoveryHistory.filter(session => session.generatedFunnel).length;
    const avgConversionPotential = discoveryHistory
      .filter(session => session.analysis?.conversionStrategy?.potential)
      .reduce((sum, session) => sum + (session.analysis?.conversionStrategy?.potential || 0), 0) / 
      (discoveryHistory.length || 1);

    return {
      totalSessions,
      completedFunnels,
      avgConversionPotential: Math.round(avgConversionPotential * 100),
      completionRate: totalSessions > 0 ? Math.round((completedFunnels / totalSessions) * 100) : 0
    };
  }, [discoveryHistory]);

  return {
    currentSession,
    isProcessing,
    discoveryHistory,
    startNewDiscovery,
    saveInterviewData,
    saveAnalysis,
    saveFunnel,
    loadDiscoveryHistory,
    clearCurrentSession,
    getDiscoveryStats
  };
};
