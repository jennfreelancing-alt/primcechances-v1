import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Eye, 
  FileText, 
  User, 
  Calendar, 
  Building,
  Search,
  Download,
  Trash2,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ApplicationDetail {
  id: string;
  user_id: string;
  opportunity_id: string;
  opportunity_title: string;
  organization: string;
  cover_letter: string;
  resume_filename?: string;
  additional_documents?: string[];
  applied_at: string;
  created_at: string;
  updated_at: string;
  user_profiles?: {
    full_name: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  opportunity?: {
    title: string;
    organization: string;
    location?: string;
    salary_range?: string;
    application_url?: string;
  };
}

const ApplicationDetailsManager = () => {
  const [applications, setApplications] = useState<ApplicationDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<ApplicationDetail | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('application_details')
        .select(`
          *,
          user_profiles!inner(full_name, email, phone, location),
          opportunity:opportunities(title, organization, location, salary_range, application_url)
        `)
        .order('applied_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our interface
      const transformedData: ApplicationDetail[] = data?.map(item => {
        // Handle user_profiles data safely
        const userProfile = Array.isArray(item.user_profiles) 
          ? item.user_profiles[0] 
          : item.user_profiles;

        return {
          id: item.id,
          user_id: item.user_id,
          opportunity_id: item.opportunity_id,
          opportunity_title: item.opportunity_title,
          organization: item.organization,
          cover_letter: item.cover_letter,
          resume_filename: item.resume_filename || undefined,
          additional_documents: item.additional_documents || undefined,
          applied_at: item.applied_at || new Date().toISOString(),
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString(),
          user_profiles: {
            full_name: userProfile?.full_name || 'Unknown User',
            email: userProfile?.email || '',
            phone: userProfile?.phone || '',
            location: userProfile?.location || ''
          },
          opportunity: item.opportunity ? {
            title: item.opportunity.title,
            organization: item.opportunity.organization,
            location: item.opportunity.location,
            salary_range: item.opportunity.salary_range,
            application_url: item.opportunity.application_url
          } : undefined
        };
      }) || [];

      setApplications(transformedData);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app =>
    app.opportunity_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.user_profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.user_profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (application: ApplicationDetail) => {
    setSelectedApplication(application);
    setIsDetailModalOpen(true);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
          <p className="text-gray-600">View detailed application submissions from users</p>
        </div>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {applications.length} Total Applications
        </Badge>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search by opportunity, organization, applicant name, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Applications List */}
      <div className="grid gap-6">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Applications Found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'No applications match your search criteria.' : 'No application details available yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <CardTitle className="text-lg text-blue-600">{application.opportunity_title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {application.organization}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {application.user_profiles?.full_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(application.applied_at)}
                      </div>
                    </div>
                    {application.user_profiles?.email && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Mail className="w-4 h-4" />
                        {application.user_profiles.email}
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewDetails(application)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Cover Letter Preview */}
                <div>
                  <h4 className="font-semibold mb-2 text-gray-700">Cover Letter Preview</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {application.cover_letter}
                    </p>
                  </div>
                </div>

                {/* Documents */}
                {(application.resume_filename || application.additional_documents?.length > 0) && (
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-700">Documents</h4>
                    <div className="flex flex-wrap gap-2">
                      {application.resume_filename && (
                        <Badge variant="outline" className="flex items-center gap-1 bg-blue-50">
                          <FileText className="w-3 h-3" />
                          Resume: {application.resume_filename}
                        </Badge>
                      )}
                      {application.additional_documents?.map((doc, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1 bg-green-50">
                          <FileText className="w-3 h-3" />
                          {doc}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedApplication && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Application Details
                </DialogTitle>
                <p className="text-gray-600">
                  {selectedApplication.opportunity_title} at {selectedApplication.organization}
                </p>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Applicant Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Applicant Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Full Name</label>
                        <p className="text-gray-900">{selectedApplication.user_profiles?.full_name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Email</label>
                        <p className="text-gray-900">{selectedApplication.user_profiles?.email || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Phone</label>
                        <p className="text-gray-900">{selectedApplication.user_profiles?.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Location</label>
                        <p className="text-gray-900">{selectedApplication.user_profiles?.location || 'Not provided'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Opportunity Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      Opportunity Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Position</label>
                        <p className="text-gray-900">{selectedApplication.opportunity_title}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Organization</label>
                        <p className="text-gray-900">{selectedApplication.organization}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Location</label>
                        <p className="text-gray-900">{selectedApplication.opportunity?.location || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Salary Range</label>
                        <p className="text-gray-900">{selectedApplication.opportunity?.salary_range || 'Not specified'}</p>
                      </div>
                    </div>
                    {selectedApplication.opportunity?.application_url && (
                      <div className="pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(selectedApplication.opportunity?.application_url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Original Job Posting
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Application Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Application Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Applied At</label>
                        <p className="text-gray-900">{formatDate(selectedApplication.applied_at)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Application ID</label>
                        <p className="text-gray-900 font-mono text-sm">{selectedApplication.id}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cover Letter */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Cover Letter
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedApplication.cover_letter}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Documents */}
                {(selectedApplication.resume_filename || selectedApplication.additional_documents?.length > 0) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Download className="w-5 h-5" />
                        Documents
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedApplication.resume_filename && (
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">Resume</span>
                            <span className="text-sm text-gray-600">({selectedApplication.resume_filename})</span>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      )}
                      {selectedApplication.additional_documents?.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-green-600" />
                            <span className="font-medium">Additional Document {index + 1}</span>
                            <span className="text-sm text-gray-600">({doc})</span>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApplicationDetailsManager;
