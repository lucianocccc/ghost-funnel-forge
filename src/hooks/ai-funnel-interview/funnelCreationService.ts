
import { supabase } from '@/integrations/supabase/client';
import { ParsedFunnelData } from './types';

export const createInteractiveFunnelsFromText = async (
  aiResponse: string,
  user: any,
  parseFunnelsFromText: (text: string) => ParsedFunnelData[]
): Promise<number> => {
  try {
    const funnels = parseFunnelsFromText(aiResponse);
    
    for (const funnelData of funnels) {
      // Crea il funnel interattivo
      const { data: funnel, error: funnelError } = await supabase
        .from('interactive_funnels')
        .insert({
          created_by: user?.id,
          name: funnelData.name,
          description: funnelData.description,
          share_token: crypto.randomUUID(),
          status: 'draft',
          is_public: false,
          views_count: 0,
          submissions_count: 0
        })
        .select()
        .single();

      if (funnelError) {
        console.error('Error creating funnel:', funnelError);
        continue;
      }

      // Crea gli step del funnel
      for (const step of funnelData.steps) {
        const { error: stepError } = await supabase
          .from('interactive_funnel_steps')
          .insert({
            funnel_id: funnel.id,
            title: step.title,
            description: step.description,
            step_type: step.step_type,
            step_order: step.step_order,
            is_required: step.is_required,
            fields_config: step.form_fields,
            settings: step.settings
          });

        if (stepError) {
          console.error('Error creating step:', stepError);
        }
      }
    }

    return funnels.length;
  } catch (error) {
    console.error('Error creating interactive funnels:', error);
    return 0;
  }
};
