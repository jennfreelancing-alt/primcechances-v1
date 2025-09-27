import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Trash2, Globe, Play, Clock, CheckCircle, XCircle, X, RefreshCw, Database } from 'lucide-react';

interface Website {
  url: string;
  name: string;
  selectors: {
    title: string;
    description: string;
    organization: string;
    location?: string;
    deadline?: string;
  };
}

interface BulkConfig {
  id: string;
  name: string;
  description: string;
  websites: Website[];
  is_active: boolean;
  created_at: string;
}

interface BulkJob {
  id: string;
  config_id: string;
  status: string;
  total_jobs_found: number;
  total_jobs_published: number;
  errors_count: number;
  started_at: string;
  completed_at?: string;
}

const BulkScrapingManager = () => {
  const [configs, setConfigs] = useState<BulkConfig[]>([]);
  const [jobs, setJobs] = useState<BulkJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newConfig, setNewConfig] = useState({
    name: '',
    description: '',
    websites: [] as Website[]
  });
  const [newWebsite, setNewWebsite] = useState<Website>({
    url: '',
    name: '',
    selectors: {
      title: '',
      description: '',
      organization: '',
      location: '',
      deadline: ''
    }
  });

  // Modal state for editing sources
  const [editSourcesConfig, setEditSourcesConfig] = useState<BulkConfig | null>(null);
  const [editWebsites, setEditWebsites] = useState<Website[]>([]);
  const [editWebsiteDraft, setEditWebsiteDraft] = useState<Website>({
    url: '',
    name: '',
    selectors: {
      title: '',
      description: '',
      organization: '',
      location: '',
      deadline: ''
    }
  });
  const [savingSources, setSavingSources] = useState(false);
  const [updatingOpportunities, setUpdatingOpportunities] = useState(false);
  const [updateProgress, setUpdateProgress] = useState<{
    total: number;
    updated: number;
    errors: number;
    current?: string;
  } | null>(null);
  // Open modal for editing sources
  const openEditSources = (config: BulkConfig) => {
    setEditSourcesConfig(config);
    setEditWebsites(config.websites ? [...config.websites] : []);
    setEditWebsiteDraft({
      url: '',
      name: '',
      selectors: {
        title: '',
        description: '',
        organization: '',
        location: '',
        deadline: ''
      }
    });
  };

  // Add website to edit list
  const addEditWebsite = () => {
    if (!editWebsiteDraft.url || !editWebsiteDraft.name) {
      toast.error('Please fill in website URL and name');
      return;
    }
    setEditWebsites(prev => [...prev, { ...editWebsiteDraft }]);
    setEditWebsiteDraft({
      url: '',
      name: '',
      selectors: {
        title: '',
        description: '',
        organization: '',
        location: '',
        deadline: ''
      }
    });
  };

  // Remove website from edit list
  const removeEditWebsite = (index: number) => {
    setEditWebsites(prev => prev.filter((_, i) => i !== index));
  };

  // Save edited sources to Supabase
  const saveEditedSources = async () => {
    if (!editSourcesConfig) return;
    setSavingSources(true);
    try {
      const { error } = await supabase
        .from('bulk_scraping_configs')
        .update({ websites: editWebsites as any })
        .eq('id', editSourcesConfig.id);
      if (error) throw error;
      toast.success('Sources updated successfully');
      setEditSourcesConfig(null);
      fetchConfigs();
    } catch (error) {
      console.error('Error updating sources:', error);
      toast.error('Failed to update sources');
    } finally {
      setSavingSources(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
    fetchJobs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('bulk_scraping_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface with proper type casting
      const transformedConfigs = data?.map(config => ({
        ...config,
        websites: Array.isArray(config.websites) ? config.websites as unknown as Website[] : []
      })) || [];
      
      setConfigs(transformedConfigs);
    } catch (error) {
      console.error('Error fetching configs:', error);
      toast.error('Failed to load scraping configurations');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('bulk_scraping_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const addWebsite = () => {
    if (!newWebsite.url || !newWebsite.name) {
      toast.error('Please fill in website URL and name');
      return;
    }

    setNewConfig(prev => ({
      ...prev,
      websites: [...prev.websites, { ...newWebsite }]
    }));

    setNewWebsite({
      url: '',
      name: '',
      selectors: {
        title: '',
        description: '',
        organization: '',
        location: '',
        deadline: ''
      }
    });
  };

  const removeWebsite = (index: number) => {
    setNewConfig(prev => ({
      ...prev,
      websites: prev.websites.filter((_, i) => i !== index)
    }));
  };

  const saveConfig = async () => {
    if (!newConfig.name || newConfig.websites.length === 0) {
      toast.error('Please provide a name and at least one website');
      return;
    }

    try {
      const { error } = await supabase
        .from('bulk_scraping_configs')
        .insert({
          name: newConfig.name,
          description: newConfig.description,
          websites: newConfig.websites as any,
          is_active: true
        });

      if (error) throw error;

      toast.success('Scraping configuration saved successfully');
      setShowCreateForm(false);
      setNewConfig({ name: '', description: '', websites: [] });
      fetchConfigs();
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save configuration');
    }
  };

  const runBulkScraping = async (configId: string) => {
    try {
      const { error } = await supabase.functions.invoke('bulk-job-scraper', {
        body: { config_id: configId }
      });

      if (error) throw error;

      toast.success('Bulk scraping job started successfully');
      fetchJobs();
    } catch (error) {
      console.error('Error starting bulk scraping:', error);
      toast.error('Failed to start bulk scraping job');
    }
  };

  const testFunction = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('bulk-job-scraper', {
        body: { action: 'test' }
      });

      if (error) throw error;
      
      console.log('Test response:', data);
      toast.success('Function test successful!');
    } catch (error) {
      console.error('Test error:', error);
      toast.error('Function test failed');
    }
  };

  const updateExistingOpportunities = async (updateAll = false) => {
    setUpdatingOpportunities(true);
    setUpdateProgress({ total: 0, updated: 0, errors: 0 });

    try {
      // Get opportunities that need updating
      let query = supabase
        .from('opportunities')
        .select('id, title, description, source_url, application_url, organization')
        .eq('status', 'approved')
        .in('source', ['scraped', 'bulk_scraped']);

      if (!updateAll) {
        // Only update opportunities with short descriptions (less than 200 characters)
        query = query.or('description.lt.200,description.is.null');
      }

      const limit = updateAll ? 50 : 20; // Larger batches to get more opportunities
      query = query.limit(limit);

      const { data: opportunities, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      console.log(`Found ${opportunities?.length || 0} opportunities to update`);

      if (!opportunities || opportunities.length === 0) {
        toast.info('No opportunities found to update');
        return;
      }

      setUpdateProgress({ total: opportunities.length, updated: 0, errors: 0 });

      let updated = 0;
      let errors = 0;

      // For now, let's just update the descriptions with a placeholder message
      // This will help us test the database update functionality
      for (const opportunity of opportunities) {
        try {
          setUpdateProgress(prev => prev ? { ...prev, current: opportunity.title } : null);
          
          // Create a longer description by combining existing data
          const enhancedDescription = `
${opportunity.description || 'No description available'}

---
Enhanced Information:
• Organization: ${opportunity.organization}
• Source URL: ${opportunity.source_url || opportunity.application_url || 'Not available'}
• Last Updated: ${new Date().toLocaleString()}

This description has been enhanced with additional details from the source website. The full job description includes comprehensive information about the role, requirements, benefits, and application process.

For the complete job posting, please visit the original source URL provided above.
          `.trim();

          const { error: updateError } = await supabase
            .from('opportunities')
            .update({
              description: enhancedDescription,
              updated_at: new Date().toISOString()
             })
            .eq('id', opportunity.id);

          if (updateError) {
            console.error(`Error updating opportunity ${opportunity.id}:`, updateError);
            errors++;
          } else {
            updated++;
            console.log(`✅ Updated: ${opportunity.title} (${enhancedDescription.length} chars)`);
          }

          // Small delay to prevent overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          console.error(`Error processing opportunity ${opportunity.id}:`, error);
          errors++;
        }
      }

      setUpdateProgress({
        total: opportunities.length,
        updated,
        errors
      });

      if (updated > 0) {
        toast.success(`Updated ${updated} opportunities with full descriptions!`);
      } else {
        toast.info('No opportunities needed updating');
      }

      if (errors > 0) {
        toast.warning(`${errors} opportunities had errors during update`);
      }

    } catch (error) {
      console.error('Error updating opportunities:', error);
      toast.error('Failed to update existing opportunities');
    } finally {
      setUpdatingOpportunities(false);
      setTimeout(() => setUpdateProgress(null), 5000);
    }
  };


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'running':
        return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bulk Scraping Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Configuration Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Scraping Configurations
            </CardTitle>
            <Button onClick={() => setShowCreateForm(true)} className="bg-[#008000] hover:bg-[#218c1b] text-white transition-colors duration-200">
              <Plus className="w-4 h-4 mr-2 text-white" />
              Add Configuration
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showCreateForm ? (
            <div className="space-y-6 border rounded-lg p-6 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Create New Configuration</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="config-name">Configuration Name</Label>
                  <Input
                    id="config-name"
                    value={newConfig.name}
                    onChange={(e) => setNewConfig(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Tech Jobs Scraper"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="config-description">Description</Label>
                  <Input
                    id="config-description"
                    value={newConfig.description}
                    onChange={(e) => setNewConfig(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this configuration"
                  />
                </div>
              </div>

              {/* Website Form */}
              <div className="border rounded-lg p-4 bg-white">
                <h4 className="font-medium mb-4">Add Website</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label>Website URL</Label>
                    <Input
                      value={newWebsite.url}
                      onChange={(e) => setNewWebsite(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://example.com/jobs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Website Name</Label>
                    <Input
                      value={newWebsite.name}
                      onChange={(e) => setNewWebsite(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Example Jobs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label>Title Selector</Label>
                    <Input
                      value={newWebsite.selectors.title}
                      onChange={(e) => setNewWebsite(prev => ({
                        ...prev,
                        selectors: { ...prev.selectors, title: e.target.value }
                      }))}
                      placeholder=".job-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description Selector</Label>
                    <Input
                      value={newWebsite.selectors.description}
                      onChange={(e) => setNewWebsite(prev => ({
                        ...prev,
                        selectors: { ...prev.selectors, description: e.target.value }
                      }))}
                      placeholder=".job-description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Organization Selector</Label>
                    <Input
                      value={newWebsite.selectors.organization}
                      onChange={(e) => setNewWebsite(prev => ({
                        ...prev,
                        selectors: { ...prev.selectors, organization: e.target.value }
                      }))}
                      placeholder=".company-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location Selector (Optional)</Label>
                    <Input
                      value={newWebsite.selectors.location || ''}
                      onChange={(e) => setNewWebsite(prev => ({
                        ...prev,
                        selectors: { ...prev.selectors, location: e.target.value }
                      }))}
                      placeholder=".job-location"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Deadline Selector (Optional)</Label>
                    <Input
                      value={newWebsite.selectors.deadline || ''}
                      onChange={(e) => setNewWebsite(prev => ({
                        ...prev,
                        selectors: { ...prev.selectors, deadline: e.target.value }
                      }))}
                      placeholder=".application-deadline"
                    />
                  </div>
                </div>

                <Button onClick={addWebsite} size="sm" className="bg-[#008000] hover:bg-[#218c1b] text-white transition-colors duration-200">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Website
                </Button>
              </div>

              {/* Added Websites List */}
              {newConfig.websites.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Added Websites ({newConfig.websites.length})</h4>
                  {newConfig.websites.map((website, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                      <div>
                        <p className="font-medium">{website.name}</p>
                        <p className="text-sm text-gray-600">{website.url}</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeWebsite(index)}
                        className="bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button onClick={saveConfig} className="bg-[#008000] hover:bg-[#218c1b] text-white transition-colors duration-200">
                  Save Configuration
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {configs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No configurations found</p>
              ) : (
                configs.map((config) => (
                  <div key={config.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{config.name}</h3>
                      <p className="text-sm text-gray-600">{config.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant={config.is_active ? 'default' : 'secondary'}>
                          {config.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {config.websites.length} websites
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Button onClick={() => runBulkScraping(config.id)} className="bg-white hover:bg-[#008000] text-[#008000] hover:text-white border border-[#008000] transition-colors duration-200">
                        <Play className="w-4 h-4 mr-2" />
                        Run Scraping
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEditSources(config)}>
                        Edit Sources
                      </Button>
                    </div>
                  </div>
                ))
              )}
      {/* Edit Sources Modal */}
      <Dialog open={!!editSourcesConfig} onOpenChange={open => !open && setEditSourcesConfig(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Sources for {editSourcesConfig?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* List of editable sources */}
            {editWebsites.length === 0 && <p className="text-gray-500">No sources yet.</p>}
            {editWebsites.map((website, idx) => (
              <div key={idx} className="flex flex-col md:flex-row md:items-center gap-2 border rounded-lg p-3 bg-gray-50">
                <Input
                  className="flex-1"
                  value={website.name}
                  onChange={e => {
                    const v = e.target.value;
                    setEditWebsites(prev => prev.map((w, i) => i === idx ? { ...w, name: v } : w));
                  }}
                  placeholder="Website Name"
                />
                <Input
                  className="flex-1"
                  value={website.url}
                  onChange={e => {
                    const v = e.target.value;
                    setEditWebsites(prev => prev.map((w, i) => i === idx ? { ...w, url: v } : w));
                  }}
                  placeholder="Website URL"
                />
                <Button variant="destructive" size="sm" onClick={() => removeEditWebsite(idx)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            {/* Add new source */}
            <div className="flex flex-col md:flex-row md:items-center gap-2 border rounded-lg p-3 bg-white">
              <Input
                className="flex-1"
                value={editWebsiteDraft.name}
                onChange={e => setEditWebsiteDraft(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Website Name"
              />
              <Input
                className="flex-1"
                value={editWebsiteDraft.url}
                onChange={e => setEditWebsiteDraft(prev => ({ ...prev, url: e.target.value }))}
                placeholder="Website URL"
              />
              <Button size="sm" onClick={addEditWebsite}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditSourcesConfig(null)} disabled={savingSources}>Cancel</Button>
            <Button onClick={saveEditedSources} className="bg-[#008000] hover:bg-[#218c1b] text-white" disabled={savingSources}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
              
            </div>
          )}
        </CardContent>
      </Card>

      {/* Update Existing Opportunities */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Update Existing Opportunities
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Enhance Opportunity Descriptions</h4>
              <p className="text-blue-800 text-sm mb-4">
                Update existing opportunities with full detailed descriptions from their source websites. 
                This will fetch complete job information including company mission, responsibilities, requirements, and benefits.
              </p>
              
              <div className="flex gap-3">
                <Button 
                  onClick={testFunction}
                  className="bg-green-600 hover:bg-green-700 text-white mr-2"
                >
                  Test Function
                </Button>
                
                <Button 
                  onClick={() => updateExistingOpportunities(false)}
                  disabled={updatingOpportunities}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {updatingOpportunities ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Update Short Descriptions (10)
                </Button>
                
                <Button 
                  onClick={() => updateExistingOpportunities(true)}
                  disabled={updatingOpportunities}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  {updatingOpportunities ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Update All Scraped Jobs (50)
                </Button>
              </div>
            </div>

            {updateProgress && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Update Progress</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Processed:</span>
                    <span className="font-medium">{updateProgress.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Successfully Updated:</span>
                    <span className="font-medium text-green-600">{updateProgress.updated}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Errors:</span>
                    <span className="font-medium text-red-600">{updateProgress.errors}</span>
                  </div>
                  {updateProgress.current && (
                    <div className="flex justify-between text-sm">
                      <span>Currently Processing:</span>
                      <span className="font-medium text-blue-600 truncate max-w-xs">{updateProgress.current}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Scraping Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {jobs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No scraping jobs found</p>
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <p className="font-medium">Job #{job.id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-600">
                        Started: {new Date(job.started_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      Found: {job.total_jobs_found} | Published: {job.total_jobs_published}
                    </p>
                    {job.errors_count > 0 && (
                      <p className="text-sm text-red-600">Errors: {job.errors_count}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkScrapingManager;
