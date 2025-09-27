import { Resend } from 'resend';
import { supabase } from '@/integrations/supabase/client';
import { getTestEmail, getTestEmails, addTestEmailInfo, isTestModeEnabled } from '@/utils/emailTestConfig';
import { 
  mockSendEmail, 
  mockSendWelcomeEmail, 
  mockSendPasswordResetEmail, 
  mockSendOpportunityNotificationEmail, 
  mockSendApplicationConfirmationEmail, 
  mockSendAdminNotificationEmail 
} from './mockEmailService';
import { 
  sendRealWelcomeEmail, 
  sendRealPasswordResetEmail, 
  sendRealApplicationConfirmationEmail 
} from './realEmailService';
import { 
  sendAutomaticWelcomeEmail, 
  sendAutomaticPasswordResetEmail, 
  sendAutomaticApplicationConfirmationEmail 
} from './automaticEmailService';
import { 
  sendSimpleAutomaticWelcomeEmail, 
  sendSimpleAutomaticPasswordResetEmail, 
  sendSimpleAutomaticApplicationConfirmationEmail 
} from './simpleAutomaticEmailService';

// Initialize Resend with API key from environment
const resend = new Resend(import.meta.env.VITE_RESEND_API);

// Email template types
export interface EmailTemplate {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  tags?: Array<{ name: string; value: string }>;
}

// Email types for different use cases
export interface WelcomeEmailData {
  userName: string;
  userEmail: string;
  loginUrl: string;
}

export interface PasswordResetEmailData {
  userName: string;
  userEmail: string;
  resetUrl: string;
  expiresIn: string;
}

export interface OpportunityNotificationEmailData {
  userName: string;
  userEmail: string;
  opportunityTitle: string;
  opportunityUrl: string;
  companyName: string;
  deadline?: string;
}

export interface ApplicationConfirmationEmailData {
  userName: string;
  userEmail: string;
  opportunityTitle: string;
  companyName: string;
  applicationDate: string;
}

export interface AdminNotificationEmailData {
  adminEmail: string;
  notificationType: 'new_user' | 'new_application' | 'system_alert';
  data: any;
}

// Default sender configuration
const DEFAULT_FROM = 'PrimeChances <noreply@mail.primechances.com>';
const DEFAULT_REPLY_TO = 'support@mail.primechances.com';

// Email template generators
export const generateWelcomeEmail = (data: WelcomeEmailData): EmailTemplate => ({
  to: data.userEmail,
  subject: 'Welcome to PrimeChances! 🎉',
  from: DEFAULT_FROM,
  replyTo: DEFAULT_REPLY_TO,
  html: `
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
  `,
  tags: [
    { name: 'type', value: 'welcome' },
    { name: 'user', value: data.userEmail }
  ]
});

export const generatePasswordResetEmail = (data: PasswordResetEmailData): EmailTemplate => ({
  to: data.userEmail,
  subject: 'Reset Your PrimeChances Password',
  from: DEFAULT_FROM,
  replyTo: DEFAULT_REPLY_TO,
  html: `
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
  `,
  tags: [
    { name: 'type', value: 'password_reset' },
    { name: 'user', value: data.userEmail }
  ]
});

export const generateOpportunityNotificationEmail = (data: OpportunityNotificationEmailData): EmailTemplate => ({
  to: data.userEmail,
  subject: `🎯 New Opportunity: ${data.opportunityTitle}`,
  from: DEFAULT_FROM,
  replyTo: DEFAULT_REPLY_TO,
  html: `
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
  `,
  tags: [
    { name: 'type', value: 'opportunity_notification' },
    { name: 'user', value: data.userEmail },
    { name: 'company', value: data.companyName }
  ]
});

export const generateApplicationConfirmationEmail = (data: ApplicationConfirmationEmailData): EmailTemplate => ({
  to: data.userEmail,
  subject: `✅ Application Submitted: ${data.opportunityTitle}`,
  from: DEFAULT_FROM,
  replyTo: DEFAULT_REPLY_TO,
  html: `
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
  `,
  tags: [
    { name: 'type', value: 'application_confirmation' },
    { name: 'user', value: data.userEmail },
    { name: 'company', value: data.companyName }
  ]
});

export const generateAdminNotificationEmail = (data: AdminNotificationEmailData): EmailTemplate => {
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
  
  return {
    to: data.adminEmail,
    subject,
    from: DEFAULT_FROM,
    replyTo: DEFAULT_REPLY_TO,
    html: `
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
    `,
    tags: [
      { name: 'type', value: 'admin_notification' },
      { name: 'notification_type', value: data.notificationType }
    ]
  };
};

// Main email sending functions
export const sendEmail = async (template: EmailTemplate): Promise<{ success: boolean; error?: string; messageId?: string }> => {
  try {
    const payload = {
      to: Array.isArray(template.to) ? template.to : [template.to],
      subject: template.subject,
      html: template.html,
      from: template.from || DEFAULT_FROM,
      replyTo: template.replyTo || DEFAULT_REPLY_TO,
      tags: template.tags,
    };

    // If multiple recipients, send one by one for now
    const recipients = payload.to as string[];
    let lastMessageId: string | undefined;
    for (const to of recipients) {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { ...payload, to },
      });
      if (error) throw error;
      lastMessageId = (data as any)?.messageId || `edge_${Date.now()}`;
    }

    return { success: true, messageId: lastMessageId };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// Convenience functions for specific email types
export const sendWelcomeEmail = async (data: WelcomeEmailData): Promise<{ success: boolean; error?: string; messageId?: string }> => {
  return await sendSimpleAutomaticWelcomeEmail(data);
};

export const sendPasswordResetEmail = async (data: PasswordResetEmailData): Promise<{ success: boolean; error?: string; messageId?: string }> => {
  return await sendSimpleAutomaticPasswordResetEmail(data);
};

export const sendOpportunityNotificationEmail = async (data: OpportunityNotificationEmailData): Promise<{ success: boolean; error?: string; messageId?: string }> => {
  return await mockSendOpportunityNotificationEmail(data);
};

export const sendApplicationConfirmationEmail = async (data: ApplicationConfirmationEmailData): Promise<{ success: boolean; error?: string; messageId?: string }> => {
  return await sendSimpleAutomaticApplicationConfirmationEmail(data);
};

export const sendAdminNotificationEmail = async (data: AdminNotificationEmailData): Promise<{ success: boolean; error?: string; messageId?: string }> => {
  return await mockSendAdminNotificationEmail(data);
};

// Bulk email sending
export const sendBulkEmails = async (templates: EmailTemplate[]): Promise<{ success: boolean; results: Array<{ success: boolean; error?: string; messageId?: string }> }> => {
  const results = await Promise.allSettled(
    templates.map(template => sendEmail(template))
  );

  const processedResults = results.map(result => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return { success: false, error: result.reason?.message || 'Unknown error' };
    }
  });

  const successCount = processedResults.filter(r => r.success).length;
  const failureCount = processedResults.length - successCount;

  return {
    success: failureCount === 0,
    results: processedResults
  };
};

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Email rate limiting (simple in-memory implementation)
const emailRateLimit = new Map<string, { count: number; resetTime: number }>();

export const checkEmailRateLimit = (email: string, maxEmails: number = 5, windowMs: number = 60 * 60 * 1000): boolean => {
  const now = Date.now();
  const userLimit = emailRateLimit.get(email);

  if (!userLimit || now > userLimit.resetTime) {
    emailRateLimit.set(email, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userLimit.count >= maxEmails) {
    return false;
  }

  userLimit.count++;
  return true;
};

export default resend;
