
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
      console.log('🔄 Starting payment process...');
      
      // Load Flutterwave script
      await loadFlutterwaveScript();

      const userName = user.user_metadata?.full_name || user.email || 'User';
      const amount = proPrice;
      
      console.log('💳 Processing payment:', {
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
      
      initializeFlutterwavePayment(
        amount,
        user.email || '',
        userName,
        async (response) => {
          console.log('💳 Payment response received:', response);
          
          if (response.status === 'successful' || response.status === 'completed') {
            try {
              console.log('🔄 Processing successful payment...');
              
              // First, ensure user profile exists and update tier
              const { error: profileError } = await supabase
                .from('user_profiles')
                .upsert({ 
                  id: user.id,
                  subscription_tier: planType, 
                  updated_at: new Date().toISOString(),
                  email: user.email,
                  full_name: user.user_metadata?.full_name || user.email
                }, {
                  onConflict: 'id'
                });

              if (profileError) {
                console.error('Profile upsert error:', profileError);
                throw profileError;
              }

              console.log('✅ User profile updated to pro');

              // Then, upsert subscription record (insert or update if exists)
              const { error: subscriptionError } = await supabase
                .from('subscriptions')
                .upsert({
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
                  updated_at: new Date().toISOString()
                }, {
                  onConflict: 'user_id'
                });

              if (subscriptionError) {
                console.error('Subscription upsert error:', subscriptionError);
                throw subscriptionError;
              }

              console.log('✅ Subscription record updated');

              // Refresh user tier data with a small delay to ensure DB commit
              console.log('🔄 Refreshing user tier data...');
              setTimeout(async () => {
                await refetch();
                console.log('✅ User tier data refreshed');
              }, 500);
              
              console.log('✅ Payment processing completed successfully');

              toast({
                title: 'Payment Successful!',
                description: 'Your account has been upgraded to Pro. Enjoy your premium features!',
              });

              // Force page refresh after 2 seconds to ensure UI updates
              setTimeout(() => {
                window.location.reload();
              }, 2000);

            } catch (error) {
              console.error('Error updating subscription:', error);
              toast({
                title: 'Payment Processed',
                description: 'Payment was successful, but there was an issue upgrading your account. Please contact support.',
                variant: 'destructive',
              });
            }
          } else if (response.status === 'cancelled') {
            toast({
              title: 'Payment Cancelled',
              description: 'Payment was cancelled. You can try again anytime.',
            });
          } else {
            console.log('Payment status:', response.status);
            toast({
              title: 'Payment Failed',
              description: `Payment could not be processed. Status: ${response.status}. Please try again.`,
              variant: 'destructive',
            });
          }
          setIsProcessing(false);
        },
        () => {
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