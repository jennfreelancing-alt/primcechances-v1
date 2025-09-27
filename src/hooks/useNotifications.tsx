
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'opportunity' | 'deadline' | 'approval' | 'system';
  is_read: boolean;
  created_at: string;
  opportunity_id?: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setupNotifications();
      requestNotificationPermission();
    }
  }, [user]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const setupNotifications = async () => {
    try {
      // Set up real-time subscription for new opportunities
      const channel = supabase
        .channel('notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'opportunities'
        }, (payload) => {
          handleNewOpportunity(payload.new);
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_submissions'
        }, (payload) => {
          if (payload.new.user_id === user?.id) {
            handleSubmissionUpdate(payload.new);
          }
        })
        .subscribe();

      // Check for deadline notifications using bookmarks instead of saved opportunities
      checkUpcomingDeadlines();
      
      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error('Error setting up notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewOpportunity = async (opportunity: any) => {
    if (!user || !opportunity.is_published) return;

    // Get user preferences to check if this matches their interests
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('field_of_study, country')
      .eq('id', user.id)
      .single();

    if (shouldNotifyUser(opportunity, userProfile)) {
      const notification = {
        id: crypto.randomUUID(),
        title: 'New Opportunity Match!',
        message: `${opportunity.title} at ${opportunity.organization} matches your interests`,
        type: 'opportunity' as const,
        is_read: false,
        created_at: new Date().toISOString(),
        opportunity_id: opportunity.id
      };

      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show toast notification
      toast.success(notification.title, {
        description: notification.message,
        action: {
          label: 'View',
          onClick: () => window.location.href = `/opportunity/${opportunity.id}`
        }
      });

      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico'
        });
      }
    }
  };

  const handleSubmissionUpdate = (submission: any) => {
    const notification = {
      id: crypto.randomUUID(),
      title: 'Submission Update',
      message: `Your submission has been ${submission.status}`,
      type: 'approval' as const,
      is_read: false,
      created_at: new Date().toISOString()
    };

    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    toast.info(notification.title, {
      description: notification.message
    });
  };

  const checkUpcomingDeadlines = async () => {
    if (!user) return;

    try {
      // Get user's bookmarked opportunities with deadlines in next 7 days
      const { data: bookmarkedOpportunities } = await supabase
        .from('user_bookmarks')
        .select(`
          opportunities (
            id, title, organization, application_deadline
          )
        `)
        .eq('user_id', user.id);

      const upcoming = bookmarkedOpportunities?.filter(bookmark => {
        const deadline = bookmark.opportunities?.application_deadline;
        if (!deadline) return false;
        
        const deadlineDate = new Date(deadline);
        const now = new Date();
        const daysUntil = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        return daysUntil <= 7 && daysUntil > 0;
      });

      upcoming?.forEach(bookmark => {
        const opp = bookmark.opportunities;
        if (!opp) return;
        
        const deadlineDate = new Date(opp.application_deadline!);
        const daysUntil = Math.ceil((deadlineDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        const notification = {
          id: crypto.randomUUID(),
          title: 'Deadline Approaching!',
          message: `${opp.title} deadline is in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`,
          type: 'deadline' as const,
          is_read: false,
          created_at: new Date().toISOString(),
          opportunity_id: opp.id
        };

        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });
    } catch (error) {
      console.error('Error checking deadlines:', error);
    }
  };

  const shouldNotifyUser = (opportunity: any, userProfile: any): boolean => {
    if (!userProfile) return false;
    
    // Simple matching logic
    const fieldMatch = userProfile.field_of_study && 
      opportunity.description?.toLowerCase().includes(userProfile.field_of_study.toLowerCase());
    
    const locationMatch = userProfile.country && 
      (opportunity.location?.toLowerCase().includes(userProfile.country.toLowerCase()) || opportunity.is_remote);
    
    return fieldMatch || locationMatch;
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead
  };
};
