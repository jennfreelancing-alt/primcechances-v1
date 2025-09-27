
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  UserCheck, 
  Crown, 
  Activity, 
  FileText, 
  Eye, 
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedStats {
  totalOpportunities: number;
  publishedOpportunities: number;
  pendingSubmissions: number;
  totalUsers: number;
  activeUsers: number;
  subscribedUsers: number;
  onlineUsers: number;
  totalApplications: number;
  approvedOpportunities: number;
}

const EnhancedStatsCards = () => {
  const [stats, setStats] = useState<EnhancedStats>({
    totalOpportunities: 0,
    publishedOpportunities: 0,
    pendingSubmissions: 0,
    totalUsers: 0,
    activeUsers: 0,
    subscribedUsers: 0,
    onlineUsers: 0,
    totalApplications: 0,
    approvedOpportunities: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnhancedStats();
  }, []);

  const fetchEnhancedStats = async () => {
    try {
      const [
        opportunitiesResult,
        publishedOpportunitiesResult,
        pendingSubmissionsResult,
        usersResult,
        activeUsersResult,
        subscribedUsersResult,
        onlineUsersResult,
        applicationsResult,
        approvedOpportunitiesResult
      ] = await Promise.all([
        supabase.from('opportunities').select('*', { count: 'exact', head: true }),
        supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('user_submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('user_sessions').select('*', { count: 'exact', head: true }).eq('is_active', true).gte('last_activity', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('subscription_tier', 'pro'),
        supabase.from('user_sessions').select('*', { count: 'exact', head: true }).eq('is_active', true).gte('last_activity', new Date(Date.now() - 15 * 60 * 1000).toISOString()),
        supabase.from('user_applications').select('*', { count: 'exact', head: true }),
        supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('status', 'approved')
      ]);

      setStats({
        totalOpportunities: opportunitiesResult.count || 0,
        publishedOpportunities: publishedOpportunitiesResult.count || 0,
        pendingSubmissions: pendingSubmissionsResult.count || 0,
        totalUsers: usersResult.count || 0,
        activeUsers: activeUsersResult.count || 0,
        subscribedUsers: subscribedUsersResult.count || 0,
        onlineUsers: onlineUsersResult.count || 0,
        totalApplications: applicationsResult.count || 0,
        approvedOpportunities: approvedOpportunitiesResult.count || 0
      });
    } catch (error) {
      console.error('Error fetching enhanced stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Opportunities',
      value: stats.totalOpportunities,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Published Opportunities',
      value: stats.publishedOpportunities,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Pending Submissions',
      value: stats.pendingSubmissions,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Active Users (30d)',
      value: stats.activeUsers,
      icon: UserCheck,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Subscribed Users',
      value: stats.subscribedUsers,
      icon: Crown,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Online Users',
      value: stats.onlineUsers,
      icon: Activity,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    },
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default EnhancedStatsCards;
