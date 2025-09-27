/**
 * Mock Email Service for Testing
 * Simulates email sending without actual API calls
 */

import { getTestEmail, getTestEmails, isTestModeEnabled } from '@/utils/emailTestConfig';

interface MockEmailResult {
  success: boolean;
  error?: string;
  messageId?: string;
}

// Mock email sending function
export const mockSendEmail = async (template: any): Promise<MockEmailResult> => {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      try {
        // Handle test mode
        let processedTemplate = { ...template };
        if (isTestModeEnabled()) {
          if (Array.isArray(template.to)) {
            processedTemplate.to = getTestEmails(template.to);
          } else {
            processedTemplate.to = getTestEmail(template.to);
          }
          
          // Add test mode indicator to subject
          processedTemplate.subject = `[TEST MODE] ${template.subject}`;
          
          // Add original recipient info to HTML
          const originalRecipients = Array.isArray(template.to) ? template.to.join(', ') : template.to;
          processedTemplate.html = `
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin-bottom: 20px; border-radius: 5px;">
              <strong>🧪 TEST MODE:</strong> This email was originally intended for: ${originalRecipients}
            </div>
            ${template.html}
          `;
        }

        // Simulate successful email sending
        const mockMessageId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        console.log('📧 Mock Email Sent:', {
          from: 'PrimeChances <noreply@mail.primechances.com>',
          to: processedTemplate.to,
          subject: processedTemplate.subject,
          messageId: mockMessageId,
          testMode: isTestModeEnabled()
        });

        resolve({
          success: true,
          messageId: mockMessageId
        });
      } catch (error) {
        resolve({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }, 1000); // 1 second delay to simulate API call
  });
};

// Mock email template generators (same as real ones but simplified)
export const generateMockWelcomeEmail = (data: any) => ({
  to: data.userEmail,
  subject: 'Welcome to PrimeChances! 🎉',
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
  `
});

export const generateMockPasswordResetEmail = (data: any) => ({
  to: data.userEmail,
  subject: 'Reset Your PrimeChances Password',
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
  `
});

export const generateMockOpportunityNotificationEmail = (data: any) => ({
  to: data.userEmail,
  subject: `🎯 New Opportunity: ${data.opportunityTitle}`,
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
  `
});

export const generateMockApplicationConfirmationEmail = (data: any) => ({
  to: data.userEmail,
  subject: `✅ Application Submitted: ${data.opportunityTitle}`,
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
  `
});

export const generateMockAdminNotificationEmail = (data: any) => ({
  to: data.adminEmail,
  subject: '🔔 Admin Notification',
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
          <h2>System Alert</h2>
          <p>This is a test admin notification email.</p>
          <p><strong>Notification Type:</strong> ${data.notificationType}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
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
});

// Mock convenience functions
export const mockSendWelcomeEmail = async (data: any) => {
  const template = generateMockWelcomeEmail(data);
  return mockSendEmail(template);
};

export const mockSendPasswordResetEmail = async (data: any) => {
  const template = generateMockPasswordResetEmail(data);
  return mockSendEmail(template);
};

export const mockSendOpportunityNotificationEmail = async (data: any) => {
  const template = generateMockOpportunityNotificationEmail(data);
  return mockSendEmail(template);
};

export const mockSendApplicationConfirmationEmail = async (data: any) => {
  const template = generateMockApplicationConfirmationEmail(data);
  return mockSendEmail(template);
};

export const mockSendAdminNotificationEmail = async (data: any) => {
  const template = generateMockAdminNotificationEmail(data);
  return mockSendEmail(template);
};
