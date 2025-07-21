
import { supabase } from '@/integrations/supabase/client';
import { createFunnelStep } from './funnelStepsService';
import { getValidStepTypes } from '@/components/interactive-funnel/config/stepTypes';

/**
 * Validates that a funnel has the minimum required steps and creates default ones if missing
 */
export const ensureFunnelHasSteps = async (funnelId: string): Promise<void> => {
  try {
    // Check if funnel has steps
    const { data: existingSteps, error } = await supabase
      .from('interactive_funnel_steps')
      .select('id, step_order, title, step_type')
      .eq('funnel_id', funnelId)
      .order('step_order');

    if (error) {
      console.error('Error checking funnel steps:', error);
      return;
    }

    // If funnel already has steps, validate they are properly ordered and have valid types
    if (existingSteps && existingSteps.length > 0) {
      console.log(`Funnel has ${existingSteps.length} existing steps, validating structure...`);
      
      // Validate step types
      const validStepTypes = getValidStepTypes();
      const invalidSteps = existingSteps.filter(step => !validStepTypes.includes(step.step_type));
      
      if (invalidSteps.length > 0) {
        console.warn('Found invalid step types:', invalidSteps.map(s => s.step_type));
        await fixInvalidStepTypes(funnelId, invalidSteps);
      }
      
      // Check for proper step ordering
      const hasValidOrdering = existingSteps.every((step, index) => 
        step.step_order === index + 1
      );
      
      if (!hasValidOrdering) {
        console.warn('Steps have invalid ordering, fixing...');
        await fixStepOrdering(funnelId);
      }
      
      return;
    }

    console.log('Funnel has no steps, creating default steps...');

    // Get funnel details to create contextual steps
    const { data: funnel, error: funnelError } = await supabase
      .from('interactive_funnels')
      .select('name, description, settings')
      .eq('id', funnelId)
      .single();

    if (funnelError || !funnel) {
      console.error('Error fetching funnel details:', funnelError);
      return;
    }

    // Create default steps with valid types
    const defaultSteps = createDefaultSteps(funnel);

    // Create each step
    for (const stepData of defaultSteps) {
      try {
        await createFunnelStep(funnelId, stepData);
        console.log(`Created step: ${stepData.title} (${stepData.step_type})`);
      } catch (stepError) {
        console.error(`Error creating step ${stepData.title}:`, stepError);
      }
    }

    console.log(`Created ${defaultSteps.length} default steps successfully`);
  } catch (error) {
    console.error('Error in ensureFunnelHasSteps:', error);
  }
};

/**
 * Fixes invalid step types by mapping them to valid ones
 */
const fixInvalidStepTypes = async (funnelId: string, invalidSteps: any[]): Promise<void> => {
  console.log('Fixing invalid step types...');
  
  const stepTypeMapping: Record<string, string> = {
    'quiz': 'qualification',
    'assessment': 'qualification',
    'calculator': 'qualification',
    'demo_request': 'lead_capture',
    'calendar_booking': 'contact_form',
    'social_proof': 'discovery',
    'urgency_builder': 'conversion',
    'product_showcase': 'discovery',
    'trial_signup': 'lead_capture',
    'lead_magnet': 'lead_capture',
    'feature_selection': 'qualification',
    'technical_qualification': 'qualification',
    'onboarding': 'discovery',
    'form': 'contact_form'
  };

  for (const step of invalidSteps) {
    const newType = stepTypeMapping[step.step_type] || 'qualification';
    
    try {
      await supabase
        .from('interactive_funnel_steps')
        .update({ step_type: newType })
        .eq('id', step.id);
      
      console.log(`Fixed step type: ${step.step_type} -> ${newType}`);
    } catch (error) {
      console.error(`Error fixing step type for step ${step.id}:`, error);
    }
  }
};

/**
 * Creates default steps with valid types only
 */
