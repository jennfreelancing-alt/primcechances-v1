
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminSetupGuide = () => {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    });
  };

  const exampleEmails = "admin@yourcompany.com,owner@yourcompany.com,manager@yourcompany.com";

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Setup Guide</h1>
        <p className="text-gray-600">Configure automatic admin role assignment for your PrimeChances</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Environment Variable Setup
          </CardTitle>
          <CardDescription>
            Set up the ADMIN_EMAILS environment variable in Supabase to automatically assign admin roles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Users with email addresses listed in the ADMIN_EMAILS environment variable will automatically 
              receive admin privileges when they sign up or sign in.
            </AlertDescription>
          </Alert>

          <div>
            <h3 className="font-semibold mb-2">Step 1: Go to Supabase Edge Functions Settings</h3>
            <Button 
              variant="outline" 
              onClick={() => window.open('https://supabase.com/dashboard/project/hieypblvsqqpkdcwmnpc/settings/functions', '_blank')}
              className="mb-3"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Supabase Function Settings
            </Button>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Step 2: Add Environment Variable</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Variable Name:</label>
                <div className="flex items-center gap-2">
                  <code className="bg-white px-3 py-2 rounded border flex-1">ADMIN_EMAILS</code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard('ADMIN_EMAILS')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Variable Value (comma-separated emails):</label>
                <div className="flex items-center gap-2">
                  <code className="bg-white px-3 py-2 rounded border flex-1 text-sm">
                    {exampleEmails}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(exampleEmails)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Replace with your actual admin email addresses
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Step 3: How It Works</h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
              <li>When a user signs up or signs in, the system checks their email against the ADMIN_EMAILS list</li>
              <li>If their email is found, they're automatically assigned the 'admin' role</li>
              <li>Admin users can then access the admin dashboard at <code>/admin</code></li>
              <li>The email matching is case-insensitive and handles whitespace</li>
              <li>You can update the admin emails list anytime by modifying the environment variable</li>
            </ul>
          </div>

          <Alert>
            <AlertDescription>
              <strong>Security Note:</strong> Make sure to only add trusted email addresses to the ADMIN_EMAILS 
              environment variable, as these users will have full administrative access to your platform.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Testing the Setup</CardTitle>
          <CardDescription>
            How to verify that admin role assignment is working correctly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Add your email address to the ADMIN_EMAILS environment variable</li>
            <li>Sign out and sign back in to your account</li>
            <li>The system will automatically check and assign the admin role</li>
            <li>Try accessing the admin dashboard at <code>/admin</code></li>
            <li>Check the Edge Function logs in Supabase for any error messages</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSetupGuide;
