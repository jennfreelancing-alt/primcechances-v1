
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UserAnalytics {
  totalUsers: number;
  activeUsersToday: number;
  mostUsedFeatures: Array<{ feature: string; count: number }>;
  categoryVisits: Array<{ category: string; visits: number }>;
  aiToolUsage: Array<{ tool: string; usage: number }>;
  userRetention: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

export const useAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<UserAnalytics>({
    totalUsers: 0,
    activeUsersToday: 0,
    mostUsedFeatures: [],
    categoryVisits: [],
    aiToolUsage: [],
    userRetention: { daily: 0, weekly: 0, monthly: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const trackPageView = async () => {
    // Mock implementation - in real app this would log to analytics table
    console.log('Page view tracked:', window.location.pathname);
  };

  const trackFeatureUsage = async (feature: string, metadata?: any) => {
    // Mock implementation - in real app this would log to analytics table
    console.log('Feature usage tracked:', feature, metadata);
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get total users from existing user_profiles table
      const { count: totalUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      // Mock active users today (in real app would query user sessions)
      const activeUsersToday = Math.floor(Math.random() * 50) + 20;

      // Mock data for features that would normally come from analytics tables
      const mostUsedFeatures = [
        { feature: 'AI Recommendations', count: 245 },
        { feature: 'Opportunity Search', count: 189 },
        { feature: 'Document Generator', count: 156 },
        { feature: 'AI Chat', count: 134 },
        { feature: 'Profile Management', count: 98 }
      ];

      const categoryVisits = [
        { category: 'Jobs', visits: 456 },
        { category: 'Scholarships', visits: 234 },
        { category: 'Internships', visits: 187 },
        { category: 'Fellowships', visits: 145 },
        { category: 'Grants', visits: 89 }
      ];

      const aiToolUsage = [
        { tool: 'Smart Recommendations', usage: 78 },
        { tool: 'Chat Assistant', usage: 65 },
        { tool: 'Document Generator', usage: 52 },
        { tool: 'Voice Assistant', usage: 23 }
      ];

      const userRetention = {
        daily: 67.5,
        weekly: 45.2,
        monthly: 32.8
      };

      setAnalytics({
        totalUsers: totalUsers || 0,
        activeUsersToday,
        mostUsedFeatures,
        categoryVisits,
        aiToolUsage,
        userRetention
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    analytics,
    loading,
    trackFeatureUsage,
    trackPageView,
    refetch: fetchAnalytics
  };
};
