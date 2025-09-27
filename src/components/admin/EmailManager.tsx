import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Send, Users, Settings, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useEmail } from '@/hooks/useEmail';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { isEmailConfigured } from '@/utils/envValidation';
import { isTestModeEnabled, getTestEmailAddress } from '@/utils/emailTestConfig';
import EmailTestSuite from './EmailTestSuite';
import EmailSystemChecker from './EmailSystemChecker';
import PasswordResetTest from './PasswordResetTest';

interface EmailStats {
  totalSent: number;
  welcomeEmails: number;
  passwordResets: number;
  opportunityNotifications: number;
  applicationConfirmations: number;
  adminNotifications: number;
}

interface BulkEmailData {
  emails: string[];
  subject: string;
  content: string;
  type: 'announcement' | 'newsletter' | 'promotion';
}

const EmailManager = () => {
  const { sendCustomEmail, sendBulk, loading } = useEmail();
  const [emailStats, setEmailStats] = useState<EmailStats>({
    totalSent: 0,
    welcomeEmails: 0,
    passwordResets: 0,
    opportunityNotifications: 0,
    applicationConfirmations: 0,
    adminNotifications: 0
  });
  const [bulkEmailData, setBulkEmailData] = useState<BulkEmailData>({
    emails: [],
    subject: '',
    content: '',
    type: 'announcement'
  });
  const [testEmail, setTestEmail] = useState({
    to: '',
    subject: '',
    content: ''
  });
  const [userEmails, setUserEmails] = useState<string[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Check if email is configured
  const emailConfigured = isEmailConfigured();
  const testModeEnabled = isTestModeEnabled();
  const testEmailAddress = getTestEmailAddress();

  useEffect(() => {
    loadEmailStats();
    loadUserEmails();
  }, []);

  const loadEmailStats = async () => {
    try {
      // In a real implementation, you would query your email logs
      // For now, we'll simulate some stats
      setEmailStats({
        totalSent: 1247,
        welcomeEmails: 342,
        passwordResets: 89,
        opportunityNotifications: 567,
        applicationConfirmations: 198,
        adminNotifications: 51
      });
    } catch (error) {
      console.error('Error loading email stats:', error);
    }
  };

  const loadUserEmails = async () => {
    setIsLoadingUsers(true);
    try {
      // For now, use a mock list since we can't access auth.users directly
      // In production, you would use a proper admin function or RPC call
      setUserEmails(['jenn.freelancing@gmail.com', 'test@example.com', 'admin@primechances.com']);
    } catch (error) {
      console.error('Error loading user emails:', error);
      setUserEmails(['jenn.freelancing@gmail.com', 'test@example.com']);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleBulkEmailSubmit = async () => {
    if (!bulkEmailData.emails.length || !bulkEmailData.subject || !bulkEmailData.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    const templates = bulkEmailData.emails.map(email => ({
      to: email,
      subject: bulkEmailData.subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${bulkEmailData.subject}</title>
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
              <h1>PrimeChances Update</h1>
            </div>
            <div class="content">
              ${bulkEmailData.content.replace(/\n/g, '<br>')}
              <p>Best regards,<br>The PrimeChances Team</p>
            </div>
            <div class="footer">
              <p>© 2024 PrimeChances. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      from: 'PrimeChances <noreply@primechances.com>',
      tags: [
        { name: 'type', value: 'bulk_email' },
        { name: 'email_type', value: bulkEmailData.type }
      ]
    }));

    const result = await sendBulk(templates);
    
    if (result.success) {
      toast.success(`Bulk email sent to ${bulkEmailData.emails.length} recipients`);
      setBulkEmailData({
        emails: [],
        subject: '',
        content: '',
        type: 'announcement'
      });
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail.to || !testEmail.subject || !testEmail.content) {
      toast.error('Please fill in all test email fields');
      return;
    }

    const result = await sendCustomEmail({
      to: testEmail.to,
      subject: testEmail.subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${testEmail.subject}</title>
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
              <h1>Test Email</h1>
            </div>
            <div class="content">
              ${testEmail.content.replace(/\n/g, '<br>')}
              <p>This is a test email from PrimeChances Admin.</p>
            </div>
            <div class="footer">
              <p>© 2024 PrimeChances. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      from: 'PrimeChances <noreply@primechances.com>',
      tags: [
        { name: 'type', value: 'test_email' }
      ]
    });

    if (result.success) {
      toast.success('Test email sent successfully');
      setTestEmail({ to: '', subject: '', content: '' });
    }
  };

  if (!emailConfigured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Manager
          </CardTitle>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Manager</h2>
          <p className="text-gray-600">Manage email communications and notifications</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-500" />
            Email Configured (Mock Mode)
          </Badge>
          {testModeEnabled && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-orange-500" />
              Test Mode: {testEmailAddress}
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="stats" className="space-y-6">
        <TabsList>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Email</TabsTrigger>
          <TabsTrigger value="test">Test Email</TabsTrigger>
          <TabsTrigger value="suite">Test Suite</TabsTrigger>
          <TabsTrigger value="system-check">System Check</TabsTrigger>
          <TabsTrigger value="password-reset">Password Reset Test</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Emails Sent</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{emailStats.totalSent.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Welcome Emails</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{emailStats.welcomeEmails}</div>
                <p className="text-xs text-muted-foreground">New user registrations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Password Resets</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{emailStats.passwordResets}</div>
                <p className="text-xs text-muted-foreground">Security requests</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Opportunity Notifications</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{emailStats.opportunityNotifications}</div>
                <p className="text-xs text-muted-foreground">Job alerts sent</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Application Confirmations</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{emailStats.applicationConfirmations}</div>
                <p className="text-xs text-muted-foreground">Application confirmations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admin Notifications</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{emailStats.adminNotifications}</div>
                <p className="text-xs text-muted-foreground">System alerts</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Send Bulk Email</CardTitle>
              <CardDescription>
                Send emails to multiple users at once
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email-list">Recipients</Label>
                <Textarea
                  id="email-list"
                  placeholder="Enter email addresses separated by commas or new lines"
                  value={bulkEmailData.emails.join('\n')}
                  onChange={(e) => setBulkEmailData(prev => ({
                    ...prev,
                    emails: e.target.value.split(/[,\n]/).map(email => email.trim()).filter(Boolean)
                  }))}
                  className="min-h-[100px]"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {bulkEmailData.emails.length} recipients selected
                </p>
              </div>

              <div>
                <Label htmlFor="email-type">Email Type</Label>
                <Select
                  value={bulkEmailData.type}
                  onValueChange={(value: 'announcement' | 'newsletter' | 'promotion') => 
                    setBulkEmailData(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                    <SelectItem value="promotion">Promotion</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bulk-subject">Subject</Label>
                <Input
                  id="bulk-subject"
                  placeholder="Email subject"
                  value={bulkEmailData.subject}
                  onChange={(e) => setBulkEmailData(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="bulk-content">Content</Label>
                <Textarea
                  id="bulk-content"
                  placeholder="Email content"
                  value={bulkEmailData.content}
                  onChange={(e) => setBulkEmailData(prev => ({ ...prev, content: e.target.value }))}
                  className="min-h-[200px]"
                />
              </div>

              <Button
                onClick={handleBulkEmailSubmit}
                disabled={loading || !bulkEmailData.emails.length}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Bulk Email ({bulkEmailData.emails.length} recipients)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Send Test Email</CardTitle>
              <CardDescription>
                Test email functionality by sending a sample email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="test-to">To</Label>
                <Input
                  id="test-to"
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail.to}
                  onChange={(e) => setTestEmail(prev => ({ ...prev, to: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="test-subject">Subject</Label>
                <Input
                  id="test-subject"
                  placeholder="Test email subject"
                  value={testEmail.subject}
                  onChange={(e) => setTestEmail(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="test-content">Content</Label>
                <Textarea
                  id="test-content"
                  placeholder="Test email content"
                  value={testEmail.content}
                  onChange={(e) => setTestEmail(prev => ({ ...prev, content: e.target.value }))}
                  className="min-h-[150px]"
                />
              </div>

              <Button
                onClick={handleTestEmail}
                disabled={loading}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Test Email
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suite" className="space-y-6">
          <EmailTestSuite />
        </TabsContent>
        
        <TabsContent value="system-check" className="space-y-6">
          <EmailSystemChecker />
        </TabsContent>
        
        <TabsContent value="password-reset" className="space-y-6">
          <PasswordResetTest />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailManager;
