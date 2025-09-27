/**
 * Real Email Test Script
 * Run this script to test real email sending via Resend API
 * 
 * Usage: node test-real-email.js
 */

const RESEND_API_KEY = 're_DaV9voff_5AGkD2qffBinyBiEMhoGdCRK';
const TEST_EMAIL = 'jenn.freelancing@gmail.com';

async function sendTestEmail() {
  try {
    console.log('🚀 Sending real test email...');
    console.log(`📧 To: ${TEST_EMAIL}`);
    console.log(`📧 From: noreply@mail.primechances.com`);
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'PrimeChances <noreply@mail.primechances.com>',
        to: TEST_EMAIL,
        subject: '[REAL EMAIL TEST] PrimeChances Email System Test',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PrimeChances Email Test</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    .success { color: #28a745; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Email Test Successful!</h1>
      <p>PrimeChances Email System</p>
    </div>
    <div class="content">
      <h2>Hello Jennifer!</h2>
      <p class="success">✅ This is a REAL email from PrimeChances!</p>
      
      <p>Your email system is working perfectly:</p>
      <ul>
        <li>✅ Resend API integration successful</li>
        <li>✅ Verified domain: mail.primechances.com</li>
        <li>✅ Professional email templates</li>
        <li>✅ Email delivery working</li>
      </ul>
      
      <p><strong>Email Details:</strong></p>
      <ul>
        <li><strong>Recipient:</strong> ${TEST_EMAIL}</li>
        <li><strong>From:</strong> noreply@mail.primechances.com</li>
        <li><strong>Sent At:</strong> ${new Date().toLocaleString()}</li>
        <li><strong>Test Type:</strong> Real Email Test</li>
      </ul>
      
      <p>🎯 All email types are ready for production!</p>
      
      <p>Best regards,<br>The PrimeChances Team</p>
    </div>
    <div class="footer">
      <p>© 2024 PrimeChances. All rights reserved.</p>
      <p>This is a test email to verify email functionality.</p>
    </div>
  </div>
</html>
        `
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to send email');
    }

    console.log('✅ Email sent successfully!');
    console.log(`📧 Message ID: ${result.id}`);
    console.log(`📧 Check your inbox at: ${TEST_EMAIL}`);
    
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
  }
}

// Run the test
sendTestEmail();
