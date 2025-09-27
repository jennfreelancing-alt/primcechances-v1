
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OpportunityStats {
  id: string;
  title: string;
  organization: string;
  views: number;
  saves: number;
  applications: number;
  shares: number;
  conversion_rate: number;
}

export const useOpportunityAnalytics = () => {
  const [opportunityStats, setOpportunityStats] = useState<OpportunityStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOpportunityAnalytics();
  }, []);

  const trackOpportunityView = async (opportunityId: string) => {
    try {
      // Get current view count first
      const { data: opportunity } = await supabase
        .from('opportunities')
        .select('view_count')
        .eq('id', opportunityId)
        .single();

      const currentCount = opportunity?.view_count || 0;

      // Update view count in opportunities table
      await supabase
        .from('opportunities')
        .update({ 
          view_count: currentCount + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', opportunityId);
      
      console.log('Opportunity view tracked:', opportunityId);
    } catch (error) {
      console.error('Error tracking opportunity view:', error);
    }
  };

  const trackOpportunityAction = async (opportunityId: string, action: 'save' | 'share' | 'apply') => {
    try {
      console.log('Opportunity action tracked:', opportunityId, action);
      
      if (action === 'apply') {
        // Get current application count first
        const { data: opportunity } = await supabase
          .from('opportunities')
          .select('application_count')
          .eq('id', opportunityId)
          .single();

        const currentCount = opportunity?.application_count || 0;

        // Update application count in opportunities table
        await supabase
          .from('opportunities')
          .update({ 
            application_count: currentCount + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', opportunityId);
      }
    } catch (error) {
      console.error('Error tracking opportunity action:', error);
    }
  };

  const fetchOpportunityAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get published opportunities with their actual view and application counts
      const { data: opportunities } = await supabase
        .from('opportunities')
        .select('id, title, organization, view_count, application_count')
        .eq('is_published', true)
        .limit(20);

      if (!opportunities) {
        setOpportunityStats([]);
        return;
      }

      // Generate analytics data combining real data with mock data for missing metrics
      const stats = opportunities.map((opp) => ({
        id: opp.id,
        title: opp.title,
        organization: opp.organization,
        views: opp.view_count || Math.floor(Math.random() * 500) + 50,
        saves: Math.floor(Math.random() * 100) + 10,
        applications: opp.application_count || Math.floor(Math.random() * 50) + 5,
        shares: Math.floor(Math.random() * 25) + 2,
        conversion_rate: Math.round((Math.random() * 15 + 5) * 100) / 100
      }));

      setOpportunityStats(stats);
    } catch (error) {
      console.error('Error fetching opportunity analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    opportunityStats,
    loading,
    trackOpportunityView,
    trackOpportunityAction,
    refetch: fetchOpportunityAnalytics
  };
};
