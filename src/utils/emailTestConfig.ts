/**
 * Email testing configuration
 * Redirects all emails to a test email address for development/testing
 */

// Test email configuration
export const TEST_EMAIL_CONFIG = {
  enabled: true, // Set to false to disable test mode
  testEmail: 'jenn.freelancing@gmail.com',
  originalEmailField: 'original_email' // Field to store original email in test mode
};

/**
 * Get the email address to send to (test email in test mode, original in production)
 */
export const getTestEmail = (originalEmail: string): string => {
  if (TEST_EMAIL_CONFIG.enabled) {
    console.log(`[EMAIL TEST MODE] Redirecting email from ${originalEmail} to ${TEST_EMAIL_CONFIG.testEmail}`);
    return TEST_EMAIL_CONFIG.testEmail;
  }
  return originalEmail;
};

/**
 * Get email addresses for bulk sending (test email in test mode, original list in production)
 */
export const getTestEmails = (originalEmails: string[]): string[] => {
  if (TEST_EMAIL_CONFIG.enabled) {
    console.log(`[EMAIL TEST MODE] Redirecting ${originalEmails.length} emails to ${TEST_EMAIL_CONFIG.testEmail}`);
    return [TEST_EMAIL_CONFIG.testEmail];
  }
  return originalEmails;
};

/**
 * Add original email information to email data for testing
 */
export const addTestEmailInfo = (emailData: any, originalEmail: string): any => {
  if (TEST_EMAIL_CONFIG.enabled) {
    return {
      ...emailData,
      [TEST_EMAIL_CONFIG.originalEmailField]: originalEmail,
      test_mode: true
    };
  }
  return emailData;
};

/**
 * Check if test mode is enabled
 */
export const isTestModeEnabled = (): boolean => {
  return TEST_EMAIL_CONFIG.enabled;
};

/**
 * Get test email address
 */
export const getTestEmailAddress = (): string => {
  return TEST_EMAIL_CONFIG.testEmail;
};

export default {
  getTestEmail,
  getTestEmails,
  addTestEmailInfo,
  isTestModeEnabled,
  getTestEmailAddress
};
