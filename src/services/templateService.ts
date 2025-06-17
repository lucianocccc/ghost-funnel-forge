
import { supabase } from '@/integrations/supabase/client';
import { FunnelTemplate, TemplateStep } from '@/types/funnel';

export const fetchTemplates = async (): Promise<FunnelTemplate[]> => {
  const { data, error } = await supabase
    .from('funnel_templates')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }

  return data || [];
};

export const createFunnelFromTemplateInDb = async (
  templateId: string, 
  name: string, 
  leadId?: string
) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  // Get template steps
  const { data: templateSteps, error: stepsError } = await supabase
    .from('template_steps')
    .select('*')
    .eq('template_id', templateId)
    .order('step_number');

  if (stepsError) {
    throw stepsError;
  }

  // Create funnel
  const { data: funnel, error: funnelError } = await supabase
    .from('funnels')
    .insert({
      name,
      template_id: templateId,
      lead_id: leadId,
      created_by: user.user.id,
      status: 'draft'
    })
    .select()
    .single();

  if (funnelError) {
    throw funnelError;
  }

  // Create funnel steps from template
  if (templateSteps && templateSteps.length > 0) {
    const funnelSteps = templateSteps.map(step => ({
      funnel_id: funnel.id,
      step_number: step.step_number,
      step_type: step.step_type,
      title: step.title,
      description: step.description,
      content: step.default_content
    }));

    const { error: stepsInsertError } = await supabase
      .from('funnel_steps')
      .insert(funnelSteps);

    if (stepsInsertError) {
      throw stepsInsertError;
    }
  }

  return funnel;
};
