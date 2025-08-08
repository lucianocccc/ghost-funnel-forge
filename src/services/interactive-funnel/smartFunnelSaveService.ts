import { supabase } from '@/integrations/supabase/client';
import { InteractiveFunnel } from '@/types/interactiveFunnel';
import { toast } from 'sonner';
import { convertGhostFunnelToSteps, isGhostFunnelStructure } from './ghostFunnelConverter';

export interface SmartFunnelSaveData {
  name: string;
  description?: string;
  funnelData: any;
  smartGenerationMetadata?: any;
  style?: any;
}

export const saveSmartFunnelAsInteractive = async (data: SmartFunnelSaveData): Promise<{ funnel: InteractiveFunnel; shareUrl: string } | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('Devi essere autenticato per salvare un funnel');
      return null;
    }

    // Generate share token
    const shareToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Prepare funnel data with smart funnel metadata
    const funnelSettings = {
      ai_generated: true,
      smart_funnel: true,
      generation_metadata: data.smartGenerationMetadata,
      brand_style: data.style
    };

    // Create the interactive funnel
    const { data: funnel, error } = await supabase
      .from('interactive_funnels')
      .insert({
        name: data.name,
        description: data.description || 'Funnel generato con Smart AI Generator',
        created_by: user.id,
        is_public: true,
        share_token: shareToken,
        settings: funnelSettings,
        status: 'active' as const
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving smart funnel:', error);
      toast.error('Errore nel salvataggio del funnel');
      return null;
    }

    // Create funnel steps from generated data
    let steps: any[] = [];
    
    if (isGhostFunnelStructure(data.funnelData)) {
      // Handle Ghost Funnel structure
      const ghostSteps = convertGhostFunnelToSteps(data.funnelData) as any[];
      steps = ghostSteps.map((step, index) => ({
        funnel_id: funnel.id,
        title: step.title,
        step_type: step.step_type || step.type || 'form',
        step_order: step.step_order ?? step.order_index ?? index,
        description: step.description ?? null,
        is_required: step.is_required ?? true,
        fields_config: step.fields_config || step.fields || step.settings?.fields || [],
        settings: step.settings
      }));
      
      // Add ghost_funnel flag to settings
      await supabase
        .from('interactive_funnels')
        .update({
          settings: {
            ...funnelSettings,
            ghost_funnel: true,
            original_ghost_data: data.funnelData
          }
        })
        .eq('id', funnel.id);
        
    } else if (data.funnelData.steps && Array.isArray(data.funnelData.steps)) {
      // Handle traditional funnel structure
      steps = data.funnelData.steps.map((step: any, index: number) => ({
        funnel_id: funnel.id,
        title: step.title || `Step ${index + 1}`,
        step_type: step.step_type || step.type || 'form',
        step_order: step.step_order ?? index,
        description: step.description ?? null,
        is_required: step.is_required ?? true,
        fields_config: step.fields_config || step.fields || [],
        settings: {
          content: step.content,
          ai_generated: true
        }
      }));
    }

    if (steps.length > 0) {
      const { error: stepsError } = await supabase
        .from('interactive_funnel_steps')
        .insert(steps);

      if (stepsError) {
        console.warn('Error saving funnel steps:', stepsError);
        // Continue even if steps fail to save
      }
    }

    const shareUrl = `${window.location.origin}/funnel/${shareToken}`;
    
    toast.success('Funnel salvato e pubblicato con successo!', {
      action: {
        label: 'Copia Link',
        onClick: () => {
          navigator.clipboard.writeText(shareUrl);
          toast.success('Link copiato negli appunti!');
        }
      }
    });

    return { funnel: funnel as InteractiveFunnel, shareUrl };
  } catch (error) {
    console.error('Error in saveSmartFunnelAsInteractive:', error);
    toast.error('Errore imprevisto nel salvataggio');
    return null;
  }
};

export const copyShareLink = (shareToken: string) => {
  const shareUrl = `${window.location.origin}/funnel/${shareToken}`;
  navigator.clipboard.writeText(shareUrl);
  toast.success('Link di condivisione copiato negli appunti!');
};