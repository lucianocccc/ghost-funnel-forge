
import { supabase } from '@/integrations/supabase/client';

export interface FunnelType {
  id: string;
  name: string;
  description: string;
  category: string;
  industry?: string;
  target_audience?: string;
  complexity_level?: string;
  template_steps: any[];
  ai_prompts: {
    system_prompt: string;
    focus: string;
    key_metrics: string[];
  };
  conversion_optimization?: any;
  is_active: boolean;
}

export const fetchFunnelTypes = async (): Promise<FunnelType[]> => {
  const { data, error } = await supabase
    .from('funnel_types')
    .select('*')
    .eq('is_active', true)
    .order('category, name');

  if (error) {
    console.error('Error fetching funnel types:', error);
    throw error;
  }

  return data || [];
};

export const getFunnelTypeById = async (id: string): Promise<FunnelType | null> => {
  const { data, error } = await supabase
    .from('funnel_types')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching funnel type:', error);
    return null;
  }

  return data;
};

export const getFunnelTypesByCategory = async (category: string): Promise<FunnelType[]> => {
  const { data, error } = await supabase
    .from('funnel_types')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching funnel types by category:', error);
    throw error;
  }

  return data || [];
};

// Raggruppa i tipi di funnel per categoria
export const groupFunnelTypesByCategory = (funnelTypes: FunnelType[]) => {
  return funnelTypes.reduce((groups, type) => {
    const category = type.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(type);
    return groups;
  }, {} as Record<string, FunnelType[]>);
};
