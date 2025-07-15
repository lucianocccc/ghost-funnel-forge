
import { supabase } from '@/integrations/supabase/client';
import { createFunnelStep } from './funnelStepsService';

/**
 * Validates that a funnel has the minimum required steps and creates default ones if missing
 */
export const ensureFunnelHasSteps = async (funnelId: string): Promise<void> => {
  try {
    // Check if funnel has steps
    const { data: existingSteps, error } = await supabase
      .from('interactive_funnel_steps')
      .select('id')
      .eq('funnel_id', funnelId);

    if (error) {
      console.error('Error checking funnel steps:', error);
      return;
    }

    // If funnel already has steps, no need to create defaults
    if (existingSteps && existingSteps.length > 0) {
      console.log('Funnel already has steps, skipping default creation');
      return;
    }

    console.log('Funnel has no steps, creating default steps...');

    // Get funnel details to create contextual steps
    const { data: funnel, error: funnelError } = await supabase
      .from('interactive_funnels')
      .select('name, description')
      .eq('id', funnelId)
      .single();

    if (funnelError || !funnel) {
      console.error('Error fetching funnel details:', funnelError);
      return;
    }

    // Create default steps
    const defaultSteps = [
      {
        title: 'Benvenuto',
        description: `Iniziamo questo percorso insieme per ${funnel.name}`,
        step_type: 'quiz' as const,
        step_order: 1,
        is_required: true,
        fields_config: [
          {
            id: 'welcome_response',
            type: 'radio',
            label: 'Come hai sentito parlare di noi?',
            required: true,
            options: [
              'Ricerca online',
              'Social media',
              'Passaparola',
              'Pubblicità',
              'Altro'
            ]
          }
        ],
        settings: { submitButtonText: 'Continua' }
      },
      {
        title: 'Le tue esigenze',
        description: 'Aiutaci a capire meglio le tue necessità',
        step_type: 'assessment' as const,
        step_order: 2,
        is_required: true,
        fields_config: [
          {
            id: 'needs_assessment',
            type: 'checkbox',
            label: 'Quali sono le tue principali priorità?',
            required: true,
            options: [
              'Migliorare l\'efficienza',
              'Ridurre i costi',
              'Aumentare le vendite',
              'Ottimizzare i processi',
              'Altro'
            ]
          }
        ],
        settings: { submitButtonText: 'Avanti' }
      },
      {
        title: 'I tuoi contatti',
        description: 'Lasciaci i tuoi dati per ricevere una proposta personalizzata',
        step_type: 'contact_form' as const,
        step_order: 3,
        is_required: true,
        fields_config: [
          {
            id: 'name',
            type: 'text',
            label: 'Nome e Cognome',
            required: true,
            placeholder: 'Il tuo nome completo'
          },
          {
            id: 'email',
            type: 'email',
            label: 'Email',
            required: true,
            placeholder: 'La tua email'
          },
          {
            id: 'phone',
            type: 'tel',
            label: 'Telefono',
            required: false,
            placeholder: 'Il tuo numero di telefono'
          }
        ],
        settings: { submitButtonText: 'Ricevi la proposta' }
      }
    ];

    // Create each step
    for (const stepData of defaultSteps) {
      try {
        await createFunnelStep(funnelId, stepData);
        console.log(`Created default step: ${stepData.title}`);
      } catch (stepError) {
        console.error(`Error creating step ${stepData.title}:`, stepError);
      }
    }

    console.log('Default steps created successfully');
  } catch (error) {
    console.error('Error in ensureFunnelHasSteps:', error);
  }
};

/**
 * Validates a funnel's completeness and fixes common issues
 */
export const validateAndFixFunnel = async (funnelId: string): Promise<boolean> => {
  try {
    // Ensure funnel has steps
    await ensureFunnelHasSteps(funnelId);

    // Additional validations can be added here
    return true;
  } catch (error) {
    console.error('Error validating funnel:', error);
    return false;
  }
};
