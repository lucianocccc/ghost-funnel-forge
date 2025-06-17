
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type ClientInterview = Database['public']['Tables']['client_interviews']['Row'];
type ClientInterviewInsert = Database['public']['Tables']['client_interviews']['Insert'];
type AIGeneratedFunnel = Database['public']['Tables']['ai_generated_funnels']['Row'];

export const useClientInterviews = () => {
  const [interviews, setInterviews] = useState<ClientInterview[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchInterviews = async () => {
    try {
      const { data, error } = await supabase
        .from('client_interviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching interviews:', error);
        toast({
          title: "Errore",
          description: "Errore nel caricamento delle interviste",
          variant: "destructive",
        });
        return;
      }

      setInterviews(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Errore",
        description: "Errore generale nel caricamento delle interviste",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createInterview = async (interviewData: Omit<ClientInterviewInsert, 'user_id'>) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          title: "Errore",
          description: "Devi essere autenticato per creare un'intervista",
          variant: "destructive",
        });
        return null;
      }

      const { data, error } = await supabase
        .from('client_interviews')
        .insert({
          ...interviewData,
          user_id: user.user.id,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Successo",
        description: "Intervista creata con successo",
      });

      await fetchInterviews();
      return data;
    } catch (error) {
      console.error('Error creating interview:', error);
      toast({
        title: "Errore",
        description: "Errore nella creazione dell'intervista",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateInterview = async (id: string, updates: Partial<ClientInterview>) => {
    try {
      const { error } = await supabase
        .from('client_interviews')
        .update(updates)
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Successo",
        description: "Intervista aggiornata con successo",
      });

      await fetchInterviews();
    } catch (error) {
      console.error('Error updating interview:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento dell'intervista",
        variant: "destructive",
      });
    }
  };

  const analyzeInterview = async (interviewId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-interview', {
        body: { interviewId }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Successo",
        description: "Analisi completata con successo",
      });

      await fetchInterviews();
      return data;
    } catch (error) {
      console.error('Error analyzing interview:', error);
      toast({
        title: "Errore",
        description: "Errore nell'analisi dell'intervista",
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  return {
    interviews,
    loading,
    createInterview,
    updateInterview,
    analyzeInterview,
    refetchInterviews: fetchInterviews
  };
};
