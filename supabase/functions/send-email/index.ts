import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const { to, subject, html, from, replyTo } = await req.json()

    console.log('📧 Edge Function: Received email request')
    console.log('📧 To:', to)
    console.log('📧 Subject:', subject)

    // Validate required fields
    if (!to || !subject || !html) {
      console.error('❌ Missing required fields')
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Missing required fields: to, subject, html' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get Resend API key from environment
    const resendApiKey = Deno.env.get('RESEND_API_KEY') || 're_DaV9voff_5AGkD2qffBinyBiEMhoGdCRK'
    
    console.log('🚀 Sending email via Resend API...')

    // Send email via Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: from || 'PrimeChances <noreply@mail.primechances.com>',
        to: to,
        subject: subject,
        html: html,
        reply_to: replyTo || 'support@mail.primechances.com'
      })
    })

    const result = await resendResponse.json()

    if (!resendResponse.ok) {
      console.error('❌ Resend API error:', result)
      throw new Error(result.message || 'Failed to send email')
    }

    console.log('✅ Email sent successfully!')
    console.log('📧 Message ID:', result.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: result.id,
        status: result.status || 'sent'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Email sending error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
