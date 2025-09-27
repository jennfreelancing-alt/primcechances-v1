import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from 'https://esm.sh/resend@2.0.0'

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
    const { email, userName, resetUrl } = await req.json()

    // Check for required environment variables
    const resendApiKey = Deno.env.get('RESEND_API_KEY') || Deno.env.get('VITE_RESEND_API')
    if (!resendApiKey) {
      console.error('RESEND_API_KEY or VITE_RESEND_API environment variable is not set')
      return new Response(
        JSON.stringify({ success: false, error: 'RESEND_API_KEY not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Resend
    const resend = new Resend(resendApiKey)

    if (!email || !resetUrl) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required parameters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate a custom reset URL that includes a special parameter to identify it as our custom email
    const customResetUrl = `${resetUrl}?source=resend&email=${encodeURIComponent(email)}`

    // Send custom password reset email
    console.log('Attempting to send email via Resend:', { email, userName, customResetUrl })
    
    const { data, error } = await resend.emails.send({
      from: 'PrimeChances <noreply@primechances.com>',
      to: [email],
      subject: '🔐 Reset Your Password - PrimeChances',
      html: generatePasswordResetEmailHTML(userName || email.split('@')[0], customResetUrl),
    })

    if (error) {
      console.error('Resend email error details:', {
        error,
        errorMessage: error.message,
        errorName: error.name,
        email,
        from: 'PrimeChances <noreply@primechances.com>'
      })
      return new Response(
        JSON.stringify({ success: false, error: `Failed to send email: ${error.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Custom password reset email sent successfully:', data)
    return new Response(
      JSON.stringify({ success: true, messageId: data?.id, customResetUrl }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function generatePasswordResetEmailHTML(userName: string, resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - PrimeChances</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset Request</h1>
          <p>PrimeChances Security</p>
        </div>
        <div class="content">
          <h2>Hello ${userName}!</h2>
          <p>We received a request to reset your password for your PrimeChances account.</p>
          
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" class="button">Reset My Password</a>
          
          <div class="warning">
            <strong>⚠️ Important:</strong>
            <ul>
              <li>This link will expire in 1 hour</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>For security, never share this link with anyone</li>
            </ul>
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px;">${resetUrl}</p>
          
          <p>Best regards,<br>The PrimeChances Team</p>
        </div>
        <div class="footer">
          <p>© 2024 PrimeChances. All rights reserved.</p>
          <p>This is an automated security email from PrimeChances.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
