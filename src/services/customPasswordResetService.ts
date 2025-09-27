import { supabase } from '@/integrations/supabase/client';

// Call the custom password reset Edge Function
export const requestPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🔄 Processing password reset request for:', email);

    const { data, error } = await supabase.functions.invoke('custom-password-reset', {
      body: {
        action: 'request_reset',
        email: email
      }
    });

    if (error) {
      console.error('❌ Password reset request error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Password reset email sent successfully via Edge Function');
    return { success: true };
  } catch (error) {
    console.error('❌ Password reset request error:', error);
    return { success: false, error: 'Failed to process reset request' };
  }
};

// Verify password reset token using Edge Function
export const verifyPasswordResetToken = async (token: string): Promise<{ success: boolean; userId?: string; email?: string; error?: string }> => {
  try {
    // For now, we'll do a simple client-side check
    // The actual verification happens in the Edge Function during password update
    if (!token || token.length < 10) {
      return { success: false, error: 'Invalid reset token' };
    }

    // Return success - the real verification happens when updating password
    return { success: true };
  } catch (error) {
    console.error('Password reset token verification error:', error);
    return { success: false, error: 'Failed to verify reset token' };
  }
};

// Confirm password reset using Edge Function
export const confirmPasswordReset = async (token: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🔄 Processing password reset confirmation');

    const { data, error } = await supabase.functions.invoke('custom-password-reset', {
      body: {
        action: 'confirm_reset',
        token: token,
        newPassword: newPassword
      }
    });

    if (error) {
      console.error('❌ Password reset confirmation error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Password reset completed successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Password reset confirmation error:', error);
    return { success: false, error: 'Failed to reset password' };
  }
};

export default {
  requestPasswordReset,
  confirmPasswordReset,
  verifyPasswordResetToken
};
