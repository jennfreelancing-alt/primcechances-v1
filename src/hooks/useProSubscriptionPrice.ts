import { useEffect, useState, useRef } from 'react';
import { getProSubscriptionPrice } from '@/services/settingsService';
import { toast } from 'sonner';

export function useProSubscriptionPrice(defaultValue: number = 2500) {
  const [price, setPrice] = useState<number>(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout;

    const fetchPrice = () => {
      setLoading(true);
      getProSubscriptionPrice(defaultValue)
        .then((val) => {
          const parsed = Number(val);
          if (isMounted) setPrice(!isNaN(parsed) && parsed > 0 ? parsed : defaultValue);
        })
        .catch(() => toast.error('Failed to fetch subscription price'))
        .finally(() => { if (isMounted) setLoading(false); });
    };

    fetchPrice();
    intervalId = setInterval(fetchPrice, 10000); // Poll every 10 seconds

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [defaultValue]);

  return { price, loading };
}
