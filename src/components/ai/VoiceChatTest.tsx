import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Mic, Volume2, CheckCircle, XCircle } from 'lucide-react';
import { useUserTier } from '@/hooks/useUserTier';
import { useFlutterwavePayment } from '@/hooks/useFlutterwavePayment';
import { toast } from 'sonner';

const VoiceChatTest: React.FC = () => {
  const { hasProAccess, tier, loading } = useUserTier();
  const { processPayment, isProcessing } = useFlutterwavePayment();

  const handleUpgrade = async () => {
    await processPayment('pro');
  };

  const testVoiceChatAccess = () => {
    if (hasProAccess()) {
      toast.success('✅ Voice chat access granted! You can use AI voice features.');
    } else {
      toast.error('❌ Voice chat is restricted to Pro users. Upgrade to access this feature.');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="w-5 h-5" />
          AI Voice Chat Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Plan:</span>
            <Badge variant={tier === 'pro' ? 'default' : 'secondary'}>
              {tier === 'pro' ? (
                <>
                  <Crown className="w-3 h-3 mr-1" />
                  Pro
                </>
              ) : (
                'Free'
              )}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {hasProAccess() ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm">Voice Input</span>
            </div>
            <div className="flex items-center gap-2">
              {hasProAccess() ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm">Voice Responses</span>
            </div>
            <div className="flex items-center gap-2">
              {hasProAccess() ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm">Advanced AI Features</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={testVoiceChatAccess}
            className="w-full"
            variant={hasProAccess() ? 'default' : 'outline'}
          >
            {hasProAccess() ? 'Test Voice Chat Access' : 'Test Voice Chat Restriction'}
          </Button>

          {!hasProAccess() && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 text-center">
                Upgrade to Pro to unlock AI voice chat features
              </p>
              <Button 
                onClick={handleUpgrade}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                {isProcessing ? 'Processing...' : 'Upgrade to Pro'}
              </Button>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 text-center">
          {hasProAccess() 
            ? '🎉 You have full access to AI voice chat features!' 
            : '🔒 Voice chat features require Pro subscription'
          }
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceChatTest;

