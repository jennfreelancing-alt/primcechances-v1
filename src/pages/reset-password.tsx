import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();

  // Check if user has a valid reset session
  useEffect(() => {
    const handlePasswordReset = async () => {
      try {
        console.log('🔍 Checking password reset session...');
        console.log('📍 Current URL:', window.location.href);
        console.log('📍 URL Hash:', window.location.hash);
        console.log('📍 URL Search:', window.location.search);
        
        // Check for Supabase redirect format in hash
        const hash = window.location.hash;
        const urlParams = new URLSearchParams(hash.substring(1)); // Remove the #
        
        const accessToken = urlParams.get('access_token') || searchParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token') || searchParams.get('refresh_token');
        const type = urlParams.get('type') || searchParams.get('type');
        const error = urlParams.get('error') || searchParams.get('error');
        const errorDescription = urlParams.get('error_description') || searchParams.get('error_description');
        
        console.log('🔑 Reset params:', { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken,
          type,
          error,
          errorDescription
        });

        // Check for errors first
        if (error) {
          console.error('❌ Reset link error:', error, errorDescription);
          if (error === 'access_denied' && errorDescription?.includes('expired')) {
            setError('The reset link has expired. Please request a new password reset.');
          } else {
            setError('Invalid reset link. Please request a new password reset.');
          }
          setCheckingSession(false);
          return;
        }

        // Handle Supabase's built-in reset flow
        if (type === 'recovery' && accessToken && refreshToken) {
          console.log('✅ Setting password reset session');
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (sessionError) {
            console.error('❌ Session setting failed:', sessionError);
            setError('Invalid or expired reset link. Please request a new password reset.');
          } else {
            console.log('✅ Password reset session set successfully');
            setValidSession(true);
            toast.success('Reset link verified. You can now set a new password.');
          }
        } else {
          console.log('❌ Invalid reset link parameters');
          setError('Invalid reset link. Please request a new password reset.');
        }
      } catch (err) {
        console.error('❌ Session check failed:', err);
        setError('Failed to verify reset link. Please try again.');
      } finally {
        setCheckingSession(false);
      }
    };

    handlePasswordReset();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    
    try {
      // Use Supabase's updateUser method
      console.log('🔄 Updating password with Supabase...');
      
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        console.error('❌ Password update failed:', error);
        setError(error.message || 'Failed to update password');
        toast.error(error.message || 'Failed to update password');
      } else {
        console.log('✅ Password updated successfully');
        setSuccess('Password updated successfully! Redirecting to login...');
        toast.success('Password updated successfully!');
        
        // Sign out and redirect to login after 2 seconds
        setTimeout(async () => {
          await supabase.auth.signOut();
          navigate('/auth?tab=signin');
        }, 2000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update password';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking session
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008000] mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Show error state if no valid session
  if (!validSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4 text-red-600">Invalid Reset Link</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button 
            onClick={() => navigate('/auth?tab=signin')} 
            className="bg-[#008000] text-white w-full"
          >
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md flex flex-col gap-4">
        <h2 className="text-2xl font-bold mb-2 text-[#008000]">Set New Password</h2>
        <p className="text-gray-600 text-sm mb-4">Enter your new password below</p>
        
        <input
          type="password"
          placeholder="New password (min. 6 characters)"
          className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008000] focus:border-transparent"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={loading}
          minLength={6}
          required
        />
        
        <input
          type="password"
          placeholder="Confirm new password"
          className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008000] focus:border-transparent"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          disabled={loading}
          minLength={6}
          required
        />
        
        {error && (
          <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
            {error}
          </div>
        )}
        
        {success && (
          <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg border border-green-200">
            {success}
          </div>
        )}
        
        <Button 
          type="submit" 
          className="bg-[#008000] hover:bg-[#006600] text-white w-full" 
          disabled={loading || !password || !confirmPassword}
        >
          {loading ? 'Updating Password...' : 'Update Password'}
        </Button>
        
        <p className="text-center text-sm text-gray-500">
          Remember your password?{' '}
          <button 
            type="button"
            onClick={() => navigate('/auth?tab=signin')}
            className="text-[#008000] hover:underline"
          >
            Sign in instead
          </button>
        </p>
      </form>
    </div>
  );
};

export default ResetPassword;
