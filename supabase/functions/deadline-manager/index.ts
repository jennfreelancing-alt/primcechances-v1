
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting deadline management job')

    // Call the function to expire past deadline opportunities
    const { error: expireError } = await supabase.rpc('expire_past_deadline_opportunities')

    if (expireError) {
      console.error('Error expiring opportunities:', expireError)
      throw expireError
    }

    // Get count of expired opportunities
    const { count: expiredCount } = await supabase
      .from('opportunities')
      .select('*', { count: 'exact', head: true })
      .lt('application_deadline', new Date().toISOString())
      .eq('is_published', false)
      .eq('source', 'scraped')

    // Get upcoming deadlines (within 7 days)
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

    const { data: upcomingDeadlines, error: upcomingError } = await supabase
      .from('opportunities')
      .select(`
        id,
        title,
        organization,
        application_deadline,
        user_bookmarks (
          user_id
        )
      `)
      .eq('is_published', true)
      .gte('application_deadline', new Date().toISOString())
      .lte('application_deadline', sevenDaysFromNow.toISOString())

    if (upcomingError) {
      console.error('Error fetching upcoming deadlines:', upcomingError)
    }

    // TODO: Send notifications to users about upcoming deadlines
    // This would require implementing a notification system

    console.log(`Deadline management completed: ${expiredCount || 0} opportunities expired, ${upcomingDeadlines?.length || 0} upcoming deadlines`)

    return new Response(
      JSON.stringify({
        message: 'Deadline management completed',
        expired_count: expiredCount || 0,
        upcoming_deadlines: upcomingDeadlines?.length || 0,
        upcoming_opportunities: upcomingDeadlines || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Deadline management error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
