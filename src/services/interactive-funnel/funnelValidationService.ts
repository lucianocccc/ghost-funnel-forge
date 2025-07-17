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
      .select('id, step_order, title')
      .eq('funnel_id', funnelId)
      .order('step_order');

    if (error) {
      console.error('Error checking funnel steps:', error);
      return;
    }

    // If funnel already has steps, validate they are properly ordered
    if (existingSteps && existingSteps.length > 0) {
      console.log(`Funnel has ${existingSteps.length} existing steps, validating structure...`);
      
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

    console.log('Funnel has no steps, creating contextual default steps...');

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

    // Create contextual steps based on funnel type and settings
    const defaultSteps = createContextualSteps(funnel);

    // Create each step
    for (const stepData of defaultSteps) {
      try {
        await createFunnelStep(funnelId, stepData);
        console.log(`Created contextual step: ${stepData.title}`);
      } catch (stepError) {
        console.error(`Error creating step ${stepData.title}:`, stepError);
      }
    }

    console.log(`Created ${defaultSteps.length} contextual steps successfully`);
  } catch (error) {
    console.error('Error in ensureFunnelHasSteps:', error);
  }
};

/**
 * Creates contextual steps based on funnel characteristics
 */
const createContextualSteps = (funnel: any) => {
  const funnelName = funnel.name || '';
  const settings = funnel.settings || {};
  const isProductSpecific = settings.productSpecific || settings.focusType === 'product-centric';
  
  // Determine context from funnel name and settings
  let context = 'general';
  if (funnelName.toLowerCase().includes('aurora') || funnelName.toLowerCase().includes('mattina')) {
    context = 'morning_routine';
  } else if (isProductSpecific) {
    context = 'product';
  } else if (funnelName.toLowerCase().includes('business') || funnelName.toLowerCase().includes('azienda')) {
    context = 'business';
  }

  switch (context) {
    case 'morning_routine':
      return createMorningRoutineSteps();
    case 'product':
      return createProductSteps(settings.product_name || 'nostro prodotto');
    case 'business':
      return createBusinessSteps();
    default:
      return createGeneralSteps(funnelName);
  }
};

/**
 * Creates steps for morning routine funnels
 */
const createMorningRoutineSteps = () => [
  {
    title: 'Benvenuto nel tuo percorso mattutino',
    description: 'Scopriamo insieme come migliorare le tue mattine',
    step_type: 'quiz' as const,
    step_order: 1,
    is_required: true,
    fields_config: [
      {
        id: 'morning_situation',
        type: 'radio',
        label: 'Come descriveresti le tue mattine attuali?',
        required: true,
        options: [
          'Sempre di fretta e stressato',
          'Abbastanza organizzato ma potrei migliorare',
          'Sereno ma senza una routine fissa',
          'Completamente caotico'
        ]
      }
    ],
    settings: { submitButtonText: 'Continua' }
  },
  {
    title: 'Le tue sfide mattutine',
    description: 'Identifichiamo cosa ti impedisce di avere mattine migliori',
    step_type: 'assessment' as const,
    step_order: 2,
    is_required: true,
    fields_config: [
      {
        id: 'challenges',
        type: 'checkbox',
        label: 'Quali sono le tue principali sfide?',
        required: true,
        options: [
          'Difficoltà a svegliarmi',
          'Mancanza di energia',
          'Troppo poco tempo',
          'Stress e ansia',
          'Disorganizzazione'
        ]
      }
    ],
    settings: { submitButtonText: 'Avanti' }
  },
  {
    title: 'I tuoi dati di contatto',
    description: 'Ricevi il tuo piano mattutino personalizzato',
    step_type: 'contact_form' as const,
    step_order: 3,
    is_required: true,
    fields_config: [
      {
        id: 'name',
        type: 'text',
        label: 'Il tuo nome',
        required: true,
        placeholder: 'Come ti chiami?'
      },
      {
        id: 'email',
        type: 'email',
        label: 'La tua email',
        required: true,
        placeholder: 'Per ricevere il piano personalizzato'
      }
    ],
    settings: { submitButtonText: 'Ricevi il mio piano' }
  }
];

/**
 * Creates steps for product-focused funnels
 */
