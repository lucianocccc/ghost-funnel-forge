
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface FunnelHealthResult {
  funnelsChecked: number;
  funnelsRepaired: number;
  errors: string[];
  details: Array<{
    funnelId: string;
    funnelName: string;
    action: 'ok' | 'repaired' | 'error';
    message: string;
  }>;
}

export default async function handler(req: Request): Promise<Response> {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('🔥 Funnel Health Check started');

  try {
    const result: FunnelHealthResult = {
      funnelsChecked: 0,
      funnelsRepaired: 0,
      errors: [],
      details: []
    };

    // 1. Identificare tutti i funnel pubblici
    const { data: publicFunnels, error: fetchError } = await supabase
      .from('interactive_funnels')
      .select('id, name, created_by')
      .eq('is_public', true);

    if (fetchError) {
      console.error('❌ Error fetching public funnels:', fetchError);
      throw new Error(`Failed to fetch public funnels: ${fetchError.message}`);
    }

    console.log(`📊 Found ${publicFunnels?.length || 0} public funnels to check`);
    result.funnelsChecked = publicFunnels?.length || 0;

    if (!publicFunnels || publicFunnels.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No public funnels found',
        result
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    // 2. Controllare e riparare ogni funnel
    for (const funnel of publicFunnels) {
      try {
        console.log(`🔍 Checking funnel: ${funnel.name} (${funnel.id})`);

        // Controllare se ha step
        const { data: steps, error: stepsError } = await supabase
          .from('interactive_funnel_steps')
          .select('id, step_order, title')
          .eq('funnel_id', funnel.id)
          .order('step_order');

        if (stepsError) {
          console.error(`❌ Error checking steps for ${funnel.name}:`, stepsError);
          result.errors.push(`Error checking steps for ${funnel.name}: ${stepsError.message}`);
          result.details.push({
            funnelId: funnel.id,
            funnelName: funnel.name,
            action: 'error',
            message: `Error checking steps: ${stepsError.message}`
          });
          continue;
        }

        if (!steps || steps.length === 0) {
          console.log(`🔧 Funnel ${funnel.name} has no steps, creating defaults...`);

          // Ottenere dettagli del funnel per creare step contestuali
          const { data: funnelDetails, error: detailsError } = await supabase
            .from('interactive_funnels')
            .select('name, description, settings')
            .eq('id', funnel.id)
            .single();

          if (detailsError) {
            console.error(`❌ Error fetching funnel details for ${funnel.name}:`, detailsError);
            result.errors.push(`Error fetching details for ${funnel.name}: ${detailsError.message}`);
            result.details.push({
              funnelId: funnel.id,
              funnelName: funnel.name,
              action: 'error',
              message: `Error fetching details: ${detailsError.message}`
            });
            continue;
          }

          // Creare step contestuali
          const defaultSteps = createContextualSteps(funnelDetails);
          
          // Inserire gli step
          let stepsCreated = 0;
          for (const stepData of defaultSteps) {
            const { error: insertError } = await supabase
              .from('interactive_funnel_steps')
              .insert({
                ...stepData,
                funnel_id: funnel.id
              });

            if (insertError) {
              console.error(`❌ Error creating step ${stepData.title}:`, insertError);
              result.errors.push(`Error creating step ${stepData.title} for ${funnel.name}: ${insertError.message}`);
            } else {
              stepsCreated++;
            }
          }

          if (stepsCreated > 0) {
            result.funnelsRepaired++;
            result.details.push({
              funnelId: funnel.id,
              funnelName: funnel.name,
              action: 'repaired',
              message: `Created ${stepsCreated} contextual steps`
            });

            // Inviare notifica al proprietario (se implementato)
            await notifyFunnelOwner(funnel.id, funnel.name, funnel.created_by, stepsCreated);
          } else {
            result.details.push({
              funnelId: funnel.id,
              funnelName: funnel.name,
              action: 'error',
              message: 'Failed to create any steps'
            });
          }
        } else {
          console.log(`✅ Funnel ${funnel.name} already has ${steps.length} steps`);
          result.details.push({
            funnelId: funnel.id,
            funnelName: funnel.name,
            action: 'ok',
            message: `Already has ${steps.length} steps`
          });
        }
      } catch (error) {
        console.error(`❌ Error processing funnel ${funnel.name}:`, error);
        result.errors.push(`Error processing ${funnel.name}: ${error.message}`);
        result.details.push({
          funnelId: funnel.id,
          funnelName: funnel.name,
          action: 'error',
          message: `Processing error: ${error.message}`
        });
      }
    }

    console.log(`🎉 Health check completed: ${result.funnelsRepaired} funnels repaired out of ${result.funnelsChecked} checked`);

    return new Response(JSON.stringify({
      success: true,
      message: `Health check completed: ${result.funnelsRepaired} funnels repaired`,
      result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('❌ Health check failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: 'Health check process failed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
}

// Funzione per creare step contestuali
function createContextualSteps(funnel: any) {
  const funnelName = funnel.name || '';
  const settings = funnel.settings || {};
  const isProductSpecific = settings.productSpecific || settings.focusType === 'product-centric';
  
  // Determinare contesto dal nome del funnel e impostazioni
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
}

// Step per routine mattutine
function createMorningRoutineSteps() {
  return [
    {
      title: 'Benvenuto nel tuo percorso mattutino',
      description: 'Scopriamo insieme come migliorare le tue mattine',
      step_type: 'quiz',
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
      step_type: 'assessment',
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
      step_type: 'contact_form',
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
}

// Step per prodotti
function createProductSteps(productName: string) {
  return [
    {
      title: 'Scopri come può aiutarti',
      description: `Vediamo se ${productName} è la soluzione che stai cercando`,
      step_type: 'quiz',
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
      step_type: 'assessment',
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
      step_type: 'contact_form',
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
}

// Step per business
function createBusinessSteps() {
  return [
    {
      title: 'Il tuo business attuale',
      description: 'Raccontaci del tuo business per offrirti le soluzioni migliori',
      step_type: 'quiz',
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
      step_type: 'assessment',
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
      step_type: 'contact_form',
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
}

// Step generali
function createGeneralSteps(funnelName: string) {
  return [
    {
      title: 'Benvenuto',
      description: `Iniziamo questo percorso insieme per ${funnelName}`,
      step_type: 'quiz',
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
      step_type: 'assessment',
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
      step_type: 'contact_form',
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
}

// Funzione per notificare il proprietario del funnel
async function notifyFunnelOwner(funnelId: string, funnelName: string, ownerId: string, stepsCreated: number) {
  try {
    console.log(`📧 Notifying owner ${ownerId} about funnel ${funnelName} repair`);
    
    // Qui si può implementare l'invio di email o notifiche
    // Per ora salviamo solo un log nella tabella di analytics
    await supabase
      .from('funnel_analytics_events')
      .insert({
        funnel_id: funnelId,
        event_type: 'funnel_auto_repaired',
        event_data: {
          funnel_name: funnelName,
          steps_created: stepsCreated,
          repaired_at: new Date().toISOString(),
          repair_type: 'auto_health_check'
        }
      });

    console.log(`✅ Notification logged for funnel ${funnelName}`);
  } catch (error) {
    console.error(`❌ Error notifying owner for ${funnelName}:`, error);
  }
}
