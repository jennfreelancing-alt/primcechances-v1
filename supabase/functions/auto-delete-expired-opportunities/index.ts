import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExpiredOpportunity {
  id: string;
  title: string;
  organization: string;
  application_deadline: string;
  created_at: string;
  published_at: string | null;
}

interface DeletionLog {
  opportunity_id: string;
  title: string;
  organization: string;
  application_deadline: string;
  days_expired: number;
  deletion_reason: string;
  deleted_at: string;
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

    console.log('Starting auto-deletion of expired opportunities...')

    // Get current timestamp
    const now = new Date()
    const currentTimestamp = now.toISOString()

    // Query for expired opportunities
    // Opportunities are considered expired if:
    // 1. They have an application_deadline
    // 2. The deadline has passed
    // 3. They are published (we don't delete drafts)
    const { data: expiredOpportunities, error: queryError } = await supabaseClient
      .from('opportunities')
      .select(`
        id,
        title,
        organization,
        application_deadline,
        created_at,
        published_at
      `)
      .not('application_deadline', 'is', null)
      .lt('application_deadline', currentTimestamp)
      .eq('is_published', true)
      .eq('status', 'approved')

    if (queryError) {
      console.error('Error querying expired opportunities:', queryError)
      throw queryError
    }

    console.log(`Found ${expiredOpportunities?.length || 0} expired opportunities`)

    if (!expiredOpportunities || expiredOpportunities.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No expired opportunities found',
          deleted_count: 0,
          deleted_opportunities: []
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    const deletionLogs: DeletionLog[] = []
    const deletedOpportunityIds: string[] = []

    // Process each expired opportunity
    for (const opportunity of expiredOpportunities) {
      try {
        // Calculate days expired
        const deadlineDate = new Date(opportunity.application_deadline)
        const daysExpired = Math.floor((now.getTime() - deadlineDate.getTime()) / (1000 * 60 * 60 * 24))

        // Create deletion log entry
        const deletionLog: DeletionLog = {
          opportunity_id: opportunity.id,
          title: opportunity.title,
          organization: opportunity.organization,
          application_deadline: opportunity.application_deadline,
          days_expired: daysExpired,
          deletion_reason: `Application deadline expired ${daysExpired} days ago`,
          deleted_at: currentTimestamp
        }

        // Delete the opportunity
        const { error: deleteError } = await supabaseClient
          .from('opportunities')
          .delete()
          .eq('id', opportunity.id)

        if (deleteError) {
          console.error(`Error deleting opportunity ${opportunity.id}:`, deleteError)
          continue
        }

        // Log the deletion in both admin_activity_logs and auto_deletion_logs
        const { error: logError } = await supabaseClient
          .from('admin_activity_logs')
          .insert({
            admin_id: '00000000-0000-0000-0000-000000000000', // System user ID
            action: 'OPPORTUNITY_AUTO_DELETED',
            target_type: 'opportunity',
            target_id: opportunity.id,
            details: {
              title: opportunity.title,
              organization: opportunity.organization,
              application_deadline: opportunity.application_deadline,
              days_expired: daysExpired,
              deletion_reason: deletionLog.deletion_reason,
              auto_deleted: true
            }
          })

        if (logError) {
          console.error(`Error logging deletion for opportunity ${opportunity.id}:`, logError)
        }

        // Also log in the dedicated auto_deletion_logs table
        const { error: autoLogError } = await supabaseClient
          .from('auto_deletion_logs')
          .insert(deletionLog)

        if (autoLogError) {
          console.error(`Error logging auto-deletion for opportunity ${opportunity.id}:`, autoLogError)
        }

        deletionLogs.push(deletionLog)
        deletedOpportunityIds.push(opportunity.id)

        console.log(`Successfully deleted expired opportunity: ${opportunity.title} (${opportunity.organization})`)

      } catch (error) {
        console.error(`Error processing opportunity ${opportunity.id}:`, error)
        continue
      }
    }

    // Log the batch deletion activity
    if (deletedOpportunityIds.length > 0) {
      const { error: batchLogError } = await supabaseClient
        .from('admin_activity_logs')
        .insert({
          admin_id: '00000000-0000-0000-0000-000000000000', // System user ID
          action: 'BATCH_AUTO_DELETION_COMPLETED',
          target_type: 'opportunities',
          target_id: null,
          details: {
            deleted_count: deletedOpportunityIds.length,
            deleted_opportunity_ids: deletedOpportunityIds,
            execution_time: new Date().toISOString(),
            auto_deleted: true
          }
        })

      if (batchLogError) {
        console.error('Error logging batch deletion:', batchLogError)
      }
    }

    console.log(`Auto-deletion completed. Deleted ${deletedOpportunityIds.length} expired opportunities.`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully deleted ${deletedOpportunityIds.length} expired opportunities`,
        deleted_count: deletedOpportunityIds.length,
        deleted_opportunities: deletionLogs
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in auto-deletion function:', error)
    
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
