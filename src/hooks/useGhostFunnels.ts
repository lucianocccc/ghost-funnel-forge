import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SavedGhostFunnel {
  id: string;
  interview_id: string;
  user_id: string;
  name: string;
  description: string | null;
  funnel_data: any;
  share_token: string;
  is_active: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
  session_id: string | null;
  source: string | null;
  is_from_chatbot: boolean | null;
  ai_generated: boolean | null;
  funnel_type: string | null;
  industry: string | null;
  use_case: string | null;
}

export function useGhostFunnels() {
  const [funnels, setFunnels] = useState<SavedGhostFunnel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGhostFunnels = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('ai_generated_funnels')
        .select('*')
        .eq('user_id', user.id)
        .eq('funnel_type', 'ghost_funnel')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching ghost funnels:', error);
        toast.error('Errore nel caricamento dei Ghost Funnel');
        return;
      }

      setFunnels(data || []);
    } catch (error) {
      console.error('Error fetching ghost funnels:', error);
      toast.error('Errore nel caricamento dei Ghost Funnel');
    } finally {
      setLoading(false);
    }
  };

  const deleteFunnel = async (funnelId: string) => {
    try {
      const { error } = await supabase
        .from('ai_generated_funnels')
        .delete()
        .eq('id', funnelId);

      if (error) {
        console.error('Error deleting funnel:', error);
        toast.error('Errore nell\'eliminazione del funnel');
        return;
      }

      setFunnels(prev => prev.filter(f => f.id !== funnelId));
      toast.success('Ghost Funnel eliminato con successo');
    } catch (error) {
      console.error('Error deleting funnel:', error);
      toast.error('Errore nell\'eliminazione del funnel');
    }
  };

  const toggleActive = async (funnelId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('ai_generated_funnels')
        .update({ is_active: isActive })
        .eq('id', funnelId);

      if (error) {
        console.error('Error updating funnel status:', error);
        toast.error('Errore nell\'aggiornamento dello status');
        return;
      }

      setFunnels(prev => prev.map(f => 
        f.id === funnelId ? { ...f, is_active: isActive } : f
      ));
      
      toast.success(`Ghost Funnel ${isActive ? 'attivato' : 'disattivato'} con successo`);
    } catch (error) {
      console.error('Error updating funnel status:', error);
      toast.error('Errore nell\'aggiornamento dello status');
    }
  };

  useEffect(() => {
    fetchGhostFunnels();
  }, []);

  return {
    funnels,
    loading,
    fetchGhostFunnels,
    deleteFunnel,
    toggleActive
  };
}