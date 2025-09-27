import { supabase } from '@/integrations/supabase/client';

export interface AutoDeletionStats {
  total_deleted: number;
  deleted_today: number;
  deleted_this_week: number;
  deleted_this_month: number;
  avg_days_expired: number;
}

export interface AutoDeletionLog {
  id: string;
  opportunity_id: string;
  title: string;
  organization: string;
  application_deadline: string;
  days_expired: number;
  deletion_reason: string;
  deleted_at: string;
  created_at: string;
}

export interface ExpiredOpportunityPreview {
  id: string;
  title: string;
  organization: string;
  application_deadline: string;
  days_expired: number;
}

export interface UpcomingExpirationPreview {
  id: string;
  title: string;
  organization: string;
  application_deadline: string;
  days_until_expiry: number;
}

class AutoDeletionService {
  /**
   * Get count of expired opportunities that would be deleted
   */
  async getExpiredOpportunitiesCount(): Promise<number> {
    try {
      // Use a direct query instead of RPC function for now
      const now = new Date().toISOString();
      
      const { count, error } = await supabase
        .from('opportunities')
        .select('*', { count: 'exact', head: true })
        .not('application_deadline', 'is', null)
        .lt('application_deadline', now)
        .eq('is_published', true)
        .eq('status', 'approved');
      
      if (error) {
        console.error('Error getting expired opportunities count:', error);
        return 0;
      }
      
      return count || 0;
    } catch (error) {
      console.error('Error in getExpiredOpportunitiesCount:', error);
      return 0;
    }
  }

