
import { useState } from 'react';
import { useProSubscriptionPrice } from './useProSubscriptionPrice';
import { useAuth } from '@/hooks/useAuth';
import { useUserTier } from '@/hooks/useUserTier';
import { supabase } from '@/integrations/supabase/client';
import { initializeFlutterwavePayment, loadFlutterwaveScript } from '@/services/flutterwaveService';
import { useToast } from '@/hooks/use-toast';

export const useFlutterwavePayment = () => {
  const { user } = useAuth();
  const { refetch } = useUserTier();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const { price: proPrice, loading: priceLoading } = useProSubscriptionPrice();

  const processPayment = async (planType: 'pro') => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to upgrade your subscription.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    if (priceLoading) {
      toast({
        title: 'Please wait',
        description: 'Fetching latest subscription price...'
      });
      setIsProcessing(false);
      return;
    }

    try {
      // Load Flutterwave script
      await loadFlutterwaveScript();

      const userName = user.user_metadata?.full_name || user.email || 'User';
      const amount = proPrice;

      initializeFlutterwavePayment(
        amount,
        user.email || '',
        userName,
        async (response) => {
          console.log('Payment response:', response);
          
          if (response.status === 'successful') {
            try {
              // Create subscription record
              const { error: subscriptionError } = await supabase
                .from('subscriptions')
                .insert({
                  user_id: user.id,
                  tier: planType,
                  status: 'active',
                  amount: amount,
                  currency: 'NGN',
                  billing_cycle: 'monthly',
                  current_period_start: new Date().toISOString(),
                  current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                  payment_provider: 'flutterwave',
                  external_subscription_id: response.transaction_id,
                });

              if (subscriptionError) throw subscriptionError;

              // Update user profile tier
              const { error: profileError } = await supabase
                .from('user_profiles')
                .update({ subscription_tier: planType, updated_at: new Date().toISOString() })
                .eq('id', user.id);

              if (profileError) throw profileError;

              // Refresh user tier data
              await refetch();

              toast({
                title: 'Payment Successful!',
                description: 'Your account has been upgraded to Pro. Enjoy your premium features!',
              });

            } catch (error) {
              console.error('Error updating subscription:', error);
              toast({
                title: 'Payment Processed',
                description: 'Payment was successful, but there was an issue upgrading your account. Please contact support.',
                variant: 'destructive',
              });
            }
          } else {
            toast({
              title: 'Payment Failed',
              description: 'Your payment could not be processed. Please try again.',
              variant: 'destructive',
            });
          }
          setIsProcessing(false);
        },
        () => {
          console.log('Payment cancelled by user');
          setIsProcessing(false);
        }
      );
    } catch (error) {
      console.error('Error loading payment system:', error);
      toast({
        title: 'Payment System Error',
        description: 'Unable to load payment system. Please try again later.',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  return {
    processPayment,
    isProcessing,
    proPrice,
    priceLoading,
  };
};
