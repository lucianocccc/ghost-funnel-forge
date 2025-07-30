import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GhostFunnelRequest {
  businessName: string
  businessType: string
  email: string
  description: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { businessName, businessType, email, description }: GhostFunnelRequest = await req.json()

    console.log('Generating ghost funnel for:', { businessName, businessType, email })

    // Generate funnel data directly in the function for now
    const data = {
      hero: {
        title: `Benvenuto in ${businessName}`,
        subtitle: `Soluzioni su misura per ${businessType}: innovazione, fiducia e risultati concreti.`
      },
      advantages: [
        {
          title: 'Esperienza Specializzata',
          description: `Decenni di esperienza nel settore ${businessType} ci rendono il partner ideale.`
        },
        {
          title: 'Tecnologia al Servizio del Successo',
          description: 'Utilizziamo strumenti avanzati per ottimizzare ogni fase del tuo business.'
        },
        {
          title: 'Supporto Continuo',
          description: 'Ti seguiamo passo dopo passo, dalla strategia all\'esecuzione.'
        }
      ],
      emotional: {
        title: 'Il Tuo Progetto Merita di Più',
        description: `${description} è solo l'inizio: con noi, ogni idea prende forma concreta.`
      },
      cta: {
        text: 'Richiedi il tuo Funnel Personalizzato',
        urgency: 'Posti limitati – Approfitta ora del nostro servizio gratuito!'
      }
    }

    console.log('Generated funnel data:', data)

    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error generating ghost funnel:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate ghost funnel',
        details: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})