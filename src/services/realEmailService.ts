/**
 * Real Email Service
 * Sends real emails via Supabase Edge Function (no manual scripts)
 */
import { supabase } from '@/integrations/supabase/client';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

// Function to actually send email via Edge Function
export const sendRealEmail = async (
  emailData: EmailData
): Promise<{ success: boolean; error?: string; messageId?: string }> => {
  try {
    console.log('🚀 Sending real email via edge function...');
    console.log('📧 To:', emailData.to);
    console.log('📧 Subject:', emailData.subject);

    const payload = {
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      from: emailData.from || 'PrimeChances <noreply@mail.primechances.com>',
      replyTo: emailData.replyTo || 'support@mail.primechances.com',
    };

    const { data, error } = await supabase.functions.invoke('send-email', {
      body: payload,
    });

    if (error) throw error;

    console.log('✅ Email sent (edge)!', data);
    return {
      success: true,
      messageId: (data as any)?.messageId || `edge_${Date.now()}`,
    };
  } catch (error) {
    console.error('❌ Real email error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Welcome email function
export const sendRealWelcomeEmail = async (data: {
  userName: string;
  userEmail: string;
  loginUrl: string;
}) => {
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
</html>
  `;

  return sendRealEmail({
    to: data.userEmail,
    subject: 'Welcome to PrimeChances! 🎉',
    html: html
  });
};

// Password reset email function
export const sendRealPasswordResetEmail = async (data: {
  userName: string;
  userEmail: string;
  resetUrl: string;
  expiresIn: string;
}) => {
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
</html>
  `;

  return sendRealEmail({
    to: data.userEmail,
    subject: 'Reset Your PrimeChances Password',
    html: html
  });
};

// Application confirmation email function
export const sendRealApplicationConfirmationEmail = async (data: {
  userName: string;
  userEmail: string;
  opportunityTitle: string;
  companyName: string;
  applicationDate: string;
}) => {
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
</html>
  `;

  return sendRealEmail({
    to: data.userEmail,
    subject: `✅ Application Submitted: ${data.opportunityTitle}`,
    html: html
  });
};
