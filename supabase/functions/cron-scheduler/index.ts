import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting scheduled auto-deletion of expired opportunities...')

    // Check if auto-deletion feature is enabled
    const { data: featureToggle, error: toggleError } = await supabaseClient
      .from('feature_toggles')
      .select('is_enabled')
      .eq('feature_key', 'auto_delete_expired_opportunities')
      .single()

    if (toggleError) {
      console.error('Error checking auto-deletion feature toggle:', toggleError)
      throw toggleError
    }

    if (!featureToggle?.is_enabled) {
      console.log('Auto-deletion feature is disabled, skipping...')
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Auto-deletion feature is disabled',
          deleted_count: 0,
          deleted_opportunities: []
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Call the auto-deletion function
    const { data, error } = await supabaseClient.functions.invoke('auto-delete-expired-opportunities')

    if (error) {
      console.error('Error calling auto-deletion function:', error)
      throw error
    }

    console.log(`Scheduled auto-deletion completed. Result:`, data)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Scheduled auto-deletion completed',
        deleted_count: data.deleted_count || 0,
        deleted_opportunities: data.deleted_opportunities || []
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in scheduled auto-deletion:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        deleted_count: 0,
        deleted_opportunities: []
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
