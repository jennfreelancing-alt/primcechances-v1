import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useEmail } from '@/hooks/useEmail';
import { isEmailConfigured } from '@/utils/envValidation';
import { isTestModeEnabled, getTestEmailAddress } from '@/utils/emailTestConfig';

const EmailTest = () => {
  const { sendWelcome, sendPasswordReset, loading, error, success } = useEmail();
  const [testData, setTestData] = useState({
    email: '',
    name: '',
    type: 'welcome' as 'welcome' | 'password_reset'
  });

  const emailConfigured = isEmailConfigured();
  const testModeEnabled = isTestModeEnabled();
  const testEmailAddress = getTestEmailAddress();

  const handleTestEmail = async () => {
    if (!testData.email || !testData.name) {
      return;
    }

    if (testData.type === 'welcome') {
      await sendWelcome({
        userName: testData.name,
        userEmail: testData.email,
        loginUrl: `${window.location.origin}/dashboard`
      });
    } else {
      await sendPasswordReset({
        userName: testData.name,
        userEmail: testData.email,
        resetUrl: `${window.location.origin}/auth?tab=reset-password`,
        expiresIn: '1 hour'
      });
    }
  };

  if (!emailConfigured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Test
          </CardTitle>
          <CardDescription>Test email functionality</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Email functionality is not configured. Please set up the VITE_RESEND_API environment variable.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email Test
        </CardTitle>
        <CardDescription>Test email functionality with Resend</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">Email system configured</span>
        </div>

        {testModeEnabled && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>🧪 TEST MODE ENABLED:</strong> All emails will be sent to <strong>{testEmailAddress}</strong> instead of the intended recipients.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="test-email">Email Address</Label>
            <Input
              id="test-email"
              type="email"
              placeholder="test@example.com"
              value={testData.email}
              onChange={(e) => setTestData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="test-name">Name</Label>
            <Input
              id="test-name"
              placeholder="John Doe"
              value={testData.name}
              onChange={(e) => setTestData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="email-type">Email Type</Label>
            <select
              id="email-type"
              value={testData.type}
              onChange={(e) => setTestData(prev => ({ ...prev, type: e.target.value as 'welcome' | 'password_reset' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="welcome">Welcome Email</option>
              <option value="password_reset">Password Reset Email</option>
            </select>
          </div>

          <Button
            onClick={handleTestEmail}
            disabled={loading || !testData.email || !testData.name}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Test Email
          </Button>

          {error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Email sent successfully!</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailTest;