const createDefaultSteps = (funnel: any) => {
  const defaultSteps = [
    {
      title: 'Iniziamo',
      description: 'Condividi le tue informazioni di base',
      step_type: 'lead_capture' as const,
      step_order: 1,
      is_required: true,
      fields_config: [
        {
          id: 'name',
          type: 'text',
          label: 'Nome',
          required: true,
          placeholder: 'Il tuo nome'
        },
        {
          id: 'email',
          type: 'email',
          label: 'Email',
          required: true,
          placeholder: 'La tua email'
        }
      ],
      settings: { submitButtonText: 'Continua' }
    },
    {
      title: 'Le tue esigenze',
      description: 'Aiutaci a capire meglio le tue necessità',
      step_type: 'qualification' as const,
      step_order: 2,
      is_required: true,
      fields_config: [
        {
          id: 'needs',
          type: 'checkbox',
          label: 'Cosa stai cercando?',
          required: true,
          options: ['Qualità', 'Prezzo', 'Velocità', 'Supporto', 'Innovazione']
        }
      ],
      settings: { submitButtonText: 'Avanti' }
    },
    {
      title: 'Contattaci',
      description: 'Lasciaci i tuoi dati per essere ricontattato',
      step_type: 'contact_form' as const,
      step_order: 3,
      is_required: true,
      fields_config: [
        {
          id: 'phone',
          type: 'tel',
          label: 'Telefono',
          required: false,
          placeholder: 'Il tuo numero di telefono'
        },
        {
          id: 'message',
          type: 'textarea',
          label: 'Messaggio',
          required: false,
          placeholder: 'Raccontaci di più...'
        }
      ],
      settings: { submitButtonText: 'Invia richiesta' }
    }
  ];

  return defaultSteps;
};

/**
 * Fixes step ordering for a funnel
 */
const fixStepOrdering = async (funnelId: string): Promise<void> => {
  try {
    const { data: steps, error } = await supabase
      .from('interactive_funnel_steps')
      .select('id')
      .eq('funnel_id', funnelId)
      .order('step_order');

    if (error || !steps) {
      console.error('Error fetching steps for reordering:', error);
      return;
    }

    // Update each step with correct order
    for (let i = 0; i < steps.length; i++) {
      await supabase
        .from('interactive_funnel_steps')
        .update({ step_order: i + 1 })
        .eq('id', steps[i].id);
    }

    console.log(`Fixed ordering for ${steps.length} steps`);
  } catch (error) {
    console.error('Error fixing step ordering:', error);
  }
};

/**
 * Validates a funnel's completeness and fixes common issues
 */
export const validateAndFixFunnel = async (funnelId: string): Promise<boolean> => {
  try {
    console.log(`Starting validation for funnel: ${funnelId}`);
    
    // Ensure funnel has steps
    await ensureFunnelHasSteps(funnelId);

    // Validate funnel is properly configured
    const { data: funnel, error } = await supabase
      .from('interactive_funnels')
      .select('is_public, status, settings')
      .eq('id', funnelId)
      .single();

    if (error || !funnel) {
      console.error('Error validating funnel configuration:', error);
      return false;
    }

    // Ensure public funnels are active
    if (funnel.is_public && funnel.status !== 'active') {
      await supabase
        .from('interactive_funnels')
        .update({ status: 'active' })
        .eq('id', funnelId);
      
      console.log('Updated public funnel to active status');
    }

    console.log('Funnel validation completed successfully');
    return true;
  } catch (error) {
    console.error('Error validating funnel:', error);
    return false;
  }
};

/**
 * Performs health check on all public funnels
 */
export const performFunnelHealthCheck = async (): Promise<void> => {
  try {
    console.log('Starting funnel health check...');
    
    const { data: publicFunnels, error } = await supabase
      .from('interactive_funnels')
      .select('id, name')
      .eq('is_public', true);

    if (error || !publicFunnels) {
      console.error('Error fetching public funnels for health check:', error);
      return;
    }

    console.log(`Checking health of ${publicFunnels.length} public funnels...`);

    for (const funnel of publicFunnels) {
      await validateAndFixFunnel(funnel.id);
    }

    console.log('Funnel health check completed');
  } catch (error) {
    console.error('Error in funnel health check:', error);
  }
};
