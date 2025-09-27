
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user_id, email } = await req.json()

    if (!user_id || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing user_id or email' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Checking admin status for user: ${email}`)

    // Get admin emails from environment variable
    const adminEmails = Deno.env.get('ADMIN_EMAILS') || ''
    
    if (!adminEmails) {
      console.log('No ADMIN_EMAILS environment variable set')
      return new Response(
        JSON.stringify({ message: 'No admin emails configured', is_admin: false }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if email is in admin list using our database function
    const { data: isAdminResult, error: checkError } = await supabaseClient
      .rpc('is_admin_email', {
        email_address: email,
        admin_emails_list: adminEmails
      })

    if (checkError) {
      console.error('Error checking admin status:', checkError)
      return new Response(
        JSON.stringify({ error: 'Error checking admin status' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (isAdminResult) {
      console.log(`User ${email} is an admin, assigning role`)
      
      // First, remove any existing admin role to avoid duplicates
      await supabaseClient
        .from('user_roles')
        .delete()
        .eq('user_id', user_id)
        .eq('role', 'admin')

      // Assign admin role
      const { error: roleError } = await supabaseClient
        .from('user_roles')
        .insert({
          user_id: user_id,
          role: 'admin'
        })

      if (roleError) {
        console.error('Error assigning admin role:', roleError)
        return new Response(
          JSON.stringify({ error: 'Error assigning admin role' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log(`Admin role assigned to user ${email}`)
      return new Response(
        JSON.stringify({ message: 'Admin role assigned', is_admin: true }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ message: 'User is not an admin', is_admin: false }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
