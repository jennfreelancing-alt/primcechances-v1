import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Play, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { autoDeletionService } from '@/services/autoDeletionService';

const AutoDeletionTest: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<{
    expiredCount: number;
    isEnabled: boolean;
    stats: any;
    preview: any[];
  } | null>(null);

  const runTests = async () => {
    setTesting(true);
    try {
      const [expiredCount, isEnabled, stats, preview] = await Promise.all([
        autoDeletionService.getExpiredOpportunitiesCount(),
        autoDeletionService.isAutoDeletionEnabled(),
        autoDeletionService.getAutoDeletionStats(),
        autoDeletionService.getExpiredOpportunitiesPreview()
      ]);

      setTestResults({
        expiredCount,
        isEnabled,
        stats,
        preview
      });

      toast.success('Auto-deletion system test completed successfully!');
    } catch (error) {
      console.error('Test error:', error);
      toast.error('Test failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="w-5 h-5" />
          Auto-Deletion System Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          This test will verify that the auto-deletion system is working correctly by checking:
        </p>
        
        <ul className="text-sm text-gray-600 space-y-1 ml-4">
          <li>• Database connection and permissions</li>
          <li>• Expired opportunities detection</li>
          <li>• Feature toggle status</li>
          <li>• Statistics retrieval</li>
          <li>• Preview functionality</li>
        </ul>

        <Button 
          onClick={runTests} 
          disabled={testing}
          className="w-full"
        >
          {testing ? 'Running Tests...' : 'Run System Test'}
        </Button>

        {testResults && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                System test completed successfully! All components are working correctly.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xl md:text-2xl font-bold text-blue-600">{testResults.expiredCount}</p>
                <p className="text-xs md:text-sm text-gray-600">Expired Opportunities</p>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Badge variant={testResults.isEnabled ? "default" : "secondary"}>
                  {testResults.isEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
                <p className="text-xs md:text-sm text-gray-600 mt-1">Auto-Deletion Status</p>
              </div>
            </div>

            {testResults.stats && (
              <div className="space-y-2">
                <h4 className="font-semibold">Statistics (Last 30 Days)</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                  <div className="text-center p-2 bg-green-50 rounded">
                    <p className="font-bold text-green-600">{testResults.stats.deleted_today}</p>
                    <p className="text-xs text-gray-600">Today</p>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <p className="font-bold text-blue-600">{testResults.stats.deleted_this_week}</p>
                    <p className="text-xs text-gray-600">This Week</p>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded">
                    <p className="font-bold text-purple-600">{testResults.stats.deleted_this_month}</p>
                    <p className="text-xs text-gray-600">This Month</p>
                  </div>
                  <div className="text-center p-2 bg-orange-50 rounded">
                    <p className="font-bold text-orange-600">{testResults.stats.avg_days_expired}</p>
                    <p className="text-xs text-gray-600">Avg Days</p>
                  </div>
                </div>
              </div>
            )}

            {testResults.preview.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Expired Opportunities Preview</h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {testResults.preview.slice(0, 5).map((opp, index) => (
                    <div key={index} className="text-xs p-2 bg-red-50 rounded border-l-2 border-red-200">
                      <p className="font-medium">{opp.title}</p>
                      <p className="text-gray-600">{opp.organization} • {opp.days_expired} days expired</p>
                    </div>
                  ))}
                  {testResults.preview.length > 5 && (
                    <p className="text-xs text-gray-500 text-center">
                      ... and {testResults.preview.length - 5} more
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AutoDeletionTest;
