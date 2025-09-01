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
        step_type: step.step_type || step.type || 'lead_capture',
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
        step_type: step.step_type || step.type || 'lead_capture',
        step_order: step.step_order ?? index,
        description: step.description ?? null,
        is_required: step.is_required ?? true,
        fields_config: step.fields_config || step.fields || [],
        settings: {
          content: step.content,
          ai_generated: true
        }
      }));
    } else if (Array.isArray(data.funnelData.modularStructure) && data.funnelData.modularStructure.length > 0) {
      // Handle modular funnel structure - map to valid step types
      const mapSectionToStepType = (sectionType: string) => {
        const t = String(sectionType || '').toLowerCase();
        if (t.includes('lead') || t.includes('form') || t.includes('contact')) return 'lead_capture';
        if (t.includes('faq') || t.includes('domand')) return 'qualification';
        if (t.includes('testimon') || t.includes('review')) return 'social_proof';
        if (t.includes('pricing') || t.includes('prezzi') || t.includes('price')) return 'pricing';
        if (t.includes('hero') || t.includes('landing')) return 'landing';
        if (t.includes('thank') || t.includes('grazi')) return 'thank_you';
        return 'content';
      };

      steps = data.funnelData.modularStructure.map((section: any, index: number) => {
        const micro = section?.config?.microcopy || {};
        const stepType = mapSectionToStepType(section?.section_type || section?.type);
        const base: any = {
          funnel_id: funnel.id,
          title: section?.config?.template || section?.title || section?.section_type || `Sezione ${index + 1}`,
          step_type: stepType,
          step_order: index,
          description: micro.description || section?.description || null,
          is_required: stepType === 'lead_capture',
          fields_config: [] as any[],
          settings: {
            ai_generated: true,
            section_type: section?.section_type || section?.type,
            content: {
              headline: micro.headline,
              subheadline: micro.subheadline,
              cta: micro.cta,
              items: section?.config?.items,
            },
            config: section?.config
          }
        };

        if (stepType === 'lead_capture') {
          base.fields_config = section?.config?.fields?.length
            ? section.config.fields
            : [
                { type: 'text', label: 'Nome', name: 'name', required: true, placeholder: 'Inserisci il tuo nome' },
                { type: 'email', label: 'Email', name: 'email', required: true, placeholder: 'Inserisci la tua email' },
                { type: 'tel', label: 'Telefono', name: 'phone', required: false, placeholder: 'Inserisci il tuo numero' }
              ];
        }

        return base;
      });

      // Add modular funnel flags to settings
      await supabase
        .from('interactive_funnels')
        .update({
          settings: {
            ...funnelSettings,
            modular_funnel: true,
            original_modular_data: data.funnelData.modularStructure
          }
        })
        .eq('id', funnel.id);
    }

    // Fallback: ensure at least a basic form step when no recognizable structure is provided
    if (steps.length === 0) {
      steps = [{
        funnel_id: funnel.id,
        title: 'Contattaci',
        step_type: 'lead_capture',
        step_order: 0,
        description: 'Compila il modulo per essere ricontattato',
        is_required: true,
        fields_config: [
          { type: 'text', label: 'Nome', name: 'name', required: true, placeholder: 'Inserisci il tuo nome' },
          { type: 'email', label: 'Email', name: 'email', required: true, placeholder: 'Inserisci la tua email' },
          { type: 'tel', label: 'Telefono', name: 'phone', required: false, placeholder: 'Inserisci il tuo numero' },
          { type: 'textarea', label: 'Messaggio', name: 'message', required: false, placeholder: 'Come possiamo aiutarti?' }
        ],
        settings: { ai_generated: true }
      }];
    }

    if (steps.length > 0) {
      console.log('🔍 Attempting to save', steps.length, 'steps:', steps);
      
      const { data: insertedSteps, error: stepsError } = await supabase
        .from('interactive_funnel_steps')
        .insert(steps)
        .select();

      if (stepsError) {
        console.error('❌ Error saving funnel steps:', stepsError);
        toast.error('Errore nel salvataggio degli step del funnel');
        return null;
      } else {
        console.log('✅ Steps saved successfully:', insertedSteps);
      }
    } else {
      console.warn('⚠️ No steps to save - funnel will be empty');
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