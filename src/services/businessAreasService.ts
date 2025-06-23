
import { supabase } from '@/integrations/supabase/client';
import { BusinessAreaWithSubAreas } from '@/types/consolidatedLeads';

export const fetchBusinessAreas = async (): Promise<BusinessAreaWithSubAreas[]> => {
  const { data, error } = await supabase
    .from('business_areas')
    .select(`
      *,
      business_sub_areas (*)
    `)
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data || [];
};
