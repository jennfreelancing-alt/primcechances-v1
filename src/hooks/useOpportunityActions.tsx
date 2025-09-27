
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export const useOpportunityActions = (opportunityId: string | undefined) => {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const checkBookmarkStatus = async () => {
    if (!user || !opportunityId) return;

    try {
      const { data, error } = await supabase
        .from('user_bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('opportunity_id', opportunityId)
        .single();

      if (!error && data) {
        setIsBookmarked(true);
      }
    } catch (error) {
      // No bookmark found, which is fine
    }
  };

  const checkApplicationStatus = async () => {
    if (!user || !opportunityId) return;

    try {
      const { data, error } = await supabase
        .from('user_applications')
        .select('id')
        .eq('user_id', user.id)
        .eq('opportunity_id', opportunityId)
        .single();

      if (!error && data) {
        setHasApplied(true);
      }
    } catch (error) {
      // No application found, which is fine
    }
  };

  const handleBookmark = async () => {
    console.log('handleBookmark called', { user, opportunityId });
    if (!user || !opportunityId) return;

    setActionLoading(true);
    try {
      if (isBookmarked) {
        const { error } = await supabase
          .from('user_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('opportunity_id', opportunityId);

        if (error) throw error;
        setIsBookmarked(false);
        toast({
          title: "Bookmark removed",
          description: "Opportunity removed from your bookmarks.",
        });
      } else {
        const { error } = await supabase
          .from('user_bookmarks')
          .insert({
            user_id: user.id,
            opportunity_id: opportunityId
          });

        if (error) throw error;
        setIsBookmarked(true);
        toast({
          title: "Bookmarked!",
          description: "Opportunity saved to your bookmarks.",
        });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Error",
        description: "Could not update bookmark status.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleApply = async (opportunity: any) => {
    console.log('handleApply called', { user, opportunityId, opportunity });
    if (!user || !opportunityId || !opportunity) return;

    if (opportunity.application_url) {
      window.open(opportunity.application_url, '_blank');
    }

    if (!hasApplied) {
      setActionLoading(true);
      try {
        const { error } = await supabase
          .from('user_applications')
          .insert({
            user_id: user.id,
            opportunity_id: opportunityId,
            application_status: 'applied'
          });

        if (error) throw error;
        setHasApplied(true);
        toast({
          title: "Application tracked!",
          description: "We've recorded your application for tracking.",
        });
      } catch (error) {
        console.error('Error tracking application:', error);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleShare = async (opportunity: any) => {
    console.log('handleShare called', { opportunity, hasNativeShare: !!navigator.share });
    
    try {
      if (navigator.share) {
        console.log('Using native share API');
        await navigator.share({
          title: opportunity?.title,
          text: `Check out this opportunity: ${opportunity?.title} at ${opportunity?.organization}`,
          url: window.location.href,
        });
        console.log('Native share completed successfully');
      } else {
        console.log('Using clipboard fallback');
        await navigator.clipboard.writeText(window.location.href);
        console.log('Link copied to clipboard');
        toast({
          title: "Link copied!",
          description: "Opportunity link copied to clipboard.",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to clipboard even if native share fails
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied!",
          description: "Opportunity link copied to clipboard.",
        });
      } catch (clipboardError) {
        console.error('Clipboard fallback failed:', clipboardError);
        toast({
          title: "Share failed",
          description: "Could not share or copy link.",
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    if (user && opportunityId) {
      checkBookmarkStatus();
      checkApplicationStatus();
    }
  }, [user, opportunityId]);

  return {
    isBookmarked,
    hasApplied,
    actionLoading,
    handleBookmark,
    handleApply,
    handleShare
  };
};