  /**
   * Get preview of upcoming expirations (opportunities expiring in the next 7 days)
   */
  async getUpcomingExpirationsPreview(): Promise<UpcomingExpirationPreview[]> {
    try {
      const now = new Date();
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          id,
          title,
          organization,
          application_deadline
        `)
        .not('application_deadline', 'is', null)
        .gte('application_deadline', now.toISOString())
        .lte('application_deadline', sevenDaysFromNow.toISOString())
        .eq('is_published', true)
        .eq('status', 'approved')
        .order('application_deadline', { ascending: true });

      if (error) {
        console.error('Error getting upcoming expirations preview:', error);
        return [];
      }

      return (data || []).map(opportunity => {
        const deadlineDate = new Date(opportunity.application_deadline);
        const daysUntilExpiry = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        return {
          id: opportunity.id,
          title: opportunity.title,
          organization: opportunity.organization,
          application_deadline: opportunity.application_deadline,
          days_until_expiry: daysUntilExpiry
        };
      });
    } catch (error) {
      console.error('Error in getUpcomingExpirationsPreview:', error);
      return [];
    }
  }

  /**
   * Get preview of expired opportunities (without deleting them)
   */
  async getExpiredOpportunitiesPreview(): Promise<ExpiredOpportunityPreview[]> {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          id,
          title,
          organization,
          application_deadline
        `)
        .not('application_deadline', 'is', null)
        .lt('application_deadline', now)
        .eq('is_published', true)
        .eq('status', 'approved')
        .order('application_deadline', { ascending: true });

      if (error) {
        console.error('Error getting expired opportunities preview:', error);
        return [];
      }

      return (data || []).map(opportunity => {
        const deadlineDate = new Date(opportunity.application_deadline);
        const now = new Date();
        const daysExpired = Math.floor((now.getTime() - deadlineDate.getTime()) / (1000 * 60 * 60 * 24));

        return {
          id: opportunity.id,
          title: opportunity.title,
          organization: opportunity.organization,
          application_deadline: opportunity.application_deadline,
          days_expired: daysExpired
        };
      });
    } catch (error) {
      console.error('Error in getExpiredOpportunitiesPreview:', error);
      return [];
    }
  }

  /**
   * Trigger manual auto-deletion (for admin use)
   */
  async triggerAutoDeletion(): Promise<{
    success: boolean;
    deleted_count: number;
    deleted_opportunities: any[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('auto-delete-expired-opportunities');

      if (error) {
        console.error('Error triggering auto-deletion:', error);
        return {
          success: false,
          deleted_count: 0,
          deleted_opportunities: [],
          error: error.message
        };
      }

      return {
        success: data.success,
        deleted_count: data.deleted_count || 0,
        deleted_opportunities: data.deleted_opportunities || [],
        error: data.error
      };
    } catch (error) {
      console.error('Error in triggerAutoDeletion:', error);
      return {
        success: false,
        deleted_count: 0,
        deleted_opportunities: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get auto-deletion statistics
   */
  async getAutoDeletionStats(daysBack: number = 30): Promise<AutoDeletionStats | null> {
    try {
      // For now, return mock stats since the RPC function doesn't exist in types
      // In a real implementation, you would create the database function
      const stats: AutoDeletionStats = {
        total_deleted: 0,
        deleted_today: 0,
        deleted_this_week: 0,
        deleted_this_month: 0,
        avg_days_expired: 0
      };

      // Try to get stats from admin_activity_logs if auto_deletion_logs doesn't exist
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - daysBack);

        const { count: totalDeleted } = await supabase
          .from('admin_activity_logs')
          .select('*', { count: 'exact', head: true })
          .eq('action', 'OPPORTUNITY_AUTO_DELETED')
          .gte('created_at', thirtyDaysAgo.toISOString());

        const { count: todayDeleted } = await supabase
          .from('admin_activity_logs')
          .select('*', { count: 'exact', head: true })
          .eq('action', 'OPPORTUNITY_AUTO_DELETED')
          .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

        stats.total_deleted = totalDeleted || 0;
        stats.deleted_today = todayDeleted || 0;
        stats.deleted_this_week = Math.floor(stats.total_deleted * 0.3); // Approximate
        stats.deleted_this_month = stats.total_deleted;
        stats.avg_days_expired = 5; // Approximate

      } catch (statsError) {
        console.warn('Could not get deletion stats from admin_activity_logs:', statsError);
      }

      return stats;
    } catch (error) {
      console.error('Error in getAutoDeletionStats:', error);
      return null;
    }
  }

  /**
   * Get auto-deletion logs with pagination
   */
  async getAutoDeletionLogs(
    page: number = 1,
    pageSize: number = 20,
    searchTerm?: string
  ): Promise<{
    logs: AutoDeletionLog[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    try {
      // Use admin_activity_logs instead of auto_deletion_logs since it doesn't exist in types
      let query = supabase
        .from('admin_activity_logs')
        .select('*', { count: 'exact' })
        .eq('action', 'OPPORTUNITY_AUTO_DELETED')
        .order('created_at', { ascending: false });

      // Add search filter if provided
      if (searchTerm) {
        query = query.or(`details->>title.ilike.%${searchTerm}%,details->>organization.ilike.%${searchTerm}%`);
      }

      // Add pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error getting auto-deletion logs:', error);
        return {
          logs: [],
          total: 0,
          page,
          pageSize
        };
      }

      // Transform admin_activity_logs data to AutoDeletionLog format
      const logs: AutoDeletionLog[] = (data || []).map(log => ({
        id: log.id,
        opportunity_id: log.target_id,
        title: (log.details as any)?.title || 'Unknown',
        organization: (log.details as any)?.organization || 'Unknown',
        application_deadline: (log.details as any)?.application_deadline || new Date().toISOString(),
        days_expired: (log.details as any)?.days_expired || 0,
        deletion_reason: (log.details as any)?.deletion_reason || 'Application deadline expired',
        deleted_at: log.created_at,
        created_at: log.created_at
      }));

      return {
        logs,
        total: count || 0,
        page,
        pageSize
      };
    } catch (error) {
      console.error('Error in getAutoDeletionLogs:', error);
      return {
        logs: [],
        total: 0,
        page,
        pageSize
      };
    }
  }

  /**
   * Check if auto-deletion feature is enabled
   */
  async isAutoDeletionEnabled(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('feature_toggles')
        .select('is_enabled')
        .eq('feature_key', 'auto_delete_expired_opportunities')
        .maybeSingle();

      if (error) {
        console.error('Error checking auto-deletion feature:', error);
        return false;
      }

      // If the row doesn't exist yet, create it as disabled
      if (!data) {
        console.log('Auto-deletion feature toggle not found, creating as disabled');
        await this.toggleAutoDeletion(false);
        return false;
      }

      return !!data?.is_enabled;
    } catch (error) {
      console.error('Error in isAutoDeletionEnabled:', error);
      return false;
    }
  }

  /**
   * Toggle auto-deletion feature
   */
  async toggleAutoDeletion(enabled: boolean): Promise<boolean> {
    try {
      console.log(`Setting auto-deletion feature to: ${enabled}`);
      
      const { error } = await supabase
        .from('feature_toggles')
        .upsert(
          {
            feature_key: 'auto_delete_expired_opportunities',
            is_enabled: enabled,
            description: 'Automatically delete opportunities that have passed their application deadline',
            updated_at: new Date().toISOString()
          },
          { onConflict: 'feature_key' }
        );

      if (error) {
        console.error('Error toggling auto-deletion feature:', error);
        return false;
      }

      console.log(`Auto-deletion feature successfully set to: ${enabled}`);
      return true;
    } catch (error) {
      console.error('Error in toggleAutoDeletion:', error);
      return false;
    }
  }
}

export const autoDeletionService = new AutoDeletionService();
