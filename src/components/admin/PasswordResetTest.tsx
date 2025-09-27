import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, Mail, Key, User } from 'lucide-react';
import { useEmail } from '@/hooks/useEmail';

export default function PasswordResetTest() {
  const [testEmail, setTestEmail] = useState('jenn.freelancing@gmail.com');
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { sendPasswordReset } = useEmail();

  const runPasswordResetTest = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      console.log('🧪 Testing password reset email...');
      console.log('📧 Test email:', testEmail);

      const result = await sendPasswordReset({
        userName: 'Test User',
        userEmail: testEmail,
        resetUrl: `${window.location.origin}/auth?tab=reset-password&token=test123`,
        expiresIn: '1 hour'
      });

      console.log('📧 Password reset test result:', result);
      setTestResult(result);

    } catch (error) {
      console.error('❌ Password reset test error:', error);
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getStatusBadge = (success: boolean) => {
    return success ? (
      <Badge variant="outline" className="text-green-600 border-green-200">Success</Badge>
    ) : (
      <Badge variant="outline" className="text-red-600 border-red-200">Failed</Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Password Reset Email Test
          </CardTitle>
          <CardDescription>
            Test the password reset email functionality and verify PrimeChances sender
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Test Email Address</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email address for testing"
              />
            </div>
            <Button 
              onClick={runPasswordResetTest} 
              disabled={isLoading}
              className="mt-6"
            >
              {isLoading ? 'Testing...' : 'Test Password Reset'}
            </Button>
          </div>

          {testResult && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 border rounded-lg">
                {getStatusIcon(testResult.success)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Password Reset Email Test</h3>
                    {getStatusBadge(testResult.success)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {testResult.success 
                      ? 'Password reset email sent successfully!' 
                      : `Failed: ${testResult.error}`
                    }
                  </p>
                  {testResult.messageId && (
                    <p className="text-xs text-gray-500 mt-1">
                      Message ID: {testResult.messageId}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              <strong>📧 Email Details:</strong>
              <ul className="mt-2 space-y-1">
                <li>• <strong>From:</strong> PrimeChances &lt;noreply@mail.primechances.com&gt;</li>
                <li>• <strong>Reply-To:</strong> support@mail.primechances.com</li>
                <li>• <strong>Subject:</strong> Reset Your PrimeChances Password</li>
                <li>• <strong>Template:</strong> Professional HTML with PrimeChances branding</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Alert>
            <User className="h-4 w-4" />
            <AlertDescription>
              <strong>🔐 Password Reset Flow:</strong>
              <ol className="mt-2 space-y-1 list-decimal list-inside">
                <li>User enters email address</li>
                <li>System sends password reset email via Supabase Edge Function</li>
                <li>Email is sent from PrimeChances domain (noreply@mail.primechances.com)</li>
                <li>User receives professional email with reset link</li>
                <li>User clicks link to reset password</li>
              </ol>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
