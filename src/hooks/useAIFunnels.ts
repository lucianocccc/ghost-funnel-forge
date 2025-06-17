
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
    try {
      const { data, error } = await supabase.functions.invoke('generate-funnel-ai', {
        body: { interviewId }
      });

      if (error) {
        throw error;
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
        description: "Errore nella generazione del funnel AI",
        variant: "destructive",
      });
      return null;
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
    generateFunnelFromInterview,
    updateFunnelStatus,
    getFunnelFeedback,
    refetchAIFunnels: fetchAIFunnels
  };
};
