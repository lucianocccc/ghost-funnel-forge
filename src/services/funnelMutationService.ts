
import { supabase } from '@/integrations/supabase/client';
import { Funnel } from '@/types/funnel';

export const updateFunnelStatus = async (funnelId: string, status: Funnel['status']) => {
  const { error } = await supabase
    .from('funnels')
    .update({ status })
    .eq('id', funnelId);

  if (error) {
    throw error;
  }
};

export const updateFunnelDetails = async (
  funnelId: string, 
  updates: Partial<Pick<Funnel, 'name' | 'description' | 'target_audience' | 'industry'>>
) => {
  const { error } = await supabase
    .from('funnels')
    .update(updates)
    .eq('id', funnelId);

  if (error) {
    throw error;
  }
};

export const deleteFunnel = async (funnelId: string) => {
  const { error } = await supabase
    .from('funnels')
    .delete()
    .eq('id', funnelId);

  if (error) {
    throw error;
  }
};