const createProductSteps = (productName: string) => [
  {
    title: 'Scopri come può aiutarti',
    description: `Vediamo se ${productName} è la soluzione che stai cercando`,
    step_type: 'quiz' as const,
    step_order: 1,
    is_required: true,
    fields_config: [
      {
        id: 'current_situation',
        type: 'radio',
        label: 'Qual è la tua situazione attuale?',
        required: true,
        options: [
          'Ho un problema urgente da risolvere',
          'Sto valutando diverse opzioni',
          'Solo curiosità al momento',
          'Ho già provato altre soluzioni'
        ]
      }
    ],
    settings: { submitButtonText: 'Continua' }
  },
  {
    title: 'Le tue esigenze specifiche',
    description: 'Aiutaci a capire meglio le tue necessità',
    step_type: 'assessment' as const,
    step_order: 2,
    is_required: true,
    fields_config: [
      {
        id: 'needs',
        type: 'checkbox',
        label: 'Cosa stai cercando principalmente?',
        required: true,
        options: [
          'Efficienza e risparmio di tempo',
          'Risultati migliori',
          'Facilità d\'uso',
          'Buon rapporto qualità-prezzo',
          'Supporto e assistenza'
        ]
      }
    ],
    settings: { submitButtonText: 'Avanti' }
  },
  {
    title: 'Ricevi informazioni personalizzate',
    description: 'Lasciaci i tuoi dati per una proposta su misura',
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
        placeholder: 'Per contatti diretti'
      }
    ],
    settings: { submitButtonText: 'Ricevi la proposta' }
  }
];

/**
 * Creates steps for business-focused funnels
 */
const createBusinessSteps = () => [
  {
    title: 'Il tuo business attuale',
    description: 'Raccontaci del tuo business per offrirti le soluzioni migliori',
    step_type: 'quiz' as const,
    step_order: 1,
    is_required: true,
    fields_config: [
      {
        id: 'business_stage',
        type: 'radio',
        label: 'In che fase si trova il tuo business?',
        required: true,
        options: [
          'Startup / Appena iniziato',
          'In crescita',
          'Consolidato',
          'In espansione'
        ]
      }
    ],
    settings: { submitButtonText: 'Continua' }
  },
  {
    title: 'Le tue sfide business',
    description: 'Identifichiamo le aree dove possiamo aiutarti di più',
    step_type: 'assessment' as const,
    step_order: 2,
    is_required: true,
    fields_config: [
      {
        id: 'business_challenges',
        type: 'checkbox',
        label: 'Quali sono le tue principali sfide?',
        required: true,
        options: [
          'Generare più lead',
          'Aumentare le conversioni',
          'Ottimizzare i processi',
          'Ridurre i costi',
          'Migliorare la qualità'
        ]
      }
    ],
    settings: { submitButtonText: 'Avanti' }
  },
  {
    title: 'Parliamone insieme',
    description: 'Lasciaci i tuoi dati per una consulenza personalizzata',
    step_type: 'contact_form' as const,
    step_order: 3,
    is_required: true,
    fields_config: [
      {
        id: 'name',
        type: 'text',
        label: 'Nome e Cognome',
        required: true,
        placeholder: 'Il tuo nome'
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email aziendale',
        required: true,
        placeholder: 'La tua email aziendale'
      },
      {
        id: 'company',
        type: 'text',
        label: 'Nome azienda',
        required: false,
        placeholder: 'La tua azienda'
      }
    ],
    settings: { submitButtonText: 'Richiedi consulenza' }
  }
];

/**
 * Creates general steps for unspecified funnels
 */
const createGeneralSteps = (funnelName: string) => [
  {
    title: 'Benvenuto',
    description: `Iniziamo questo percorso insieme per ${funnelName}`,
    step_type: 'quiz' as const,
    step_order: 1,
    is_required: true,
    fields_config: [
      {
        id: 'interest_level',
        type: 'radio',
        label: 'Cosa ti ha portato qui?',
        required: true,
        options: [
          'Ho un bisogno specifico',
          'Sto esplorando le opzioni',
          'Solo curiosità',
          'Raccomandazione di qualcuno'
        ]
      }
    ],
    settings: { submitButtonText: 'Continua' }
  },
  {
    title: 'Le tue priorità',
    description: 'Aiutaci a capire meglio le tue esigenze',
    step_type: 'assessment' as const,
    step_order: 2,
    is_required: true,
    fields_config: [
      {
        id: 'priorities',
        type: 'checkbox',
        label: 'Quali sono le tue principali priorità?',
        required: true,
        options: [
          'Qualità e affidabilità',
          'Velocità e efficienza',
          'Prezzo competitivo',
          'Supporto e assistenza',
          'Innovazione'
        ]
      }
    ],
    settings: { submitButtonText: 'Avanti' }
  },
  {
    title: 'Rimaniamo in contatto',
    description: 'Lasciaci i tuoi dati per ricevere informazioni personalizzate',
    step_type: 'contact_form' as const,
    step_order: 3,
    is_required: true,
    fields_config: [
      {
        id: 'name',
        type: 'text',
        label: 'Il tuo nome',
        required: true,
        placeholder: 'Come ti chiami?'
      },
      {
        id: 'email',
        type: 'email',
        label: 'La tua email',
        required: true,
        placeholder: 'La tua email'
      }
    ],
    settings: { submitButtonText: 'Ricevi informazioni' }
  }
];

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
