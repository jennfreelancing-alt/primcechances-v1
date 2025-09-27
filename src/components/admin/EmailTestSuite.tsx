import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Send, CheckCircle, AlertCircle, TestTube } from 'lucide-react';
import { useEmail } from '@/hooks/useEmail';
import { isEmailConfigured } from '@/utils/envValidation';
import { isTestModeEnabled, getTestEmailAddress } from '@/utils/emailTestConfig';
import { sendRealTestEmail, createTestEmailTemplate } from '@/services/realEmailTest';

const EmailTestSuite = () => {
  const { 
    sendWelcome, 
    sendPasswordReset, 
    sendOpportunityNotification, 
    sendApplicationConfirmation,
    sendAdminNotification,
    loading, 
    error, 
    success 
  } = useEmail();
  
  const [testData, setTestData] = useState({
    name: 'Jennifer Test',
    email: 'jenn.freelancing@gmail.com',
    company: 'Test Company',
    opportunity: 'Senior Developer Position'
  });
  const [realEmailLoading, setRealEmailLoading] = useState(false);
  const [realEmailResult, setRealEmailResult] = useState<{ success: boolean; error?: string; messageId?: string } | null>(null);

  const emailConfigured = isEmailConfigured();
  const testModeEnabled = isTestModeEnabled();
  const testEmailAddress = getTestEmailAddress();

  const testEmails = [
    {
      name: 'Welcome Email',
      description: 'Sent to new users upon registration',
      action: () => sendWelcome({
        userName: testData.name,
        userEmail: testData.email,
        loginUrl: `${window.location.origin}/dashboard`
      })
    },
    {
      name: 'Password Reset Email',
      description: 'Sent when users request password reset',
      action: () => sendPasswordReset({
        userName: testData.name,
        userEmail: testData.email,
        resetUrl: `${window.location.origin}/auth?tab=reset-password`,
        expiresIn: '1 hour'
      })
    },
    {
      name: 'Opportunity Notification',
      description: 'Sent when new job opportunities match user profile',
      action: () => sendOpportunityNotification({
        userName: testData.name,
        userEmail: testData.email,
        opportunityTitle: testData.opportunity,
        opportunityUrl: `${window.location.origin}/opportunity/test-123`,
        companyName: testData.company,
        deadline: '2024-02-15'
      })
    },
    {
      name: 'Application Confirmation',
      description: 'Sent when user submits job application',
      action: () => sendApplicationConfirmation({
        userName: testData.name,
        userEmail: testData.email,
        opportunityTitle: testData.opportunity,
        companyName: testData.company,
        applicationDate: new Date().toLocaleDateString()
      })
    },
    {
      name: 'Admin Notification',
      description: 'Sent to admins for system alerts',
      action: () => sendAdminNotification({
        adminEmail: testData.email,
        notificationType: 'new_user',
        data: {
          email: 'newuser@example.com',
          full_name: 'New User',
          created_at: new Date().toISOString()
        }
      })
    }
  ];

  const runAllTests = async () => {
    for (const emailTest of testEmails) {
      console.log(`Testing: ${emailTest.name}`);
      await emailTest.action();
      // Wait a bit between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const sendRealEmail = async () => {
    setRealEmailLoading(true);
    setRealEmailResult(null);
    
    try {
      const html = createTestEmailTemplate({
        name: testData.name,
        email: testData.email,
        type: 'Real Email Test'
      });
      
      const result = await sendRealTestEmail(
        testData.email,
        '[REAL EMAIL TEST] PrimeChances Email System Test',
        html
      );
      
      setRealEmailResult(result);
    } catch (error) {
      setRealEmailResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setRealEmailLoading(false);
    }
  };

  if (!emailConfigured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Email Test Suite
          </CardTitle>
          <CardDescription>Test all email types</CardDescription>
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
          <TestTube className="w-5 h-5" />
          Email Test Suite
        </CardTitle>
        <CardDescription>Test all email types (using mock service for development)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">Email system configured (Mock Mode)</span>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>🧪 MOCK MODE:</strong> Emails are simulated for testing. Check the browser console to see email details. Real emails will be sent from <strong>noreply@mail.primechances.com</strong>.
            <br/><br/>
            <strong>📧 Real Email Testing:</strong> Due to CORS restrictions, real emails must be sent through a backend service. The "Send Real Email" button uses the Supabase Edge Function.
          </AlertDescription>
        </Alert>

        {testModeEnabled && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>🧪 TEST MODE ENABLED:</strong> All emails will be sent to <strong>{testEmailAddress}</strong> instead of the intended recipients.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="test-name">Test Name</Label>
            <Input
              id="test-name"
              value={testData.name}
              onChange={(e) => setTestData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="test-email">Test Email</Label>
            <Input
              id="test-email"
              type="email"
              value={testData.email}
              onChange={(e) => setTestData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="test-company">Test Company</Label>
            <Input
              id="test-company"
              value={testData.company}
              onChange={(e) => setTestData(prev => ({ ...prev, company: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="test-opportunity">Test Opportunity</Label>
            <Input
              id="test-opportunity"
              value={testData.opportunity}
              onChange={(e) => setTestData(prev => ({ ...prev, opportunity: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={runAllTests}
              disabled={loading}
              className="flex-1"
            >
              <Send className="w-4 h-4 mr-2" />
              Run All Mock Tests
            </Button>
            <Button
              onClick={sendRealEmail}
              disabled={realEmailLoading}
              variant="outline"
              className="flex-1"
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Real Email (Edge Function)
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {testEmails.map((emailTest, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{emailTest.name}</h4>
                  <p className="text-sm text-gray-600">{emailTest.description}</p>
                </div>
                <Button
                  onClick={emailTest.action}
                  disabled={loading}
                  size="sm"
                  variant="outline"
                >
                  <Mail className="w-4 h-4 mr-1" />
                  Test
                </Button>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>Mock email sent successfully!</AlertDescription>
          </Alert>
        )}

        {realEmailResult && (
          <Alert>
            {realEmailResult.success ? (
              <>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>✅ Email Data Prepared!</strong><br/>
                  Message ID: {realEmailResult.messageId}<br/>
                  <br/>
                  <strong>📧 To send real email:</strong><br/>
                  <code className="bg-gray-100 p-1 rounded text-sm">node test-real-email.js</code>
                  <br/>
                  This will send a real email to {testData.email}
                </AlertDescription>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>❌ Real Email Failed:</strong> {realEmailResult.error}
                  <br/><br/>
                  <strong>Alternative:</strong> Run the Node.js test script:
                  <br/>
                  <code className="bg-gray-100 p-1 rounded text-sm">node test-real-email.js</code>
                </AlertDescription>
              </>
            )}
          </Alert>
        )}

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>💡 Alternative Real Email Test:</strong>
            <br/>
            Run this command in your terminal to send a real email:
            <br/>
            <code className="bg-gray-100 p-1 rounded text-sm">node test-real-email.js</code>
            <br/>
            This bypasses CORS restrictions and sends a real email to {testData.email}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default EmailTestSuite;
