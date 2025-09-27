import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@2.0.0'
import { encodeBase64 } from "https://deno.land/std@0.168.0/encoding/base64.ts"

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
    const { action, email, token, newPassword } = await req.json()

    // Initialize Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Initialize Resend
    const resend = new Resend(Deno.env.get('RESEND_API_KEY') || Deno.env.get('VITE_RESEND_API'))

    if (action === 'request_reset') {
      return await handlePasswordResetRequest(supabaseClient, resend, email)
    } else if (action === 'confirm_reset') {
      return await handlePasswordResetConfirm(supabaseClient, token, newPassword)
    } else if (action === 'update_password') {
      return await handlePasswordUpdate(supabaseClient, email, newPassword)
    } else {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid action' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
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

async function handlePasswordResetRequest(supabaseClient: any, resend: any, email: string) {
  try {
    // Check if user exists by looking up user by email
    const { data: user, error: userError } = await supabaseClient.auth.admin.getUserByEmail(email)
    
    if (userError || !user.user) {
      // Don't reveal if email exists for security
      console.log('User not found for email:', email)
      return new Response(
        JSON.stringify({ success: true }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate secure token using Deno's crypto
    const tokenArray = new Uint8Array(32)
    crypto.getRandomValues(tokenArray)
    const token = encodeBase64(tokenArray)
    const hashedToken = await hashToken(token)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store token in database
    const { error: tokenError } = await supabaseClient
      .from('password_reset_tokens')
      .insert({
        token_hash: hashedToken,
        user_id: user.user.id,
        email: email,
        expires_at: expiresAt.toISOString(),
        used: false
      })

    if (tokenError) {
      throw tokenError
    }

    // Send email
    const resetUrl = `${Deno.env.get('SITE_URL')}/reset-password?token=${token}`
    
    const { error: emailError } = await resend.emails.send({
      from: 'PrimeChances <noreply@mail.primechances.com>',
      to: [email],
      subject: 'Reset Your PrimeChances Password',
      html: generatePasswordResetEmailHTML(email.split('@')[0], resetUrl)
    })

    if (emailError) {
      console.error('Email error:', emailError)
      throw emailError
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Password reset request error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to process reset request' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function handlePasswordResetConfirm(supabaseClient: any, token: string, newPassword: string) {
  try {
    // Hash the token to find it in database
    const hashedToken = await hashToken(token)

    // Find and verify token
    const { data: tokenData, error: tokenError } = await supabaseClient
      .from('password_reset_tokens')
      .select('*')
      .eq('token_hash', hashedToken)
      .eq('used', false)
      .single()

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired reset token' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if token is expired
    const now = new Date()
    const expiresAt = new Date(tokenData.expires_at)
    
    if (now > expiresAt) {
      return new Response(
        JSON.stringify({ success: false, error: 'Reset token has expired' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update user password
    const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
      tokenData.user_id,
      { password: newPassword }
    )

    if (updateError) {
      throw updateError
    }

    // Mark token as used
    await supabaseClient
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('token_hash', hashedToken)

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Password reset confirm error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to reset password' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function handlePasswordUpdate(supabaseClient: any, email: string, newPassword: string) {
  try {
    // Get user by email
    const { data: user, error: userError } = await supabaseClient.auth.admin.getUserByEmail(email)
    
    if (userError || !user.user) {
      console.error('User not found for password update:', email, userError)
      return new Response(
        JSON.stringify({ success: false, error: 'User not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update user password using Supabase Admin API
    const { data: updateData, error: updateError } = await supabaseClient.auth.admin.updateUserById(
      user.user.id,
      { password: newPassword }
    )

    if (updateError) {
      console.error('Password update error:', updateError)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to update password' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Password updated successfully for user:', email)
    return new Response(
      JSON.stringify({ success: true, message: 'Password updated successfully' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Password update error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(token)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = new Uint8Array(hashBuffer)
  return encodeBase64(hashArray)
}

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
