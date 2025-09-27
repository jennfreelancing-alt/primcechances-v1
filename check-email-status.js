/**
 * Check Email Status Script
 * Check the status of a sent email via Resend API
 */

const RESEND_API_KEY = 're_DaV9voff_5AGkD2qffBinyBiEMhoGdCRK';
const MESSAGE_ID = '261959e7-d707-4ec6-8dde-2c81c60aa0ab';

async function checkEmailStatus() {
  try {
    console.log('🔍 Checking email status...');
    console.log('📧 Message ID:', MESSAGE_ID);
    
    const response = await fetch('https://api.resend.com/emails/' + MESSAGE_ID, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + RESEND_API_KEY,
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to check email status');
    }

    console.log('📊 Email Details:');
    console.log('📧 Status:', result.last_event);
    console.log('📧 Created:', result.created_at);
    console.log('📧 To:', result.to);
    console.log('📧 From:', result.from);
    console.log('📧 Subject:', result.subject);
    
    if (result.last_event === 'delivered') {
      console.log('✅ Email was delivered successfully!');
      console.log('📧 Check your inbox and spam folder');
    } else if (result.last_event === 'bounced') {
      console.log('❌ Email bounced - check the email address');
    } else if (result.last_event === 'complained') {
      console.log('⚠️ Email was marked as spam');
    } else {
      console.log('⏳ Email is still being processed...');
    }
    
  } catch (error) {
    console.error('❌ Error checking email status:', error.message);
  }
}

// Run the check
checkEmailStatus();
