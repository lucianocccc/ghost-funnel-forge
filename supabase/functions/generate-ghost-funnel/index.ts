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

    // Call the database function
    const { data, error } = await supabase.rpc('generate_ghost_funnel', {
      business_name: businessName,
      business_type: businessType,
      email: email,
      description: description
    })

    if (error) {
      console.error('Database function error:', error)
      throw error
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