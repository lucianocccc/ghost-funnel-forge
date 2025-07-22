
import { supabase } from '@/integrations/supabase/client';
import { InteractiveFunnel, InteractiveFunnelStep, InteractiveFunnelWithSteps } from '@/types/interactiveFunnel';

// Helper function to check auth state
const checkAuthState = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  console.log('Auth check:', { user: user ? { id: user.id, email: user.email } : null, error });
  return { user, error };
};

export const createInteractiveFunnel = async (
  name: string,
  description: string,
  aiGeneratedFunnelId?: string,
  funnelTypeId?: string
): Promise<InteractiveFunnel> => {
  console.log('Creating interactive funnel:', { name, description });
  
  const { user, error: authError } = await checkAuthState();
  if (authError || !user) {
    console.error('Authentication error:', authError);
    throw new Error('User not authenticated');
  }

  console.log('User authenticated, proceeding with funnel creation...');

  try {
    const { data, error } = await supabase
      .from('interactive_funnels')
      .insert({
        name,
        description,
        ai_funnel_id: aiGeneratedFunnelId,
        funnel_type_id: funnelTypeId,
        created_by: user.id,
        share_token: crypto.randomUUID(),
        status: 'draft',
        is_public: false,
        views_count: 0,
        submissions_count: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating funnel:', error);
      throw new Error(`Failed to create funnel: ${error.message}`);
    }
    
    console.log('Funnel created successfully:', data);
    
    return {
      ...data,
      status: data.status as 'draft' | 'active' | 'archived',
    } as InteractiveFunnel;
  } catch (error) {
    console.error('Unexpected error creating funnel:', error);
    throw error;
  }
};

export const fetchInteractiveFunnels = async (): Promise<InteractiveFunnelWithSteps[]> => {
  console.log('Fetching interactive funnels...');
  
  const { user, error: authError } = await checkAuthState();
  if (authError || !user) {
    console.error('Authentication error when fetching funnels:', authError);
    throw new Error('User not authenticated');
  }

  try {
    const { data, error } = await supabase
      .from('interactive_funnels')
      .select(`
        *,
        interactive_funnel_steps (*)
      `)
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching funnels:', error);
      throw new Error(`Failed to fetch funnels: ${error.message}`);
    }
    
    console.log('Funnels fetched successfully:', data?.length || 0, 'funnels');
    
    return (data || []).map(item => ({
      ...item,
      status: item.status as 'draft' | 'active' | 'archived',
      funnel_type: undefined
    }));
  } catch (error) {
    console.error('Unexpected error fetching funnels:', error);
    throw error;
  }
};

export const fetchInteractiveFunnelById = async (funnelId: string): Promise<InteractiveFunnelWithSteps | null> => {
  console.log('Fetching funnel by ID:', funnelId);
  
  const { user, error: authError } = await checkAuthState();
  if (authError || !user) {
    console.error('Authentication error when fetching funnel:', authError);
    throw new Error('User not authenticated');
  }

  try {
    const { data, error } = await supabase
      .from('interactive_funnels')
      .select(`
        *,
        interactive_funnel_steps (*)
      `)
      .eq('id', funnelId)
      .eq('created_by', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('Funnel not found or access denied');
        return null;
      }
      console.error('Error fetching funnel:', error);
      throw new Error(`Failed to fetch funnel: ${error.message}`);
    }
    
    console.log('Funnel fetched successfully:', data?.name);
    
    return {
      ...data,
      status: data.status as 'draft' | 'active' | 'archived',
      funnel_type: undefined
    };
  } catch (error) {
    console.error('Unexpected error fetching funnel:', error);
    throw error;
  }
};

export const updateFunnelStatus = async (funnelId: string, status: 'draft' | 'active' | 'archived'): Promise<void> => {
  console.log('Updating funnel status:', { funnelId, status });
  
  const { user, error: authError } = await checkAuthState();
  if (authError || !user) {
    console.error('Authentication error when updating funnel:', authError);
    throw new Error('User not authenticated');
  }

  try {
    const { error } = await supabase
      .from('interactive_funnels')
      .update({ status })
      .eq('id', funnelId)
      .eq('created_by', user.id);

    if (error) {
      console.error('Error updating funnel status:', error);
      throw new Error(`Failed to update funnel status: ${error.message}`);
    }
    
    console.log('Funnel status updated successfully');
  } catch (error) {
    console.error('Unexpected error updating funnel status:', error);
    throw error;
  }
};
