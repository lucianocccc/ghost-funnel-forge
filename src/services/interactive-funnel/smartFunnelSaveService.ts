import { supabase } from '@/integrations/supabase/client';
import { InteractiveFunnel } from '@/types/interactiveFunnel';
import { toast } from 'sonner';
import { getValidStepTypes } from '@/components/interactive-funnel/config/stepTypes';
import { convertGhostFunnelToSteps, isGhostFunnelStructure } from './ghostFunnelConverter';

// Validate step type against allowed values
const validateStepType = (stepType: string): string => {
  const validTypes = getValidStepTypes();
  const normalizedType = stepType?.toLowerCase() || '';
  
  // Direct match
  if (validTypes.includes(stepType)) {
    return stepType;
  }
  
  // Exact mappings for AI-generated section types to valid database step types
  const mappings: Record<string, string> = {
    'hero': 'lead_capture',          // Hero sections capture leads
    'social_proof': 'discovery',     // Social proof helps discovery
    'pricing': 'conversion',         // Pricing leads to conversion
    'urgency': 'conversion',         // Urgency creates conversion
    'problem_solution': 'discovery', // Problem/solution is discovery
    'testimonials': 'discovery',     // Testimonials help discovery
    'faq': 'qualification',          // FAQ qualifies users
    'landing': 'lead_capture',       // Landing pages capture leads
    'contact_form': 'lead_capture',  // Contact forms capture leads
    'form': 'lead_capture',          // Generic forms capture leads
    'content': 'discovery',          // Content helps discovery
    'info': 'discovery',             // Info helps discovery
    'education': 'discovery',        // Education helps discovery
    'follow_up': 'conversion',       // Follow-up leads to conversion
    'survey': 'qualification',       // Surveys qualify users
  };
  
  // Check exact mappings first
  if (mappings[normalizedType]) {
    return mappings[normalizedType];
  }
  
  // Fuzzy matching for partial matches
  if (normalizedType.includes('lead') || normalizedType.includes('contact') || normalizedType.includes('capture')) {
    return 'lead_capture';
  }
  if (normalizedType.includes('qual') || normalizedType.includes('question') || normalizedType.includes('assess')) {
    return 'qualification';
  }
  if (normalizedType.includes('social') || normalizedType.includes('testimon') || normalizedType.includes('review') || normalizedType.includes('proof')) {
    return 'discovery';
  }
  if (normalizedType.includes('pric') || normalizedType.includes('cost') || normalizedType.includes('payment') || normalizedType.includes('urgency') || normalizedType.includes('convert')) {
    return 'conversion';
  }
  if (normalizedType.includes('thank') || normalizedType.includes('grazi') || normalizedType.includes('final')) {
    return 'thank_you';
  }
  if (normalizedType.includes('hero') || normalizedType.includes('landing') || normalizedType.includes('intro')) {
    return 'lead_capture';
  }
  if (normalizedType.includes('discover') || normalizedType.includes('explore') || normalizedType.includes('info') || normalizedType.includes('content')) {
    return 'discovery';
  }
  
  // Default fallback
  console.warn(`⚠️ Unknown step type "${stepType}", using fallback: lead_capture`);
  return 'lead_capture';
};

export interface SmartFunnelSaveData {
  name: string;
  description?: string;
  funnelData: any;
  smartGenerationMetadata?: any;
  style?: any;
}

export const saveSmartFunnelAsInteractive = async (data: SmartFunnelSaveData): Promise<{ funnel: InteractiveFunnel; shareUrl: string } | null> => {
  try {
    console.log('🔄 Starting funnel save process with data:', data);
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
      personalizedSections: {
        hero: {
          title: data.name,
          subtitle: data.description,
          cta_text: "Inizia Ora",
          value_proposition: "La soluzione che stavi cercando"
        }
      },
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
      steps = ghostSteps.map((step, index) => {
        const stepType = validateStepType(step.step_type || step.type || 'lead_capture');
        console.log(`📋 Processing Ghost step ${index + 1}: "${step.title}" -> type: ${stepType}`);
        
        return {
          funnel_id: funnel.id,
          title: step.title || `Step ${index + 1}`,
          step_type: stepType,
          step_order: step.step_order ?? step.order_index ?? index,
          description: step.description ?? null,
          is_required: step.is_required ?? (stepType === 'lead_capture'),
          fields_config: step.fields_config || step.fields || step.settings?.fields || [],
          settings: step.settings
        };
      });
      
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
      steps = data.funnelData.steps.map((step: any, index: number) => {
        const stepType = validateStepType(step.step_type || step.type || 'lead_capture');
        console.log(`📋 Processing standard step ${index + 1}: "${step.title || `Step ${index + 1}`}" -> type: ${stepType}`);
        
        return {
          funnel_id: funnel.id,
          title: step.title || `Step ${index + 1}`,
          step_type: stepType,
          step_order: step.step_order ?? index,
          description: step.description ?? null,
          is_required: step.is_required ?? (stepType === 'lead_capture'),
          fields_config: step.fields_config || step.fields || [],
          settings: {
            content: step.content,
            ai_generated: true
          }
        };
      });
    } else if (Array.isArray(data.funnelData.modularStructure) && data.funnelData.modularStructure.length > 0) {
      // Handle modular funnel structure - use the centralized validation
      console.log('📋 Processing modular structure with', data.funnelData.modularStructure.length, 'sections');

      steps = data.funnelData.modularStructure.map((section: any, index: number) => {
        const micro = section?.config?.microcopy || {};
        const stepType = validateStepType(section?.section_type || section?.type || 'content');
        console.log(`📋 Processing modular section ${index + 1}: "${section?.title || `Sezione ${index + 1}`}" -> type: ${stepType}`);
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
      console.log('📋 Using fallback: creating basic contact form step');
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

    // Validate steps before saving
    if (steps.length === 0) {
      console.error('❌ No steps generated - cannot save empty funnel');
      toast.error('Errore: nessuno step generato per il funnel');
      return null;
    }

    // Validate each step type
    const validTypes = getValidStepTypes();
    const invalidSteps = steps.filter(step => !validTypes.includes(step.step_type));
    if (invalidSteps.length > 0) {
      console.error('❌ Invalid step types found:', invalidSteps.map(s => s.step_type));
      toast.error('Errore: tipi di step non validi rilevati');
      return null;
    }

    console.log('🔍 Attempting to save', steps.length, 'validated steps');
    
    const { data: insertedSteps, error: stepsError } = await supabase
      .from('interactive_funnel_steps')
      .insert(steps)
      .select();

    if (stepsError) {
      console.error('❌ Error saving funnel steps:', stepsError);
      console.error('❌ Failed steps data:', steps);
      toast.error(`Errore nel salvataggio degli step: ${stepsError.message}`);
      
      // Try to clean up the funnel if steps failed to save
      await supabase.from('interactive_funnels').delete().eq('id', funnel.id);
      return null;
    }

    console.log('✅ Steps saved successfully:', insertedSteps?.length, 'steps inserted');
    
    // Verify the funnel now has steps
    const { data: verificationSteps } = await supabase
      .from('interactive_funnel_steps')
      .select('id, step_type, title')
      .eq('funnel_id', funnel.id);
    
    console.log('🔍 Verification: funnel now has', verificationSteps?.length || 0, 'steps');

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