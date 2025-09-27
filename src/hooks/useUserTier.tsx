
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type SubscriptionTier = Database['public']['Enums']['subscription_tier'];

interface UserTierData {
  tier: SubscriptionTier;
  loading: boolean;
  error: string | null;
}

export const useUserTier = () => {
  const { user } = useAuth();
  const [tierData, setTierData] = useState<UserTierData>({
    tier: 'free',
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!user) {
      setTierData({ tier: 'free', loading: false, error: null });
      return;
    }

    fetchUserTier();
  }, [user]);

  const fetchUserTier = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setTierData({
        tier: data.subscription_tier,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching user tier:', error);
      setTierData({
        tier: 'free',
        loading: false,
        error: 'Failed to load subscription tier'
      });
    }
  };

  const upgradeToProTier = async () => {
    if (!user) return false;

    try {
      const { error } = await supabase.rpc('upgrade_user_to_pro', {
        _user_id: user.id
      });

      if (error) throw error;

      // Refresh tier data
      await fetchUserTier();
      return true;
    } catch (error) {
      console.error('Error upgrading to pro:', error);
      return false;
    }
  };

  const checkUserTier = () => {
    return {
      isPro: tierData.tier === 'pro',
      isFree: tierData.tier === 'free',
      tier: tierData.tier
    };
  };

  const hasProAccess = () => {
    return tierData.tier === 'pro';
  };

  return {
    ...tierData,
    checkUserTier,
    hasProAccess,
    upgradeToProTier,
    refetch: fetchUserTier
  };
};
