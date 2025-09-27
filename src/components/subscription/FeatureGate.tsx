
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, Star, CreditCard, Check } from 'lucide-react';
import { useUserTier } from '@/hooks/useUserTier';
import { useFlutterwavePayment } from '@/hooks/useFlutterwavePayment';

interface FeatureGateProps {
  feature: string;
  description: string;
  children: React.ReactNode;
  showUpgrade?: boolean;
}

const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  description,
  children,
  showUpgrade = true
}) => {
  const { hasProAccess, loading } = useUserTier();
  const { processPayment, isProcessing, proPrice, priceLoading } = useFlutterwavePayment();

  // Same features list as SubscriptionManager
  const proFeatures = [
    "Advanced search filters",
    "24/7 AI Career Assistant", 
    "AI Voice Chat Interface",
    "ATS-optimized CV generation",
    "AI-powered application guidance",
    "Success rate analysis",
    "Priority email support",
    "Application tracking & analytics",
    "Document templates",
    "Early access to new features"
  ];

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 rounded-lg h-32 flex items-center justify-center">
        <span className="text-gray-500">Loading...</span>
      </div>
    );
  }

  if (hasProAccess()) {
    return <>{children}</>;
  }

  if (!showUpgrade) {
    return null;
  }

  const handleUpgrade = async () => {
    await processPayment('pro');
  };

  return (
    <Card className="border-2 border-dashed border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Crown className="h-8 w-8 text-amber-500 mr-2" />
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            Pro Feature
          </Badge>
        </div>
        <CardTitle className="text-xl text-gray-800">{feature}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600 text-center">{description}</p>
        
        {/* Pro Features List - Same as Subscription Page */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800 text-center">Pro Features Include:</h4>
          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
            {proFeatures.map((proFeature, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{proFeature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 text-center">
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg p-3">
            <p className="text-lg font-semibold text-gray-800">
              {priceLoading ? "Loading..." : `₦${proPrice.toLocaleString()}`}
              <span className="text-sm font-normal">/month</span>
            </p>
          </div>
          
          <Button 
            onClick={handleUpgrade}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold px-6 py-2"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            {isProcessing ? 'Processing...' : 'Pay with Flutterwave'}
          </Button>
        </div>
        
        <p className="text-xs text-gray-400 text-center">
          Secure payment • Cancel anytime • 30-day money-back guarantee
        </p>
      </CardContent>
    </Card>
  );
};

export default FeatureGate;

