
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useFeatureToggle = (featureKey: string) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkFeatureToggle();
  }, [featureKey]);

  const checkFeatureToggle = async () => {
    try {
      const { data, error } = await supabase
        .from('feature_toggles')
        .select('is_enabled')
        .eq('feature_key', featureKey)
        .single();

      if (error) {
        console.error('Feature toggle check error:', error);
        setIsEnabled(false);
      } else {
        setIsEnabled(data?.is_enabled || false);
      }
    } catch (error) {
      console.error('Error checking feature toggle:', error);
      setIsEnabled(false);
    } finally {
      setLoading(false);
    }
  };

  return { isEnabled, loading, refetch: checkFeatureToggle };
};
