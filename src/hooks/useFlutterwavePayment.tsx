
import { useState } from 'react';
import { useProSubscriptionPrice } from './useProSubscriptionPrice';
import { useAuth } from '@/hooks/useAuth';
import { useUserTier } from '@/hooks/useUserTier';
import { supabase } from '@/integrations/supabase/client';
import { initializeFlutterwavePayment, loadFlutterwaveScript, isLiveMode } from '@/services/flutterwaveService';
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
      console.log('🔄 Starting payment process...');
      
      // Load Flutterwave script
      console.log('📜 Loading Flutterwave script...');
      await loadFlutterwaveScript();
      console.log('✅ Flutterwave script loaded successfully');

      const userName = user.user_metadata?.full_name || user.email || 'User';
      const amount = proPrice;
      
      console.log('💳 Processing payment:', {
        mode: isLiveMode() ? 'LIVE' : 'TEST',
        amount,
        userEmail: user.email,
        planType,
        userName
      });

      // Check if Flutterwave is available
      if (!window.FlutterwaveCheckout) {
        throw new Error('Flutterwave checkout not available');
      }

      console.log('🚀 Initializing Flutterwave payment...');
      
      // Set a timeout to prevent getting stuck
      const paymentTimeout = setTimeout(() => {
        console.error('⏰ Payment initialization timeout');
        toast({
          title: 'Payment Timeout',
          description: 'Payment system is taking too long to load. Please try again.',
          variant: 'destructive',
        });
        setIsProcessing(false);
      }, 30000); // 30 second timeout
      
      initializeFlutterwavePayment(
        amount,
        user.email || '',
        userName,
        async (response) => {
          clearTimeout(paymentTimeout);
          console.log('💳 Payment response received:', response);
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
          clearTimeout(paymentTimeout);
          console.log('🚫 Payment cancelled by user');
          toast({
            title: 'Payment Cancelled',
            description: 'Payment was cancelled. You can try again anytime.',
          });
          setIsProcessing(false);
        }
      );
    } catch (error) {
      console.error('❌ Error in payment process:', error);
      toast({
        title: 'Payment System Error',
        description: `Unable to process payment: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
