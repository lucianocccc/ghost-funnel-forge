
import { supabase } from '@/integrations/supabase/client';
import { InteractionCreate } from '@/types/consolidatedLeads';

export const createLeadInteraction = async (interaction: InteractionCreate): Promise<void> => {
  const { error } = await supabase
    .from('lead_interactions')
    .insert({
      ...interaction,
      created_by: (await supabase.auth.getUser()).data.user?.id
    });

  if (error) throw error;
};
