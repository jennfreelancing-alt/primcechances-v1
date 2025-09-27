import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOpportunityNotificationEmail,
  sendApplicationConfirmationEmail,
  sendAdminNotificationEmail,
  sendBulkEmails,
  WelcomeEmailData,
  PasswordResetEmailData,
  OpportunityNotificationEmailData,
  ApplicationConfirmationEmailData,
  AdminNotificationEmailData,
  EmailTemplate,
  isValidEmail,
  checkEmailRateLimit
} from '../services/resendService';

interface EmailState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

export const useEmail = () => {
  const [state, setState] = useState<EmailState>({
    loading: false,
    error: null,
    success: false
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setSuccess = useCallback((success: boolean) => {
    setState(prev => ({ ...prev, success }));
  }, []);

  const resetState = useCallback(() => {
    setState({
      loading: false,
      error: null,
      success: false
    });
  }, []);

  // Welcome email
  const sendWelcome = useCallback(async (data: WelcomeEmailData) => {
    if (!isValidEmail(data.userEmail)) {
      setError('Invalid email address');
      return { success: false, error: 'Invalid email address' };
    }

    if (!checkEmailRateLimit(data.userEmail)) {
      setError('Email rate limit exceeded. Please try again later.');
      return { success: false, error: 'Email rate limit exceeded' };
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await sendWelcomeEmail(data);
      
      if (result.success) {
        setSuccess(true);
        toast.success('Welcome email sent successfully!');
      } else {
        setError(result.error || 'Failed to send welcome email');
        toast.error(result.error || 'Failed to send welcome email');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setSuccess]);

  // Password reset email
  const sendPasswordReset = useCallback(async (data: PasswordResetEmailData) => {
    if (!isValidEmail(data.userEmail)) {
      setError('Invalid email address');
      return { success: false, error: 'Invalid email address' };
    }

    if (!checkEmailRateLimit(data.userEmail)) {
      setError('Email rate limit exceeded. Please try again later.');
      return { success: false, error: 'Email rate limit exceeded' };
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await sendPasswordResetEmail(data);
      
      if (result.success) {
        setSuccess(true);
        toast.success('Password reset email sent! Check your inbox.');
      } else {
        setError(result.error || 'Failed to send password reset email');
        toast.error(result.error || 'Failed to send password reset email');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setSuccess]);

  // Opportunity notification email
  const sendOpportunityNotification = useCallback(async (data: OpportunityNotificationEmailData) => {
    if (!isValidEmail(data.userEmail)) {
      setError('Invalid email address');
      return { success: false, error: 'Invalid email address' };
    }

    if (!checkEmailRateLimit(data.userEmail)) {
      setError('Email rate limit exceeded. Please try again later.');
      return { success: false, error: 'Email rate limit exceeded' };
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await sendOpportunityNotificationEmail(data);
      
      if (result.success) {
        setSuccess(true);
        toast.success('Opportunity notification sent!');
      } else {
        setError(result.error || 'Failed to send opportunity notification');
        toast.error(result.error || 'Failed to send opportunity notification');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setSuccess]);

  // Application confirmation email
  const sendApplicationConfirmation = useCallback(async (data: ApplicationConfirmationEmailData) => {
    if (!isValidEmail(data.userEmail)) {
      setError('Invalid email address');
      return { success: false, error: 'Invalid email address' };
    }

    if (!checkEmailRateLimit(data.userEmail)) {
      setError('Email rate limit exceeded. Please try again later.');
      return { success: false, error: 'Email rate limit exceeded' };
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await sendApplicationConfirmationEmail(data);
      
      if (result.success) {
        setSuccess(true);
        toast.success('Application confirmation sent!');
      } else {
        setError(result.error || 'Failed to send application confirmation');
        toast.error(result.error || 'Failed to send application confirmation');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setSuccess]);

  // Admin notification email
  const sendAdminNotification = useCallback(async (data: AdminNotificationEmailData) => {
    if (!isValidEmail(data.adminEmail)) {
      setError('Invalid admin email address');
      return { success: false, error: 'Invalid admin email address' };
    }

    if (!checkEmailRateLimit(data.adminEmail)) {
      setError('Email rate limit exceeded. Please try again later.');
      return { success: false, error: 'Email rate limit exceeded' };
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await sendAdminNotificationEmail(data);
      
      if (result.success) {
        setSuccess(true);
        toast.success('Admin notification sent!');
      } else {
        setError(result.error || 'Failed to send admin notification');
        toast.error(result.error || 'Failed to send admin notification');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setSuccess]);

  // Bulk email sending
  const sendBulk = useCallback(async (templates: EmailTemplate[]) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await sendBulkEmails(templates);
      
      if (result.success) {
        setSuccess(true);
        toast.success(`Bulk emails sent successfully! (${result.results.length} emails)`);
      } else {
        const failureCount = result.results.filter(r => !r.success).length;
        setError(`${failureCount} emails failed to send`);
        toast.error(`${failureCount} emails failed to send`);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, results: [] };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setSuccess]);

  // Generic email sending
  const sendCustomEmail = useCallback(async (template: EmailTemplate) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const emails = Array.isArray(template.to) ? template.to : [template.to];
      
      // Validate all email addresses
      for (const email of emails) {
        if (!isValidEmail(email)) {
          setError(`Invalid email address: ${email}`);
          return { success: false, error: `Invalid email address: ${email}` };
        }

        if (!checkEmailRateLimit(email)) {
          setError(`Email rate limit exceeded for: ${email}`);
          return { success: false, error: `Email rate limit exceeded for: ${email}` };
        }
      }

      const result = await sendBulkEmails([template]);
      
      if (result.success) {
        setSuccess(true);
        toast.success('Email sent successfully!');
      } else {
        setError(result.results[0]?.error || 'Failed to send email');
        toast.error(result.results[0]?.error || 'Failed to send email');
      }
      
      return result.results[0] || { success: false, error: 'Unknown error' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setSuccess]);

  return {
    // State
    loading: state.loading,
    error: state.error,
    success: state.success,
    
    // Actions
    sendWelcome,
    sendPasswordReset,
    sendOpportunityNotification,
    sendApplicationConfirmation,
    sendAdminNotification,
    sendBulk,
    sendCustomEmail,
    
    // Utilities
    resetState,
    isValidEmail,
    checkEmailRateLimit
  };
};

export default useEmail;
