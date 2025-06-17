
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface GeneratedFunnel {
  id: string;
  interview_id: string;
  session_id: string;
  name: string;
  description: string;
  funnel_data: any;
  is_active: boolean;
  share_token: string;
  views_count: number;
  created_at: string;
  updated_at: string;
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
      
      const { data: funnels, error } = await supabase
        .from('ai_generated_funnels')
        .select('*')
        .eq('user_id', user.id)
        .eq('session_id', sessionId)
        .eq('is_from_chatbot', true)
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
        .from('ai_generated_funnels')
        .update({ is_active: true })
        .eq('id', funnelId)
        .eq('user_id', user.id);

      if (error) throw error;

      setGeneratedFunnels(prev => 
        prev.map(funnel => 
          funnel.id === funnelId 
            ? { ...funnel, is_active: true }
            : funnel
        )
      );

      toast({
        title: "Funnel salvato",
        description: "Il funnel è stato attivato con successo nella tua libreria",
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
        .from('ai_generated_funnels')
        .delete()
        .eq('id', funnelId)
        .eq('user_id', user.id);

      if (error) throw error;

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
      const funnelData = generatedFunnel.funnel_data;
      
      // Create a funnel in the main funnels table
      const { data: funnel, error: funnelError } = await supabase
        .from('funnels')
        .insert({
          name: generatedFunnel.name,
          description: generatedFunnel.description,
          target_audience: funnelData.target_audience || '',
          industry: funnelData.industry || '',
          created_by: user.id,
          status: 'draft'
        })
        .select()
        .single();

      if (funnelError) throw funnelError;

      // Create funnel steps if present
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

      // Mark the AI funnel as active
      await saveFunnel(generatedFunnel.id);

      toast({
        title: "Funnel creato",
        description: "Il funnel è stato creato con successo e aggiunto alla tua libreria principale",
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

  const shareFunnel = async (funnelId: string) => {
    try {
      const funnel = generatedFunnels.find(f => f.id === funnelId);
      if (!funnel) return;

      const shareUrl = `${window.location.origin}/shared-funnel/${funnel.share_token}`;
      
      await navigator.clipboard.writeText(shareUrl);
      
      toast({
        title: "Link copiato",
        description: "Il link di condivisione è stato copiato negli appunti",
      });

      return shareUrl;
    } catch (error) {
      console.error('Error sharing funnel:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la condivisione",
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
    createActualFunnel,
    shareFunnel
  };
};
