import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Trash2, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  Building, 
  Search,
  RefreshCw,
  Settings,
  BarChart3,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { autoDeletionService, AutoDeletionStats, AutoDeletionLog, ExpiredOpportunityPreview, UpcomingExpirationPreview } from '@/services/autoDeletionService';
import AutoDeletionTest from './AutoDeletionTest';
import VoiceChatTest from '@/components/ai/VoiceChatTest';

const AutoDeletionManager: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [expiredCount, setExpiredCount] = useState(0);
  const [expiredPreview, setExpiredPreview] = useState<ExpiredOpportunityPreview[]>([]);
  const [upcomingExpirations, setUpcomingExpirations] = useState<UpcomingExpirationPreview[]>([]);
  const [stats, setStats] = useState<AutoDeletionStats | null>(null);
  const [logs, setLogs] = useState<AutoDeletionLog[]>([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  const pageSize = 10;

  useEffect(() => {
    loadData();
  }, []);

  // Add a periodic refresh to keep data up to date
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        loadData();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (showLogs) {
      loadLogs();
    }
  }, [showLogs, currentPage, searchTerm]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [enabled, count, preview, upcoming, statsData] = await Promise.all([
        autoDeletionService.isAutoDeletionEnabled(),
        autoDeletionService.getExpiredOpportunitiesCount(),
        autoDeletionService.getExpiredOpportunitiesPreview(),
        autoDeletionService.getUpcomingExpirationsPreview(),
        autoDeletionService.getAutoDeletionStats()
      ]);

      setIsEnabled(enabled);
      setExpiredCount(count);
      setExpiredPreview(preview);
      setUpcomingExpirations(upcoming);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading auto-deletion data:', error);
      toast.error('Failed to load auto-deletion data');
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      const result = await autoDeletionService.getAutoDeletionLogs(
        currentPage,
        pageSize,
        searchTerm || undefined
      );
      setLogs(result.logs);
      setLogsTotal(result.total);
    } catch (error) {
      console.error('Error loading deletion logs:', error);
      toast.error('Failed to load deletion logs');
    }
  };

  const handleToggleAutoDeletion = async (enabled: boolean) => {
    try {
      const success = await autoDeletionService.toggleAutoDeletion(enabled);
      if (success) {
        setIsEnabled(enabled);
        toast.success(`Auto-deletion ${enabled ? 'enabled' : 'disabled'}`);
      } else {
        toast.error('Failed to update auto-deletion setting');
      }
    } catch (error) {
      console.error('Error toggling auto-deletion:', error);
      toast.error('Failed to update auto-deletion setting');
    }
  };

  const handleManualDeletion = async () => {
    setDeleting(true);
    try {
      const result = await autoDeletionService.triggerAutoDeletion();
      
      if (result.success) {
        toast.success(`Successfully deleted ${result.deleted_count} expired opportunities`);
        await loadData(); // Refresh data
      } else {
        toast.error(result.error || 'Failed to delete expired opportunities');
      }
    } catch (error) {
      console.error('Error in manual deletion:', error);
      toast.error('Failed to delete expired opportunities');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDaysExpired = (days: number) => {
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  const formatDaysUntilExpiry = (days: number) => {
    if (days === 0) return 'Today';
    if (days === 1) return '1 day';
    return `${days} days`;
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Auto-Deletion Manager</h2>
        <Button onClick={loadData} disabled={loading} variant="outline" className="w-full sm:w-auto">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Auto-Deletion</p>
                <p className="text-lg font-semibold">
                  {isEnabled ? (
                    <Badge variant="default" className="bg-green-500">Enabled</Badge>
                  ) : (
                    <Badge variant="secondary">Disabled</Badge>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Expired Opportunities</p>
                <p className="text-lg font-semibold text-orange-600">{expiredCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Deleted Today</p>
                <p className="text-lg font-semibold text-red-600">
                  {stats?.deleted_today || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Deleted</p>
                <p className="text-lg font-semibold text-purple-600">
                  {stats?.total_deleted || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-lg font-semibold text-yellow-600">
                  {upcomingExpirations.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Auto-Deletion Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={isEnabled}
              onCheckedChange={handleToggleAutoDeletion}
            />
            <Label>Enable automatic deletion of expired opportunities</Label>
          </div>

          {expiredCount > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                There are {expiredCount} expired opportunities that can be deleted.
                {isEnabled ? ' They will be automatically deleted by the system.' : ' Enable auto-deletion or delete them manually.'}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Dialog open={showUpcoming} onOpenChange={setShowUpcoming}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Clock className="w-4 h-4 mr-2" />
                  Expiring Soon ({upcomingExpirations.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Upcoming Expirations (Next 7 Days)</DialogTitle>
                  <DialogDescription>
                    These opportunities will expire soon and may be deleted automatically.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {upcomingExpirations.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No opportunities expiring in the next 7 days.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[200px]">Title</TableHead>
                            <TableHead className="min-w-[150px]">Organization</TableHead>
                            <TableHead className="min-w-[120px]">Deadline</TableHead>
                            <TableHead className="min-w-[100px]">Days Until Expiry</TableHead>
                          </TableRow>
                        </TableHeader>
                      <TableBody>
                        {upcomingExpirations.map((opportunity) => (
                          <TableRow key={opportunity.id}>
                            <TableCell className="font-medium">{opportunity.title}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Building className="w-4 h-4 text-gray-400" />
                                <span>{opportunity.organization}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span>{formatDate(opportunity.application_deadline)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={opportunity.days_until_expiry <= 2 ? "destructive" : "secondary"}>
                                {formatDaysUntilExpiry(opportunity.days_until_expiry)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showPreview} onOpenChange={setShowPreview}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Expired ({expiredCount})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Expired Opportunities Preview</DialogTitle>
                  <DialogDescription>
                    These opportunities have passed their application deadline and will be deleted.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {expiredPreview.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No expired opportunities found.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[200px]">Title</TableHead>
                            <TableHead className="min-w-[150px]">Organization</TableHead>
                            <TableHead className="min-w-[120px]">Deadline</TableHead>
                            <TableHead className="min-w-[100px]">Days Expired</TableHead>
                          </TableRow>
                        </TableHeader>
                      <TableBody>
                        {expiredPreview.map((opportunity) => (
                          <TableRow key={opportunity.id}>
                            <TableCell className="font-medium">{opportunity.title}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Building className="w-4 h-4 text-gray-400" />
                                <span>{opportunity.organization}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span>{formatDate(opportunity.application_deadline)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="destructive">
                                {formatDaysExpired(opportunity.days_expired)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              onClick={handleManualDeletion} 
              disabled={deleting || expiredCount === 0}
              variant="destructive"
              className="w-full sm:w-auto"
            >
              <Trash2 className={`w-4 h-4 mr-2 ${deleting ? 'animate-spin' : ''}`} />
              {deleting ? 'Deleting...' : `Delete ${expiredCount} Expired`}
            </Button>

            <Dialog open={showLogs} onOpenChange={setShowLogs}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Clock className="w-4 h-4 mr-2" />
                  View Deletion Logs
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Auto-Deletion Logs</DialogTitle>
                  <DialogDescription>
                    History of automatically deleted opportunities.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search by title or organization..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full sm:max-w-sm"
                    />
                  </div>
                  
                  {logs.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No deletion logs found.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[200px]">Title</TableHead>
                            <TableHead className="min-w-[150px]">Organization</TableHead>
                            <TableHead className="min-w-[120px]">Deadline</TableHead>
                            <TableHead className="min-w-[100px]">Days Expired</TableHead>
                            <TableHead className="min-w-[140px]">Deleted At</TableHead>
                          </TableRow>
                        </TableHeader>
                      <TableBody>
                        {logs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-medium">{log.title}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Building className="w-4 h-4 text-gray-400" />
                                <span>{log.organization}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span>{formatDate(log.application_deadline)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {formatDaysExpired(log.days_expired)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span>{formatDate(log.deleted_at)}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Pagination */}
                  {logsTotal > pageSize && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <p className="text-sm text-gray-500 text-center sm:text-left">
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, logsTotal)} of {logsTotal} logs
                      </p>
                      <div className="flex gap-2 justify-center sm:justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => prev + 1)}
                          disabled={currentPage * pageSize >= logsTotal}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Deletion Statistics (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-xl md:text-2xl font-bold text-blue-600">{stats.deleted_today}</p>
                <p className="text-xs md:text-sm text-gray-600">Deleted Today</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-xl md:text-2xl font-bold text-green-600">{stats.deleted_this_week}</p>
                <p className="text-xs md:text-sm text-gray-600">This Week</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-xl md:text-2xl font-bold text-purple-600">{stats.deleted_this_month}</p>
                <p className="text-xs md:text-sm text-gray-600">This Month</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-xl md:text-2xl font-bold text-orange-600">{stats.avg_days_expired}</p>
                <p className="text-xs md:text-sm text-gray-600">Avg Days Expired</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Test */}
      <AutoDeletionTest />

      {/* Voice Chat Test */}
      <VoiceChatTest />
    </div>
  );
};

export default AutoDeletionManager;
