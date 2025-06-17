
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface GeneratedFunnel {
  id: string;
  interview_id: string;
  funnel_name: string;
  funnel_description: string;
  target_audience: string;
  industry: string;
  funnel_data: any;
  is_saved: boolean;
  created_at: string;
}

export const useChatBotFunnels = (sessionId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [generatedFunnels, setGeneratedFunnels] = useState<GeneratedFunnel[]>([]);
  const [loading, setLoading] = useState(false);

  const loadGeneratedFunnels = async () => {
    if (!user || !sessionId) return;

    try {
      setLoading(true);
      
      // Ottenere l'ID dell'intervista per questa sessione
      const { data: interview } = await supabase
        .from('chatbot_interviews')
        .select('id')
        .eq('user_id', user.id)
        .eq('session_id', sessionId)
        .single();

      if (!interview) return;

      const { data: funnels, error } = await supabase
        .from('chatbot_generated_funnels')
        .select('*')
        .eq('interview_id', interview.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading generated funnels:', error);
        return;
      }

      setGeneratedFunnels(funnels || []);
    } catch (error) {
      console.error('Error loading generated funnels:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveFunnel = async (funnelId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chatbot_generated_funnels')
        .update({ is_saved: true })
        .eq('id', funnelId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Aggiornare lo stato locale
      setGeneratedFunnels(prev => 
        prev.map(funnel => 
          funnel.id === funnelId 
            ? { ...funnel, is_saved: true }
            : funnel
        )
      );

      toast({
        title: "Funnel salvato",
        description: "Il funnel è stato salvato con successo nella tua libreria",
      });
    } catch (error) {
      console.error('Error saving funnel:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio del funnel",
        variant: "destructive",
      });
    }
  };

  const deleteFunnel = async (funnelId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chatbot_generated_funnels')
        .delete()
        .eq('id', funnelId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Aggiornare lo stato locale
      setGeneratedFunnels(prev => 
        prev.filter(funnel => funnel.id !== funnelId)
      );

      toast({
        title: "Funnel eliminato",
        description: "Il funnel è stato eliminato con successo",
      });
    } catch (error) {
      console.error('Error deleting funnel:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione del funnel",
        variant: "destructive",
      });
    }
  };

  const createActualFunnel = async (generatedFunnel: GeneratedFunnel) => {
    if (!user) return;

    try {
      // Creare un funnel reale nella tabella funnels
      const { data: funnel, error: funnelError } = await supabase
        .from('funnels')
        .insert({
          name: generatedFunnel.funnel_name,
          description: generatedFunnel.funnel_description,
          target_audience: generatedFunnel.target_audience,
          industry: generatedFunnel.industry,
          created_by: user.id,
          status: 'draft'
        })
        .select()
        .single();

      if (funnelError) throw funnelError;

      // Creare gli step del funnel se presenti nei dati
      const funnelData = generatedFunnel.funnel_data;
      if (funnelData.steps && Array.isArray(funnelData.steps)) {
        const steps = funnelData.steps.map((step: string, index: number) => ({
          funnel_id: funnel.id,
          step_number: index + 1,
          step_type: 'content',
          title: step.split(' - ')[0] || `Step ${index + 1}`,
          description: step.split(' - ')[1] || step,
          content: { text: step }
        }));

        const { error: stepsError } = await supabase
          .from('funnel_steps')
          .insert(steps);

        if (stepsError) {
          console.error('Error creating funnel steps:', stepsError);
        }
      }

      // Aggiornare il funnel generato come salvato
      await saveFunnel(generatedFunnel.id);

      toast({
        title: "Funnel creato",
        description: "Il funnel è stato creato con successo e aggiunto alla tua libreria",
      });

      return funnel;
    } catch (error) {
      console.error('Error creating actual funnel:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la creazione del funnel",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadGeneratedFunnels();
  }, [user, sessionId]);

  return {
    generatedFunnels,
    loading,
    loadGeneratedFunnels,
    saveFunnel,
    deleteFunnel,
    createActualFunnel
  };
};
