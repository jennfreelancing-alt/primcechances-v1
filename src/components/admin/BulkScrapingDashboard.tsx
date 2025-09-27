
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Play, 
  RefreshCw, 
  Globe, 
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  Settings
} from 'lucide-react';
import { Json } from '@/integrations/supabase/types';

interface BulkConfig {
  id: string;
  name: string;
  description: string;
  websites: Json;
  is_active: boolean;
  created_at: string;
}

interface BulkJob {
  id: string;
  config_id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  total_jobs_found: number;
  total_jobs_published: number;
  errors_count: number;
  results: any;
  error_message: string | null;
  bulk_scraping_configs: { name: string };
}

const BulkScrapingDashboard = () => {
  const [configs, setConfigs] = useState<BulkConfig[]>([]);
  const [jobs, setJobs] = useState<BulkJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    
    // Set up real-time updates for jobs
    const subscription = supabase
      .channel('bulk_scraping_jobs')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'bulk_scraping_jobs' 
      }, () => {
        fetchJobs();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchData = async () => {
    await Promise.all([fetchConfigs(), fetchJobs()]);
    setLoading(false);
  };

  const fetchConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('bulk_scraping_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Error fetching configs:', error);
      toast.error('Failed to load configurations');
    }
  };

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('bulk_scraping_jobs')
        .select(`
          *,
          bulk_scraping_configs (name)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    }
  };

  const startBulkScraping = async (configId: string) => {
    setScraping(configId);
    try {
      const { error } = await supabase.functions.invoke('bulk-job-scraper', {
        body: { config_id: configId }
      });

      if (error) throw error;

      toast.success('Bulk scraping job started successfully');
      setTimeout(fetchJobs, 2000);
    } catch (error) {
      console.error('Error starting bulk scraping:', error);
      toast.error('Failed to start bulk scraping job');
    } finally {
      setScraping(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'running':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const parseWebsites = (websites: Json): any[] => {
    if (Array.isArray(websites)) {
      return websites;
    }
    if (typeof websites === 'string') {
      try {
        return JSON.parse(websites);
      } catch {
        return [];
      }
    }
    return [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Bulk Job Scraping</h2>
          <p className="text-gray-600">Scrape job listings from multiple websites simultaneously</p>
        </div>
      </div>

      <Tabs defaultValue="configs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="configs">Configurations</TabsTrigger>
          <TabsTrigger value="jobs">Recent Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="configs">
          <div className="grid gap-6">
            {configs.map((config) => {
              const websites = parseWebsites(config.websites);
              return (
                <Card key={config.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="w-5 h-5" />
                          {config.name}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{config.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={config.is_active ? "default" : "secondary"}>
                          {config.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button
                          onClick={() => startBulkScraping(config.id)}
                          disabled={scraping === config.id || !config.is_active}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {scraping === config.id ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4 mr-2" />
                          )}
                          {scraping === config.id ? 'Starting...' : 'Start Scraping'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Target Websites ({websites.length}):</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {websites.map((website, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between">
                                <h5 className="font-medium">{website.name}</h5>
                                <Badge variant="outline">{website.type}</Badge>
                              </div>
                              <p className="text-sm text-gray-600 mt-1 truncate">{website.url}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bulk Scraping Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(job.status)}
                      <div>
                        <h3 className="font-medium">{job.bulk_scraping_configs?.name}</h3>
                        <p className="text-sm text-gray-600">
                          Started: {new Date(job.started_at).toLocaleString()}
                        </p>
                        {job.completed_at && (
                          <p className="text-sm text-gray-600">
                            Completed: {new Date(job.completed_at).toLocaleString()}
                          </p>
                        )}
                        {job.error_message && (
                          <p className="text-sm text-red-600 mt-1">{job.error_message}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                      <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                        <div className="text-center">
                          <div className="font-medium">{job.total_jobs_found}</div>
                          <div className="text-gray-500">Found</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{job.total_jobs_published}</div>
                          <div className="text-gray-500">Published</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{job.errors_count}</div>
                          <div className="text-gray-500">Errors</div>
                        </div>
                      </div>
                      {job.results && (
                        <div className="mt-2 text-xs text-gray-500">
                          <details>
                            <summary className="cursor-pointer">View Details</summary>
                            <div className="mt-2 p-2 bg-gray-50 rounded text-left">
                              {Object.entries(job.results).map(([site, result]: [string, any]) => (
                                <div key={site} className="mb-1">
                                  <strong>{site}:</strong> {result.found} found, {result.published} published
                                  {result.error && <span className="text-red-600"> - {result.error}</span>}
                                </div>
                              ))}
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BulkScrapingDashboard;
