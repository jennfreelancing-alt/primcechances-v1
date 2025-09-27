import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  type: 'welcome' | 'password_reset' | 'opportunity_notification' | 'application_confirmation' | 'admin_notification' | 'custom';
  data: any;
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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the request body
    const { type, data }: EmailRequest = await req.json()

    // Validate required environment variables
    const resendApiKey = Deno.env.get('VITE_RESEND_API')
    if (!resendApiKey) {
      throw new Error('Resend API key is not configured')
    }

    // Initialize Resend
    const resend = new Resend(resendApiKey)

    let emailResult

    switch (type) {
      case 'welcome':
        emailResult = await sendWelcomeEmail(resend, data)
        break
      case 'password_reset':
        emailResult = await sendPasswordResetEmail(resend, data)
        break
      case 'opportunity_notification':
        emailResult = await sendOpportunityNotificationEmail(resend, data)
        break
      case 'application_confirmation':
        emailResult = await sendApplicationConfirmationEmail(resend, data)
        break
      case 'admin_notification':
        emailResult = await sendAdminNotificationEmail(resend, data)
        break
      case 'custom':
        emailResult = await sendCustomEmail(resend, data)
        break
      default:
        throw new Error(`Unknown email type: ${type}`)
    }

    return new Response(
      JSON.stringify({ success: true, result: emailResult }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in email-notifications function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

// Email template functions
async function sendWelcomeEmail(resend: Resend, data: any) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to PrimeChances</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to PrimeChances!</h1>
          <p>Your gateway to premium opportunities</p>
        </div>
        <div class="content">
          <h2>Hello ${data.userName}!</h2>
          <p>Welcome to PrimeChances! We're thrilled to have you join our community of ambitious professionals.</p>
          
          <p>With PrimeChances, you'll get access to:</p>
          <ul>
            <li>🎯 Curated high-quality job opportunities</li>
            <li>🤖 AI-powered application assistance</li>
            <li>📊 Personalized career insights</li>
            <li>💼 Professional document generation</li>
          </ul>
          
          <p>Ready to start your journey?</p>
          <a href="${data.loginUrl}" class="button">Get Started Now</a>
          
          <p>If you have any questions, feel free to reach out to our support team.</p>
          
          <p>Best regards,<br>The PrimeChances Team</p>
        </div>
        <div class="footer">
          <p>© 2024 PrimeChances. All rights reserved.</p>
          <p>You received this email because you signed up for PrimeChances.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return await resend.emails.send({
    from: 'PrimeChances <noreply@mail.primechances.com>',
    to: data.userEmail,
    subject: 'Welcome to PrimeChances! 🎉',
    html,
    tags: [
      { name: 'type', value: 'welcome' },
      { name: 'user', value: data.userEmail }
    ]
  })
}

async function sendPasswordResetEmail(resend: Resend, data: any) {
  const html = `
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
          <h2>Hello ${data.userName}!</h2>
          <p>We received a request to reset your password for your PrimeChances account.</p>
          
          <p>Click the button below to reset your password:</p>
          <a href="${data.resetUrl}" class="button">Reset My Password</a>
          
          <div class="warning">
            <strong>⚠️ Important:</strong>
            <ul>
              <li>This link will expire in ${data.expiresIn}</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>For security, never share this link with anyone</li>
            </ul>
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px;">${data.resetUrl}</p>
          
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

  return await resend.emails.send({
    from: 'PrimeChances <noreply@mail.primechances.com>',
    to: data.userEmail,
    subject: 'Reset Your PrimeChances Password',
    html,
    tags: [
      { name: 'type', value: 'password_reset' },
      { name: 'user', value: data.userEmail }
    ]
  })
}

async function sendOpportunityNotificationEmail(resend: Resend, data: any) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Opportunity - PrimeChances</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .opportunity-card { background: white; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .deadline { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 5px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 New Opportunity Alert!</h1>
          <p>PrimeChances Notification</p>
        </div>
        <div class="content">
          <h2>Hello ${data.userName}!</h2>
          <p>We found a new opportunity that matches your profile!</p>
          
          <div class="opportunity-card">
            <h3>${data.opportunityTitle}</h3>
            <p><strong>Company:</strong> ${data.companyName}</p>
            ${data.deadline ? `<div class="deadline"><strong>⏰ Deadline:</strong> ${data.deadline}</div>` : ''}
          </div>
          
          <p>Don't miss out on this opportunity!</p>
          <a href="${data.opportunityUrl}" class="button">View Opportunity</a>
          
          <p>Good luck with your application!</p>
          <p>Best regards,<br>The PrimeChances Team</p>
        </div>
        <div class="footer">
          <p>© 2024 PrimeChances. All rights reserved.</p>
          <p>You received this email because you're subscribed to opportunity notifications.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return await resend.emails.send({
    from: 'PrimeChances <noreply@mail.primechances.com>',
    to: data.userEmail,
    subject: `🎯 New Opportunity: ${data.opportunityTitle}`,
    html,
    tags: [
      { name: 'type', value: 'opportunity_notification' },
      { name: 'user', value: data.userEmail },
      { name: 'company', value: data.companyName }
    ]
  })
}

async function sendApplicationConfirmationEmail(resend: Resend, data: any) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Confirmation - PrimeChances</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .confirmation-card { background: white; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .success { color: #28a745; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Application Submitted!</h1>
          <p>PrimeChances Confirmation</p>
        </div>
        <div class="content">
          <h2>Hello ${data.userName}!</h2>
          <p class="success">Your application has been successfully submitted!</p>
          
          <div class="confirmation-card">
            <h3>Application Details</h3>
            <p><strong>Position:</strong> ${data.opportunityTitle}</p>
            <p><strong>Company:</strong> ${data.companyName}</p>
            <p><strong>Submitted:</strong> ${data.applicationDate}</p>
          </div>
          
          <p>What happens next?</p>
          <ul>
            <li>📧 The company will review your application</li>
            <li>📞 You may be contacted for an interview</li>
            <li>📊 Track your application status in your dashboard</li>
          </ul>
          
          <p>Keep applying to more opportunities to increase your chances!</p>
          
          <p>Best regards,<br>The PrimeChances Team</p>
        </div>
        <div class="footer">
          <p>© 2024 PrimeChances. All rights reserved.</p>
          <p>This is an automated confirmation email from PrimeChances.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return await resend.emails.send({
    from: 'PrimeChances <noreply@mail.primechances.com>',
    to: data.userEmail,
    subject: `✅ Application Submitted: ${data.opportunityTitle}`,
    html,
    tags: [
      { name: 'type', value: 'application_confirmation' },
      { name: 'user', value: data.userEmail },
      { name: 'company', value: data.companyName }
    ]
  })
}

async function sendAdminNotificationEmail(resend: Resend, data: any) {
  let subject = '';
  let content = '';
  
  switch (data.notificationType) {
    case 'new_user':
      subject = '👤 New User Registration';
      content = `
        <h2>New User Registration</h2>
        <p>A new user has registered on PrimeChances:</p>
        <ul>
          <li><strong>Email:</strong> ${data.data.email}</li>
          <li><strong>Name:</strong> ${data.data.full_name || 'Not provided'}</li>
          <li><strong>Registration Date:</strong> ${data.data.created_at}</li>
        </ul>
      `;
      break;
    case 'new_application':
      subject = '📝 New Application Submitted';
      content = `
        <h2>New Application Submitted</h2>
        <p>A new application has been submitted:</p>
        <ul>
          <li><strong>User:</strong> ${data.data.user_email}</li>
          <li><strong>Opportunity:</strong> ${data.data.opportunity_title}</li>
          <li><strong>Company:</strong> ${data.data.company_name}</li>
          <li><strong>Submitted:</strong> ${data.data.submitted_at}</li>
        </ul>
      `;
      break;
    case 'system_alert':
      subject = '⚠️ System Alert';
      content = `
        <h2>System Alert</h2>
        <p>${data.data.message}</p>
        <p><strong>Alert Level:</strong> ${data.data.level}</p>
        <p><strong>Timestamp:</strong> ${data.data.timestamp}</p>
      `;
      break;
  }
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Admin Notification - PrimeChances</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 Admin Notification</h1>
          <p>PrimeChances System</p>
        </div>
        <div class="content">
          ${content}
          <p>Best regards,<br>PrimeChances System</p>
        </div>
        <div class="footer">
          <p>© 2024 PrimeChances. All rights reserved.</p>
          <p>This is an automated admin notification email.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return await resend.emails.send({
    from: 'PrimeChances <noreply@mail.primechances.com>',
    to: data.adminEmail,
    subject,
    html,
    tags: [
      { name: 'type', value: 'admin_notification' },
      { name: 'notification_type', value: data.notificationType }
    ]
  })
}

async function sendCustomEmail(resend: Resend, data: any) {
  return await resend.emails.send({
    from: data.from || 'PrimeChances <noreply@mail.primechances.com>',
    to: data.to,
    subject: data.subject,
    html: data.html,
    reply_to: data.replyTo,
    tags: data.tags
  })
}

// Resend class for Deno
class Resend {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async emails() {
    return {
      send: async (data: any) => {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();
        
        if (!response.ok) {
          return { error: result };
        }

        return { data: result };
      }
    };
  }
}
