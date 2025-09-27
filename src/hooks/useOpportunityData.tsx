import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface OpportunityData {
  id: string;
  title: string;
  description: string;
  organization: string;
  location?: string;
  is_remote?: boolean;
  salary_range?: string;
  application_deadline?: string;
  application_url?: string;
  source_url?: string;
  requirements?: string[];
  benefits?: string[];
  tags?: string[];
  created_at: string;
  category: {
    name: string;
    color?: string;
  };
}

export const useOpportunityData = (opportunityId: string | undefined) => {
  const [opportunity, setOpportunity] = useState<OpportunityData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOpportunity = async () => {
    if (!opportunityId) {
      console.log('No opportunityId provided');
      setLoading(false);
      return;
    }

    console.log('Fetching opportunity with ID:', opportunityId);
    try {
      // First, try to fetch the opportunity without category join
      const { data: opportunityData, error: opportunityError } = await supabase
        .from('opportunities')
        .select('*')
        .eq('id', opportunityId)
        .eq('status', 'approved')
        .single();

      console.log('Opportunity query response:', { opportunityData, opportunityError });

      if (opportunityError) {
        console.error('Opportunity query error:', opportunityError);
        throw opportunityError;
      }

      if (!opportunityData) {
        console.log('No opportunity found with ID:', opportunityId);
        setOpportunity(null);
        setLoading(false);
        return;
      }

      // Now fetch the category separately
      console.log('Fetching category with ID:', opportunityData.category_id);
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('name, color')
        .eq('id', opportunityData.category_id)
        .eq('is_active', true)
        .single();

      console.log('Category query response:', { categoryData, categoryError });

      if (categoryError) {
        console.error('Category query error:', categoryError);
        // Don't throw error, just use fallback
      }

      // Combine the data
      const combinedData = {
        ...opportunityData,
        category: categoryData || { name: 'Unknown', color: '#6B7280' }
      };

      console.log('Combined opportunity data:', combinedData);
      setOpportunity(combinedData);
    } catch (error) {
      console.error('Error fetching opportunity:', error);
      toast({
        title: "Error",
        description: "Could not load opportunity details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunity();
  }, [opportunityId]);

  return { opportunity, loading };
};
